import { Component } from '@angular/core';

@Component({
  selector: 'app-screen-loading',
  standalone: true,
  template: `
    <div class="ScreenLoading">
      <div class="ScreenLoadingSpinner"></div>
      <span>Загрузка...</span>
    </div>
  `,
  styles: [`
    .ScreenLoading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: 180px;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
    }
    .ScreenLoadingSpinner {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #dbe6f5;
      border-top-color: #2563eb;
      animation: ScreenLoadingSpin 0.8s linear infinite;
    }
    @keyframes ScreenLoadingSpin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ScreenLoadingComponent {}
