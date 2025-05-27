import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {

  transform(text: any, by: string, index?: number): string | undefined {
    if (typeof text !== 'string' || !by) {
      console.warn('SplitPipe received a non-string:', text);
      return undefined;
    }

    const arr = text.split(by);
    return index !== undefined ? arr[index] : arr[arr.length - 1];
  }



}
