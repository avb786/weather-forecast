import { Pipe, PipeTransform } from '@angular/core';
import { filter } from "rxjs/operators";

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    console.log('SEARCh', searchText);
    console.log('Itmes', items);
    return items.filter(data => {
      console.log('Datatatat', data);
      return data.toLowerCase().includes(searchText);
    });
  }

}
