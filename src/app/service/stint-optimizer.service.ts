import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Race } from "../model/race";
import { addHours, addSeconds, differenceInMilliseconds, secondsToMilliseconds } from "date-fns";
import { RaceConfigService } from "./race-config.service";
import { Pit } from "../model/pit";
import { RaceService } from "./race.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PitService } from "./pit.service";
import { OptimizedStint } from "../model/optimized-stint";
import { RaceConfig } from "../model/race-config";

@Injectable({
  providedIn: 'root'
})
export class StintOptimizerService {
  private readonly raceService = inject(RaceService);
  private readonly pitService = inject(PitService);
  private readonly raceConfigService = inject(RaceConfigService);

  readonly optimizedStint: WritableSignal<OptimizedStint | undefined> = signal(undefined);


  constructor() {
    combineLatest({
      activeRace: toObservable(this.raceService.activeRace),
      endRaceDate: toObservable(this.raceService.endRaceDate),
      activeRaceConfig: toObservable(this.raceConfigService.activeRaceConfig),
      remainingDriverChanges: toObservable(this.pitService.remainingDriverChanges),
      lastDriverChangePit: toObservable(this.pitService.lastDriverChangePit),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({activeRace, endRaceDate, activeRaceConfig, remainingDriverChanges, lastDriverChangePit}) => {
      if (activeRaceConfig) {
        this.optimizedStint.set(
            this.calculateOptimizedStint(
                activeRace ? activeRace.start.toDate() : new Date(),
                endRaceDate || addHours(new Date(), activeRaceConfig.durationHour),
                activeRaceConfig,
                remainingDriverChanges,
                lastDriverChangePit));
      } else {
        this.optimizedStint.set(undefined);
      }
    });
  }

  calculateOptimizedStint(
      startRaceDate: Date,
      endRaceDate: Date,
      raceConfig: RaceConfig,
      remainingDriverChanges: number,
      lastDriverChangePit: Pit | undefined
  ): OptimizedStint | undefined {

    const currentDate = new Date();

    if (currentDate >= endRaceDate) {
      return undefined;
    }

    const remainingPitTime = secondsToMilliseconds(raceConfig.minPitSeconds * remainingDriverChanges);

    const timeRemaining = differenceInMilliseconds(endRaceDate, currentDate) - remainingPitTime;

    // Determine the time remaining at the last driver change
    const lastDriverChange = lastDriverChangePit ?
        addSeconds(lastDriverChangePit.entryTime.toDate(), raceConfig.minPitSeconds) :
        startRaceDate;
    const timeRemainingFromLastDriverChange = differenceInMilliseconds(endRaceDate, lastDriverChange) - remainingPitTime;

    // Case 1: Calculate avgStintTime considering the time at the last driver change
    const avgStintTime = timeRemainingFromLastDriverChange / (remainingDriverChanges + 1);

    // Case 2: Calculate avgIfChangedNow if a driver change happens now
    const avgIfChangedNow = timeRemaining / remainingDriverChanges;

    return {
      avgStintMillisecondsTime: avgStintTime,
      laps: Math.floor(avgStintTime / raceConfig.referenceLapTimeMillisecond),
      avgStintMillisecondsIfDriverChangedNow: avgIfChangedNow,
      lapsIfDriverChangeNow: Math.floor(avgIfChangedNow / raceConfig.referenceLapTimeMillisecond)
    };
  }
}
