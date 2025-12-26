import { Pipe, PipeTransform } from '@angular/core';

/**
 * Currency pipe
 * Formats numbers as currency with configurable locale and currency code
 */
@Pipe({
  name: 'currency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform
{
  transform(
    value: number | string,
    currencyCode = 'USD',
    locale = 'en-US'
  ): string 
{
    if (value == null)
    {
      return '';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue))
    {
      return '';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(numValue);
  }
}
