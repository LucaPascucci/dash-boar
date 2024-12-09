import { inject, Injectable, Signal } from '@angular/core';
import { Race } from "../model/race";
import { addHours, differenceInMinutes } from "date-fns";
import { RaceConfigService } from "./race-config.service";
import { Pit } from "../model/pit";
import { RaceService } from "./race.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PitService } from "./pit.service";
import { RaceLogic } from "../model/race-logic";

@Injectable({
  providedIn: 'root'
})
export class RaceLogicService {
  private readonly raceService = inject(RaceService);
  private readonly activeRace: Signal<Race | undefined> = this.raceService.activeRace;
  private readonly pitService = inject(PitService);

  private readonly raceConfigService = inject(RaceConfigService);
  private readonly durationHour = this.raceConfigService.get().durationHour;
  private readonly minDriverChange = this.raceConfigService.get().minDriverChange;


  constructor() {
    combineLatest({
      pits: this.pitService.getRacePits(),
      activeRace: toObservable(this.activeRace),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({pits, activeRace}) => {
      if (activeRace) {
        this.nextStintsAvgTime(pits, activeRace, 0);
      }
    });
  }

  nextStintsAvgTime(pits: Pit[], race: Race, referenceLapTimeMilliseconds: number): RaceLogic {
    const currentTime = new Date();
    const raceEndTime = addHours(race.start.toDate(), this.durationHour);

    if (currentTime >= raceEndTime) {
      return { avgStintTime: undefined, avgIfChangedNow: undefined };
    }

    // Calculate the remaining race time in minutes
    const minutesRemaining = differenceInMinutes(raceEndTime, currentTime)

    // Calculate the number of completed driver changes from pits array
    const completedDriverChanges = pits.reduce((count, pit) => {
      return count + (pit.entryDriverId !== pit.exitDriverId ? 1 : 0);
    }, 0);

    // Calculate the number of remaining driver changes
    const remainingDriverChanges = Math.max(0, this.minDriverChange - completedDriverChanges);

    if (remainingDriverChanges === 0) {
      console.info('Hai già fatto tutti i cambi pilota richiesti.');
      return { avgStintTime: undefined, avgIfChangedNow: undefined};
    }

    // Determine the time remaining at the last driver change
    const lastPitWithDriverChange = this.getLastPitWithDriverChange(pits);
    const lastDriverChange = lastPitWithDriverChange ? lastPitWithDriverChange.entryTime.toDate() : race.start.toDate();
    const timeRemainingFromLastDriverChange = differenceInMinutes(raceEndTime, lastDriverChange)

    // Case 1: Calculate avgStintTime considering the time at the last driver change
    const avgStintTime = timeRemainingFromLastDriverChange / remainingDriverChanges;

    // Case 2: Calculate avgIfChangedNow if a driver change happens now
    const avgIfChangedNow = minutesRemaining / remainingDriverChanges;

    return { avgStintTime: avgStintTime || undefined, avgIfChangedNow: avgIfChangedNow || undefined };
  }

  
  private getLastPitWithDriverChange(pits: Pit[]): Pit | undefined {
    if (pits.length === 0) {
      return undefined;
    }
    if (pits.length < 2) {
      return undefined;
    }

    // Sort the stints by startDate in descending order
    const sortedPits = pits.sort((a, b) => b.entryTime.toMillis() - a.entryTime.toMillis());

    for (const pit of sortedPits) {
      if (pit.entryDriverId !== pit.exitDriverId) {
        return pit
      }
    }
    return undefined;
  }
}
