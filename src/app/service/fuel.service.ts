import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { RaceService } from "./race.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PitService } from "./pit.service";
import { RaceConfigService } from "./race-config.service";
import {
  addMinutes,
  differenceInMilliseconds,
  differenceInMinutes,
  minutesToMilliseconds
} from "date-fns";
import { RaceConfig } from "../model/race-config";
import { Pit } from "../model/pit";
import { Race } from "../model/race";

@Injectable({
  providedIn: 'root'
})
export class FuelService {
  private readonly raceService = inject(RaceService);
  private readonly pitService = inject(PitService);
  private readonly raceConfigService = inject(RaceConfigService);

  readonly lastRefuelTime: WritableSignal<Date | undefined> = signal(undefined);
  readonly emptyFuelTime: WritableSignal<Date | undefined> = signal(undefined);
  readonly remainingFuelPercentage: WritableSignal<number> = signal(100);
  readonly remainingFuelLap: WritableSignal<number> = signal(0);

  constructor() {
    combineLatest({
      lastRefuelPit: toObservable(this.pitService.lastRefuelPit),
      activeRace: toObservable(this.raceService.activeRace),
      raceConfig: toObservable(this.raceConfigService.activeRaceConfig),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(
        ({
           lastRefuelPit,
           activeRace,
           raceConfig
        }) => {
          this.lastRefuelTime.set(this.getLastRefuelDate(lastRefuelPit, activeRace));
          this.emptyFuelTime.set(this.calculateEmptyFuelTime(this.lastRefuelTime(), raceConfig));
          this.remainingFuelLap.set(this.calculateRemainingFuelLaps(this.emptyFuelTime(), raceConfig));
          this.remainingFuelPercentage.set(this.calculateRemainingFuelPercentage(this.emptyFuelTime(), raceConfig));
    });
  }

  private getLastRefuelDate(lastRefuelPit: Pit | undefined, activeRace: Race | undefined): Date | undefined {
    if (lastRefuelPit && lastRefuelPit.exitTime) {
      return lastRefuelPit.exitTime.toDate();
    }
    if (activeRace) {
      return activeRace.start.toDate();
    }
    return undefined;
  }

  private calculateEmptyFuelTime(lastRefuelDate: Date | undefined, raceConfig: RaceConfig | undefined): Date | undefined {
    if (lastRefuelDate && raceConfig) {
      return addMinutes(lastRefuelDate, raceConfig.fuelDurationMinute)
    }
    return undefined;
  }

  private calculateRemainingFuelPercentage(emptyFuelTime: Date | undefined, raceConfig: RaceConfig | undefined): number {
    if (emptyFuelTime && raceConfig) {
      const remainingMinutes = differenceInMinutes(emptyFuelTime, new Date());
      const percentage = (remainingMinutes / raceConfig.fuelDurationMinute) * 100;
      const clampedPercentage = Math.max(0, Math.min(percentage, 100));
      return parseFloat(clampedPercentage.toFixed(0));
    }
    return 100;
  }

  private calculateRemainingFuelLaps(emptyFuelTime: Date | undefined, raceConfig: RaceConfig | undefined): number {
    if (emptyFuelTime && raceConfig) {
      const millisecondsUntilEmpty = differenceInMilliseconds(emptyFuelTime, new Date());
      return Math.floor(millisecondsUntilEmpty / raceConfig.referenceLapTimeMillisecond);

    }
    if (!emptyFuelTime && raceConfig) {
      const fuelDurationMilliseconds = minutesToMilliseconds(raceConfig.fuelDurationMinute);
      return Math.floor(fuelDurationMilliseconds / raceConfig.referenceLapTimeMillisecond);
    }
    return 0;
  }
}
