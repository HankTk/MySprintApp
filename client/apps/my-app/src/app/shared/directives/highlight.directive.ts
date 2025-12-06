import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

/**
 * Highlight directive
 * Adds a highlight effect to elements on hover or when active
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() highlightColor = 'yellow';
  private originalColor = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.originalColor = this.el.nativeElement.style.backgroundColor;
    this.renderer.setStyle(
      this.el.nativeElement,
      'backgroundColor',
      this.highlightColor
    );
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'backgroundColor',
      this.originalColor
    );
  }
}
