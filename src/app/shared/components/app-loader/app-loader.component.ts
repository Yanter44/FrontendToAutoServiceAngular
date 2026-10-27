import { Component, inject } from '@angular/core';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-app-loader',
  standalone: true,
  templateUrl: './app-loader.component.html',
  styleUrls: ['../../../../styles/admin/loader.css']
})
export class AppLoaderComponent {
  readonly loader = inject(LoaderService);
}
