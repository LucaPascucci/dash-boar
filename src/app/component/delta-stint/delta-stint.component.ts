import { Component, computed, inject, Signal } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";
import { DeltaStintService } from "../../service/delta-stint.service";
import { DeltaStint } from "../../model/delta-stint";
import { StintService } from "../../service/stint.service";
import { millisecondsToTimeString } from "../../util/date.util";
import { TooltipDirective } from "../ui/tooltip/tooltip.directive";
import { Tooltip } from "../ui/tooltip/tooltip";
import { TooltipPosition } from '../ui/tooltip/tooltip.enums';

@Component({
  selector: 'app-delta-stint',
  imports: [
    NgForOf,
    NgClass,
    TooltipDirective
  ],
  templateUrl: './delta-stint.component.html',
  styleUrl: './delta-stint.component.css'
})
export class DeltaStintComponent {
  private readonly stintService = inject(StintService);
  private readonly deltaStintService = inject(DeltaStintService);

  readonly deltaStints: Signal<DeltaStint[]> = this.deltaStintService.deltaStints;
  readonly totalDeltaMilliseconds: Signal<number> = this.deltaStintService.totalDeltaMilliseconds;
  readonly deltaMilliseconds: Signal<number> = this.deltaStintService.deltaMilliseconds;

  readonly activeStintId = computed(() => {
    const activeStint = this.stintService.activeStint();
    if (activeStint) {
      return activeStint.id;
    }
    return undefined;
  })

  isOpen: boolean = true;

  protected tooltipInfo: Tooltip = {
    footer: "",
    paragraphs: ["Only completed stint"],
    title: ""
  }
  protected tooltipPosition: TooltipPosition = TooltipPosition.ABOVE;

  getMillisecondsToTimeString(milliseconds: number): string {
    return millisecondsToTimeString(Math.abs(milliseconds));
  }
}
