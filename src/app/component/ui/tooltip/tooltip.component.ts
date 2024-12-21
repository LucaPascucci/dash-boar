import { Component, Input } from '@angular/core';
import { NgClass } from "@angular/common";

@Component({
  selector: 'tooltip',
  standalone: true,
  templateUrl: './tooltip.component.html',
  imports: [
    NgClass
  ],
  styleUrl: './tooltip.component.css'
})
export class TooltipComponent {
  @Input() text = '';
  @Input() left = 0;
  @Input() top = 0;

}
