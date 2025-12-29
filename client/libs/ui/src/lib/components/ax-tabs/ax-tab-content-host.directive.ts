import {Directive, ViewContainerRef, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {Type} from '@angular/core';

@Directive({
  selector: '[axTabContentHost]',
  standalone: true
})
export class AxTabContentHostDirective implements OnInit, OnChanges
{
  @Input() component?: Type<unknown>;
  @Input() componentData?: Record<string, unknown>;

  constructor(public viewContainerRef: ViewContainerRef)
  {
  }

  ngOnInit(): void
  {
    this.loadComponent();
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes['component'] || changes['componentData'])
    {
      this.loadComponent();
    }
  }

  private loadComponent(): void
  {
    if (this.component)
    {
      this.viewContainerRef.clear();
      const componentRef = this.viewContainerRef.createComponent(this.component);
      if (this.componentData && componentRef.instance)
      {
        Object.assign(componentRef.instance, this.componentData);
      }
    }
  }
}

