import { Component, Input } from '@angular/core';
import { Tooltip } from './tooltip';

@Component({
    selector: 'tooltip',
    templateUrl: './tooltip.component.html',
    styleUrl: './tooltip.component.css'
})
export class TooltipComponent {
  @Input() left = 0;
  @Input() top = 0;
  @Input() data: Tooltip | undefined
}
