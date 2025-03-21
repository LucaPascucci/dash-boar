import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { addHours, addSeconds, differenceInMilliseconds, secondsToMilliseconds } from "date-fns";
import { RaceConfigService } from "./race-config.service";
import { Pit } from "../model/pit";
import { RaceService } from "./race.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PitService } from "./pit.service";
import { OptimizedStint } from "../model/optimized-stint";
import { RaceConfig } from "../model/race-config";
import { TyreService } from "./tyre.service";
import { Race } from "../model/race";
import { PitConfig } from "../model/pit-config";

@Injectable({
  providedIn: 'root'
})
export class StintOptimizerService {
  private readonly raceService = inject(RaceService);
  private readonly pitService = inject(PitService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly tyreService = inject(TyreService);

  readonly optimizedStint: WritableSignal<OptimizedStint | undefined> = signal(undefined);


  constructor() {
    combineLatest({
      activeRace: toObservable(this.raceService.activeRace),
      willEndRaceDate: toObservable(this.raceService.willEndRaceDate),
      activeRaceConfig: toObservable(this.raceConfigService.raceConfig),
      remainingDriverChanges: toObservable(this.pitService.remainingDriverChanges),
      remainingTyreChange: toObservable(this.tyreService.remainingTyreChange),
      lastPit: toObservable(this.pitService.lastPit),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({
                  activeRace,
                  willEndRaceDate,
                  activeRaceConfig,
                  remainingDriverChanges,
                  remainingTyreChange,
                  lastPit
                }) => {
      if (activeRaceConfig) {
        this.optimizedStint.set(
            this.calculateOptimizedStint(
                activeRace,
                activeRace ? activeRace.start.toDate() : new Date(),
                willEndRaceDate || addHours(new Date(), activeRaceConfig.durationHour),
                activeRaceConfig,
                remainingDriverChanges,
                remainingTyreChange,
                lastPit));
      } else {
        this.optimizedStint.set(undefined);
      }
    });
  }

  calculateOptimizedStint(
      activeRace: Race | undefined,
      startRaceDate: Date,
      endRaceDate: Date,
      raceConfig: RaceConfig,
      remainingDriverChanges: number,
      remainingTyreChange: number,
      lastPit: Pit | undefined
  ): OptimizedStint | undefined {

    const currentDate = new Date();

    if (currentDate >= endRaceDate) {
      return undefined;
    }

    const remainingPitTime = this.calculateRemainingPitTime(raceConfig.pitConfig, remainingDriverChanges, remainingTyreChange);

    const timeRemaining = differenceInMilliseconds(endRaceDate, currentDate) - remainingPitTime;

    let lastDriverChangeExitDate: Date | undefined = undefined;
    if (lastPit) {
      if (lastPit.exitTime) {
        lastDriverChangeExitDate = lastPit.exitTime.toDate();
      } else {
        lastDriverChangeExitDate = addSeconds(lastPit.entryTime.toDate(), raceConfig.pitConfig.minPitSeconds);
      }
    }

    // Determine the time remaining at the last driver change
    const lastDriverChange = lastDriverChangeExitDate || startRaceDate;
    const timeRemainingFromLastDriverChange = differenceInMilliseconds(endRaceDate, lastDriverChange) - remainingPitTime;

    // Case 1: Calculate avgStintTime considering the time at the last driver change
    const avgStintTime = timeRemainingFromLastDriverChange / (remainingDriverChanges + 1);

    // Case 2: Calculate avgIfChangedNow if a driver change happens now
    let avgIfChangedNow = 0
    let lapsIfDriverChangeNow = 0;
    if (remainingDriverChanges > 0 && activeRace !== undefined) {
      avgIfChangedNow = timeRemaining / remainingDriverChanges;
      lapsIfDriverChangeNow = Math.floor(avgIfChangedNow / raceConfig.referenceLapTimeMillisecond)
    }

    return {
      avgStintMillisecondsTime: avgStintTime,
      laps: Math.floor(avgStintTime / raceConfig.referenceLapTimeMillisecond),
      avgStintMillisecondsIfDriverChangedNow: avgIfChangedNow,
      lapsIfDriverChangeNow: lapsIfDriverChangeNow
    };
  }

  calculateRemainingPitTime(
      pitConfig: PitConfig,
      remainingDriverChanges: number,
      remainingTyreChange: number
  ): number {
    let normalDriverChanges = remainingDriverChanges - remainingTyreChange;

    let remainingNormalPitTime = secondsToMilliseconds(pitConfig.minPitSeconds * normalDriverChanges);
    let remainingTyreChangePitTime = secondsToMilliseconds(pitConfig.minPitWithTyreChangeSeconds * remainingTyreChange);
    return remainingNormalPitTime + remainingTyreChangePitTime;
  }
}
