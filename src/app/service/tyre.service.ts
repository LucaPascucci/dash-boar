import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { RaceService } from "./race.service";
import { RaceConfigService } from "./race-config.service";
import { PitService } from "./pit.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { addHours } from "date-fns";
import { Pit } from "../model/pit";

@Injectable({
  providedIn: 'root'
})
export class TyreService {
  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly pitService = inject(PitService);

  readonly openingTime: WritableSignal<Date | undefined> = signal(undefined)
  readonly closingTime: WritableSignal<Date | undefined> = signal(undefined);

  readonly tyreChangeWindowOpen: WritableSignal<boolean> = signal(false);
  readonly remainingTyreChange: WritableSignal<number> = signal(0);

  constructor() {

    combineLatest({
      pits: toObservable(this.pitService.pits),
      activeRace: toObservable(this.raceService.activeRace),
      raceConfig: toObservable(this.raceConfigService.raceConfig),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({pits, activeRace, raceConfig}) => {
      if (activeRace && raceConfig) {
        this.openingTime.set(addHours(activeRace.start.toDate(), raceConfig.startTyreChangeWindowHour));
        this.closingTime.set(addHours(activeRace.start.toDate(), raceConfig.endTyreChangeWindowHour));
        this.tyreChangeWindowOpen.set(this.isTyreChangeWindowOpen(this.openingTime(), this.closingTime()));
      } else {
        this.openingTime.set(undefined);
        this.closingTime.set(undefined);
        this.tyreChangeWindowOpen.set(false);
      }

      if (raceConfig) {
        this.remainingTyreChange.set(this.calculateRemainingTyreChange(pits, raceConfig.pitConfig.minTyreChange));
      }
    });
  }

  private isTyreChangeWindowOpen(openingTime: Date | undefined, closingTime: Date | undefined) {
    if (openingTime && closingTime) {
      const now = new Date();
      return now >= openingTime && now <= closingTime;
    }
    return false;
  }

  private calculateRemainingTyreChange(pits: Pit[], minTyreChange: number): number {
    const tyreChangesDone = pits.filter(pit => pit.tyreChange && pit.exitTime).length;
    return minTyreChange - tyreChangesDone;
  }
}


