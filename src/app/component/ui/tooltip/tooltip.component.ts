import { Component, Input } from '@angular/core';
import { Tooltip } from './tooltip';
import { TooltipPosition } from "./tooltip.enums";
import { NgClass } from "@angular/common";

@Component({
  selector: 'tooltip',
  templateUrl: './tooltip.component.html',
  imports: [
    NgClass
  ],
  styleUrl: './tooltip.component.css'
})
export class TooltipComponent {
  @Input() left = 0;
  @Input() top = 0;
  @Input() data: Tooltip | undefined
  @Input() position: TooltipPosition = TooltipPosition.BELOW;

  TooltipPosition = TooltipPosition;
}
