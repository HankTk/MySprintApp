import { Directive, Input, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';

/**
 * Reusable tooltip directive
 * Provides consistent tooltip behavior
 */
@Directive({
  selector: '[axTooltip]',
  standalone: true,
  hostDirectives: [
    {
      directive: MatTooltip,
      inputs: ['matTooltip: axTooltip', 'matTooltipPosition: axTooltipPosition', 'matTooltipDisabled: axTooltipDisabled', 'matTooltipShowDelay: axTooltipShowDelay', 'matTooltipHideDelay: axTooltipHideDelay']
    }
  ]
})
export class AxTooltipDirective
{
  @Input() axTooltip?: string;
  @Input() axTooltipPosition: TooltipPosition = 'below';
  @Input() axTooltipDisabled = false;
  @Input() axTooltipShowDelay = 0;
  @Input() axTooltipHideDelay = 0;
}
