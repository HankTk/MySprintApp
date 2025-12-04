import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StoreService {

  private state = signal<Record<string, any>>({});

  set(resource: string, data: any) {
    this.state.update(s => ({ ...s, [resource]: data }));
  }

  select(resource: string) {
    return () => this.state()[resource];
  }

}
