import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatear fechas de yyyy-mm-dd a dd-mm-yyyy
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Si la fecha está en formato yyyy-mm-dd, convertirla a dd-mm-yyyy
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = value.match(datePattern);

    if (match) {
      const [, year, month, day] = match;
      return `${day}-${month}-${year}`;
    }

    // Si no coincide con el patrón, devolver tal cual
    return value;
  }
}
