import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Race } from "../model/race";
import { addHours, differenceInMilliseconds } from "date-fns";
import { RaceConfigService } from "./race-config.service";
import { Pit } from "../model/pit";
import { RaceService } from "./race.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PitService } from "./pit.service";
import { RaceLogic } from "../model/race-logic";
import { RaceConfig } from "../model/race-config";
import { LapService } from "./lap.service";

@Injectable({
  providedIn: 'root'
})
export class RaceLogicService {
  private readonly raceService = inject(RaceService);
  private readonly pitService = inject(PitService);
  private readonly lapService = inject(LapService);
  private readonly raceConfigService = inject(RaceConfigService);

  readonly activeRaceLogic: WritableSignal<RaceLogic | undefined> = signal(undefined);


  constructor() {
    combineLatest({
      activeRace: toObservable(this.raceService.activeRace),
      activeRaceConfig: toObservable(this.raceConfigService.activeRaceConfig),
      completedDriverChanges: toObservable(this.pitService.completedDriverChanges),
      lastDriverChangePit: toObservable(this.pitService.lastDriverChangePit),
      referenceLapTimeMilliseconds: toObservable(this.lapService.referenceLapTimeMillisecond),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({activeRace, activeRaceConfig, completedDriverChanges, lastDriverChangePit, referenceLapTimeMilliseconds}) => {
      if (activeRace && activeRaceConfig) {
        this.activeRaceLogic.set(
            this.calculateRaceLogic(
                activeRace,
                activeRaceConfig,
                completedDriverChanges,
                lastDriverChangePit,
                referenceLapTimeMilliseconds));
      } else {
        this.activeRaceLogic.set(undefined);
      }
    });
  }

  calculateRaceLogic(
      race: Race,
      activeRaceConfig: RaceConfig,
      completedDriverChanges: number,
      lastDriverChangePit: Pit | undefined,
      referenceLapTimeMilliseconds: number
  ): RaceLogic {

    const currentTime = new Date();
    const raceEndTime = addHours(race.start.toDate(), activeRaceConfig.durationHour);

    if (currentTime >= raceEndTime) {
      return {
        avgStintMillisecondsTime: undefined,
        laps: 0,
        avgStintMillisecondsIfDriverChangedNow: undefined,
        lapsIfDriverChangeNow: 0
      };
    }

    // TODO: va rimosso il tempo di ogni pit che si dovrà fare (numero di cambi pilota da effettuare per tempo minimo ai pit)
    // Calculate the remaining race time in seconds
    const timeRemaining = differenceInMilliseconds(raceEndTime, currentTime)

    // Calculate the number of remaining driver changes
    const remainingDriverChanges = Math.max(0, activeRaceConfig.minDriverChange - completedDriverChanges);

    // Determine the time remaining at the last driver change
    const lastDriverChange = lastDriverChangePit ? lastDriverChangePit.entryTime.toDate() : race.start.toDate();
    const timeRemainingFromLastDriverChange = differenceInMilliseconds(raceEndTime, lastDriverChange)

    // Case 1: Calculate avgStintTime considering the time at the last driver change
    const avgStintTime = timeRemainingFromLastDriverChange / (remainingDriverChanges + 1);

    // Case 2: Calculate avgIfChangedNow if a driver change happens now
    const avgIfChangedNow = timeRemaining / remainingDriverChanges;

    return {
      avgStintMillisecondsTime: avgStintTime || undefined,
      laps: Math.floor(avgStintTime / referenceLapTimeMilliseconds),
      avgStintMillisecondsIfDriverChangedNow: avgIfChangedNow || undefined,
      lapsIfDriverChangeNow: Math.floor(avgIfChangedNow / referenceLapTimeMilliseconds)
    };
  }
}
