import { DOCUMENT } from '@angular/common';
import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
  ViewContainerRef,
} from '@angular/core';
import { TooltipComponent } from "./tooltip.component";
import { Tooltip } from "./tooltip";
import { TooltipPosition } from "./tooltip.enums";

@Directive({
  selector: '[tooltip]',
  standalone: true
})
export class TooltipDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);

  @Input() tooltipData: Tooltip | undefined;
  @Input() tooltipPosition: TooltipPosition = TooltipPosition.BELOW;

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
    /* this.hideTooltipTimeout = setTimeout(() => {
      this.removeTooltip();
    }, 1000);*/
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

    this.tooltipComponent.instance.data = this.tooltipData;
    this.tooltipComponent.instance.position = this.tooltipPosition;

    const {left, right, top, bottom} = this.elementRef.nativeElement.getBoundingClientRect();

    switch (this.tooltipPosition) {
      case TooltipPosition.BELOW: {
        this.tooltipComponent.instance.left = Math.round((right - left) / 2 + left);
        this.tooltipComponent.instance.top = Math.round(bottom);
        break;
      }
      case TooltipPosition.ABOVE: {
        this.tooltipComponent.instance.left = Math.round((right - left) / 2 + left);
        this.tooltipComponent.instance.top = Math.round(top);
        break;
      }
      case TooltipPosition.RIGHT: {
        this.tooltipComponent.instance.left = Math.round(right);
        this.tooltipComponent.instance.top = Math.round(top + (bottom - top) / 2);
        break;
      }
      case TooltipPosition.LEFT: {
        this.tooltipComponent.instance.left = Math.round(left);
        this.tooltipComponent.instance.top = Math.round(top + (bottom - top) / 2);
        break;
      }
      default: {
        break;
      }
    }
  }
}
