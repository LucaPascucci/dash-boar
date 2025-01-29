import { Component, computed, inject, Signal } from '@angular/core';
import { NgClass } from "@angular/common";
import { StintService } from "../../service/stint.service";
import { millisecondsToTimeString } from "../../util/date.util";
import { Stint } from "../../model/stint";

@Component({
    selector: 'app-active-stint',
    imports: [
        NgClass
    ],
    templateUrl: './active-stint.component.html',
    styleUrl: './active-stint.component.css'
})
export class ActiveStintComponent {
  private readonly stintService = inject(StintService);

  readonly activeStint: Signal<Stint | undefined> = this.stintService.activeStint;
  readonly activeStintRemainingTimeOnTrack: Signal<number> = this.stintService.activeStintRemainingTimeOnTrack;

  readonly activeStintTimeOnTrackString = computed(() => {
    return millisecondsToTimeString(this.stintService.activeStintTimeOnTrack());
  });

  readonly activeStintRemainingTimeOnTrackString = computed(() => {
    return millisecondsToTimeString(this.stintService.activeStintRemainingTimeOnTrack());
  });

  readonly activeStintGainedTimeOnTrackString = computed(() => {
    return millisecondsToTimeString(this.stintService.activeStintGainedTimeOnTrack());
  })

  readonly activeStintLaps: Signal<number> = this.stintService.activeStintLaps;
  readonly activeStintRemainingLaps: Signal<number> = this.stintService.activeStintRemainingLaps;
  readonly activeStintGainedLaps: Signal<number> = this.stintService.activeStintGainedLaps;

  isOpen = true;
}
