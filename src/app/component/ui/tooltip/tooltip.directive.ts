import { DOCUMENT } from '@angular/common';
import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener, inject,
  Input, ViewContainerRef,
} from '@angular/core';
import { TooltipComponent } from "./tooltip.component";

@Directive({
  selector: '[tooltip]',
  standalone: true
})
export class TooltipDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);

  @Input() tooltipText = '';

  private tooltipComponent?: ComponentRef<TooltipComponent>;
  private hideTooltipTimeout?: any;


  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.tooltipComponent) {
      return;
    }

    this.tooltipComponent = this.viewContainerRef.createComponent(TooltipComponent);
    this.document.body.appendChild(
        this.tooltipComponent.location.nativeElement
    );
    this.setTooltipComponentProperties();
    this.tooltipComponent.hostView.detectChanges();

    // Schedule the tooltip to be removed after 1 second
    this.hideTooltipTimeout = setTimeout(() => {
      this.removeTooltip();
    }, 1000);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.removeTooltip();
  }

  private removeTooltip(): void {
    if (!this.tooltipComponent) {
      return;
    }
    this.tooltipComponent.destroy();
    this.tooltipComponent = undefined;

    // Clear the timeout if the tooltip is removed manually
    if (this.hideTooltipTimeout) {
      clearTimeout(this.hideTooltipTimeout);
      this.hideTooltipTimeout = undefined;
    }
  }

  private setTooltipComponentProperties() {
    if (!this.tooltipComponent) {
      return;
    }

    this.tooltipComponent.instance.text = this.tooltipText;

    const elementRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipElement = this.tooltipComponent.location.nativeElement;
    const tooltipRect = tooltipElement.getBoundingClientRect();

    // Calculate initial position
    let left = (elementRect.right - elementRect.left) / 2 + elementRect.left - tooltipRect.width / 2;
    let top = elementRect.bottom;

    // Adjust position if tooltip goes beyond the right edge of the screen
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width;
    }

    // Adjust position if tooltip goes beyond the left edge of the screen
    if (left < 0) {
      left = 0;
    }

    // Adjust position if tooltip goes beyond the bottom edge of the screen
    if (top + tooltipRect.height > window.innerHeight) {
      top = elementRect.top - tooltipRect.height;
    }

    // Set the adjusted position
    this.tooltipComponent.instance.left = left;
    this.tooltipComponent.instance.top = top;
  }
}
