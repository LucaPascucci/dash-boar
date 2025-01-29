import { Component, computed, inject, Signal } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";
import { DeltaStintService } from "../../service/delta-stint.service";
import { DeltaStint } from "../../model/delta-stint";
import { StintService } from "../../service/stint.service";
import { millisecondsToTimeString } from "../../util/date.util";

@Component({
    selector: 'app-delta-stint',
    imports: [
        NgForOf,
        NgClass
    ],
    templateUrl: './delta-stint.component.html',
    styleUrl: './delta-stint.component.css'
})
export class DeltaStintComponent {
  private readonly stintService = inject(StintService);
  private readonly deltaStintService = inject(DeltaStintService);

  readonly deltaStints: Signal<DeltaStint[]> = this.deltaStintService.deltaStints;
  readonly totalDeltaMilliseconds: Signal<number> = this.deltaStintService.totalDeltaMilliseconds;
  readonly activeStintId = computed(() => {
    const activeStint = this.stintService.activeStint();
    if (activeStint) {
      return activeStint.id;
    }
    return undefined;
  })

  isOpen: boolean = true;

  getMillisecondsToTimeString(milliseconds: number): string {
    return millisecondsToTimeString(Math.abs(milliseconds));
  }
}
