import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { RaceService } from "./race.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PitService } from "./pit.service";
import { RaceConfigService } from "./race-config.service";
import { addMinutes, differenceInMilliseconds, differenceInMinutes } from "date-fns";

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
  readonly remainingFuelLap: WritableSignal<number> = signal(100);

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
      if (activeRace && raceConfig) {
        let date: Date = lastRefuelPit && lastRefuelPit.exitTime ? lastRefuelPit.exitTime.toDate() : activeRace.start.toDate();

        this.lastRefuelTime.set(date);
        this.emptyFuelTime.set(addMinutes(date, raceConfig.fuelDurationMinute));
        this.remainingFuelPercentage.set(this.calculateRemainingFuelPercentage(this.emptyFuelTime(), raceConfig.fuelDurationMinute));
        this.remainingFuelLap.set(this.calculateRemainingFuelLaps(this.emptyFuelTime(), raceConfig.referenceLapTimeMillisecond));
      } else {
        this.lastRefuelTime.set(undefined);
        this.emptyFuelTime.set(undefined);
        this.remainingFuelPercentage.set(100);
        this.remainingFuelLap.set(0);
      }
    });
  }

  private calculateRemainingFuelPercentage(emptyFuelTime: Date | undefined, fuelDurationMinute: number): number {
    if (!emptyFuelTime) {
      return 100;
    }

    const remainingMinutes = differenceInMinutes(emptyFuelTime, new Date());
    const percentage = (remainingMinutes / fuelDurationMinute) * 100;
    const clampedPercentage = Math.max(0, Math.min(percentage, 100));
    return parseFloat(clampedPercentage.toFixed(0));
  }

  private calculateRemainingFuelLaps(emptyFuelTime: Date | undefined, referenceLapTimeMillisecond: number | undefined): number {
    if (!emptyFuelTime || !referenceLapTimeMillisecond) {
      return 0;
    }

    const millisecondsUntilEmpty = differenceInMilliseconds(emptyFuelTime, new Date());
    return Math.floor(millisecondsUntilEmpty / referenceLapTimeMillisecond);
  }
}
