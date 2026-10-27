import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  inject,
  ViewChild,
  ViewEncapsulation,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromptDto, PromptTagSelection } from '../../../core/model';

@Component({
  selector: 'app-prompt-tags-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './prompt-tags-input.component.html',
  styleUrls: ['./prompt-tags-input.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PromptTagsInputComponent implements AfterViewInit, OnDestroy {
  readonly whitelist = input<PromptDto[]>([]);
  readonly tags = input<PromptTagSelection[]>([]);
  readonly placeholder = input('Введите теги');
  readonly maxTags = input(30);
  readonly tagsChange = output<PromptTagSelection[]>();

  @Input() id = 'EditApplicationPhotoTagsInput';

  private readonly host = inject(ElementRef<HTMLElement>);

  @ViewChild('field') field?: ElementRef<HTMLElement>;
  @ViewChild('draftInput') draftInput?: ElementRef<HTMLInputElement>;
  @ViewChild('dropdown') dropdown?: ElementRef<HTMLElement>;

  readonly draft = signal('');
  readonly focused = signal(false);
  readonly activeIndex = signal(0);
  dropdownTop = 0;
  dropdownLeft = 0;
  dropdownWidth = 0;

  readonly selectedIds = computed(() => new Set(this.tags().map(tag => tag.promptId)));

  readonly suggestions = computed(() => {
    const query = this.draft().trim().toLowerCase();
    if (query.length < 1) return [];
    const selected = this.selectedIds();
    return this.whitelist()
      .filter(prompt => !selected.has(prompt.promptId) && prompt.tag.toLowerCase().includes(query))
      .slice(0, 10);
  });

  readonly dropdownOpen = computed(() => this.focused() && this.suggestions().length > 0);

  constructor() {
    effect(() => {
      this.suggestions();
      this.activeIndex.set(0);
      if (this.dropdownOpen()) {
        queueMicrotask(() => this.updateDropdownPosition());
      }
    });
    document.addEventListener('scroll', this.onViewportChange, true);
  }

  ngAfterViewInit(): void {
    const dropdown = this.dropdown?.nativeElement;
    if (dropdown) document.body.appendChild(dropdown);
  }

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.onViewportChange, true);
    const dropdown = this.dropdown?.nativeElement;
    if (dropdown?.parentElement === document.body) {
      this.host.nativeElement.appendChild(dropdown);
    }
  }

  focusInput(): void {
    this.draftInput?.nativeElement.focus();
  }

  onDraftChange(value: string): void {
    this.draft.set(value);
  }

  onFocus(): void {
    this.focused.set(true);
    this.updateDropdownPosition();
  }

  onBlur(): void {
    this.focused.set(false);
    this.draft.set('');
  }

  onKeydown(event: KeyboardEvent): void {
    const suggestions = this.suggestions();
    if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault();
      this.activeIndex.update(index => (index + 1) % suggestions.length);
      return;
    }
    if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault();
      this.activeIndex.update(index => (index - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (event.key === 'Escape') {
      this.draft.set('');
      return;
    }
    if (event.key === 'Backspace' && !this.draft() && this.tags().length) {
      this.remove(this.tags()[this.tags().length - 1].promptId);
      return;
    }
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.commitFromDraft();
    }
  }

  select(prompt: PromptDto): void {
    this.add(prompt);
    this.draft.set('');
    this.focusInput();
  }

  remove(promptId: number): void {
    this.tagsChange.emit(this.tags().filter(tag => tag.promptId !== promptId));
  }

  @HostListener('window:resize')
  onResize(): void {
    this.onViewportChange();
  }

  onViewportChange = (): void => {
    if (this.dropdownOpen()) this.updateDropdownPosition();
  };

  private commitFromDraft(): void {
    const suggestions = this.suggestions();
    if (suggestions.length) {
      const prompt = suggestions[this.activeIndex()] ?? suggestions[0];
      this.select(prompt);
      return;
    }
    const exact = this.matchExact(this.draft());
    if (exact) this.select(exact);
  }

  private matchExact(value: string): PromptDto | undefined {
    const query = value.trim().toLowerCase();
    if (!query) return undefined;
    const selected = this.selectedIds();
    return this.whitelist().find(prompt => !selected.has(prompt.promptId) && prompt.tag.toLowerCase() === query);
  }

  private add(prompt: PromptDto): void {
    if (this.tags().length >= this.maxTags()) return;
    if (this.selectedIds().has(prompt.promptId)) return;
    this.tagsChange.emit([...this.tags(), { value: prompt.tag, promptId: prompt.promptId }]);
  }

  private updateDropdownPosition(): void {
    const el = this.field?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.dropdownTop = rect.bottom - 1;
    this.dropdownLeft = rect.left;
    this.dropdownWidth = rect.width;
  }
}
