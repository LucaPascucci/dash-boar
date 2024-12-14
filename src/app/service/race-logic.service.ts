import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Race } from "../model/race";
import { differenceInMilliseconds, secondsToMilliseconds } from "date-fns";
import { RaceConfigService } from "./race-config.service";
import { Pit } from "../model/pit";
import { RaceService } from "./race.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PitService } from "./pit.service";
import { RaceLogic } from "../model/race-logic";
import { RaceConfig } from "../model/race-config";

@Injectable({
  providedIn: 'root'
})
export class RaceLogicService {
  private readonly raceService = inject(RaceService);
  private readonly pitService = inject(PitService);
  private readonly raceConfigService = inject(RaceConfigService);

  readonly activeRaceLogic: WritableSignal<RaceLogic | undefined> = signal(undefined);


  constructor() {
    combineLatest({
      activeRace: toObservable(this.raceService.activeRace),
      endRaceDate: toObservable(this.raceService.endRaceDate),
      activeRaceConfig: toObservable(this.raceConfigService.activeRaceConfig),
      completedDriverChanges: toObservable(this.pitService.completedDriverChanges),
      lastDriverChangePit: toObservable(this.pitService.lastDriverChangePit),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({activeRace, endRaceDate, activeRaceConfig, completedDriverChanges, lastDriverChangePit}) => {
      if (activeRace && endRaceDate && activeRaceConfig) {
        this.activeRaceLogic.set(
            this.calculateRaceLogic(
                activeRace,
                endRaceDate,
                activeRaceConfig,
                completedDriverChanges,
                lastDriverChangePit));
      } else {
        this.activeRaceLogic.set(undefined);
      }
    });
  }

  calculateRaceLogic(
      race: Race,
      endRaceDate: Date,
      raceConfig: RaceConfig,
      completedDriverChanges: number,
      lastDriverChangePit: Pit | undefined
  ): RaceLogic {

    const currentDate = new Date();

    if (currentDate >= endRaceDate) {
      return {
        avgStintMillisecondsTime: undefined,
        laps: 0,
        avgStintMillisecondsIfDriverChangedNow: undefined,
        lapsIfDriverChangeNow: 0
      };
    }

    const remainingDriverChanges = Math.max(0, raceConfig.minDriverChange - completedDriverChanges);

    const remainingPitTime = secondsToMilliseconds(raceConfig.minPitSeconds * remainingDriverChanges);

    const timeRemaining = differenceInMilliseconds(endRaceDate, currentDate) - remainingPitTime;

    // Determine the time remaining at the last driver change
    const lastDriverChange = lastDriverChangePit ? lastDriverChangePit.entryTime.toDate() : race.start.toDate();
    const timeRemainingFromLastDriverChange = differenceInMilliseconds(endRaceDate, lastDriverChange) - remainingPitTime;

    // Case 1: Calculate avgStintTime considering the time at the last driver change
    const avgStintTime = timeRemainingFromLastDriverChange / (remainingDriverChanges + 1);

    // Case 2: Calculate avgIfChangedNow if a driver change happens now
    const avgIfChangedNow = timeRemaining / remainingDriverChanges;

    return {
      avgStintMillisecondsTime: avgStintTime || undefined,
      laps: Math.floor(avgStintTime / raceConfig.referenceLapTimeMillisecond),
      avgStintMillisecondsIfDriverChangedNow: avgIfChangedNow || undefined,
      lapsIfDriverChangeNow: Math.floor(avgIfChangedNow / raceConfig.referenceLapTimeMillisecond)
    };
  }
}
