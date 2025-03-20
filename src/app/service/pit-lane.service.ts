import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { RaceService } from "./race.service";
import { StintService } from "./stint.service";
import { RaceConfigService } from "./race-config.service";
import { Stint } from "../model/stint";
import { RaceConfig } from "../model/race-config";
import { addMinutes, isAfter, isBefore, subMinutes } from "date-fns";

@Injectable({
  providedIn: 'root'
})
export class PitLaneService {
  private readonly raceService = inject(RaceService);
  private readonly stintService = inject(StintService);
  private readonly raceConfigService = inject(RaceConfigService);

  readonly open: WritableSignal<boolean> = signal(false);
  readonly openInMilliseconds: WritableSignal<number> = signal(0);

  constructor() {
    combineLatest({
      willEndRaceDate: toObservable(this.raceService.willEndRaceDate),
      activeStint: toObservable(this.stintService.activeStint),
      raceConfig: toObservable(this.raceConfigService.raceConfig),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({willEndRaceDate, activeStint, raceConfig}) => {
      if (willEndRaceDate && activeStint && raceConfig) {
        this.open.set(this.calculatePitLaneOpen(willEndRaceDate, activeStint, raceConfig));
        this.openInMilliseconds.set(this.calculatePitLaneOpenInMilliseconds(activeStint, raceConfig));
      } else {
        this.open.set(false);
        this.openInMilliseconds.set(0);
      }
    })
  }

  private calculatePitLaneOpenInMilliseconds(activeStint: Stint, raceConfig: RaceConfig): number {
    const now = new Date().getTime();
    return addMinutes(activeStint.startDate.toDate(), raceConfig.minStintMinute).getTime() - now;
  }

  private calculatePitLaneOpen(endRaceDate: Date, activeStint: Stint, raceConfig: RaceConfig): boolean {
    const now = new Date();

    // Check if the current time is at least X minutes before the end of the race
    const pitLaneCloseTime = subMinutes(endRaceDate, raceConfig.pitConfig.pitLaneCloseBeforeEndRaceMinute);
    const isBeforePitLaneClose = isBefore(now, pitLaneCloseTime);

    // Check if at least X minutes have passed since the start of the active active-stint
    const minStintTime = addMinutes(activeStint.startDate.toDate(), raceConfig.minStintMinute);
    const isAfterMinStintTime = isAfter(now, minStintTime)

    return isBeforePitLaneClose && isAfterMinStintTime;
  }
}
