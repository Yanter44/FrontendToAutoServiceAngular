import { Pipe, PipeTransform } from '@angular/core';
import { dateTimeFormatter } from '../../core/utils/helpers';

@Pipe({ name: 'ruDate', standalone: true })
export class RuDatePipe implements PipeTransform {
  transform(value?: string | null, withTime = false): string {
    return withTime ? dateTimeFormatter.formatDateTime(value) : dateTimeFormatter.formatDate(value);
  }
}
