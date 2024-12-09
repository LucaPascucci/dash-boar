import { Injectable } from '@angular/core';
import { Stint } from "../model/stint";
import { Race } from "../model/race";
import { RaceConfig } from "../model/race-config";
import { addHours, differenceInMinutes } from "date-fns";

@Injectable({
  providedIn: 'root'
})
export class RaceLogicService {

  constructor() { }

  /* TODO:
       - creare modello output
  */
  nextStintsAvgTime(stints: Stint[], race: Race, raceConfig: RaceConfig): { avgStintTime: number | null, avgIfChangedNow: number | null } {
    const currentTime = new Date();
    const raceEndTime = addHours(race.start.toDate(), raceConfig.durationHour);

    if (currentTime >= raceEndTime) {
      return { avgStintTime: null, avgIfChangedNow: null };
    }

    // Calculate the remaining race time in minutes
    const timeRemaining = differenceInMinutes(raceEndTime, currentTime)

    // Calculate the number of completed driver changes
    const completedDriverChanges = stints.filter(
        (stint, index, arr) => index > 0 && stint.driverId !== arr[index - 1].driverId
    ).length;

    // Calculate the number of remaining driver changes
    const remainingDriverChanges = Math.max(0, raceConfig.minDriverChange - completedDriverChanges);

    if (remainingDriverChanges === 0) {
      console.info('Hai già fatto tutti i cambi pilota richiesti.');
      return { avgStintTime: null, avgIfChangedNow: null };
    }

    // Determine the time remaining at the last driver change
    const lastDriverChange = stints.length > 0 ? stints[stints.length - 1].endDate.toDate() : race.start.toDate();
    const timeRemainingAtLastChange = differenceInMinutes(raceEndTime, lastDriverChange)

    // Case 1: Calculate avgStintTime considering the time at the last driver change
    const avgStintTime = timeRemainingAtLastChange / remainingDriverChanges;

    // Case 2: Calculate avgIfChangedNow if a driver change happens now
    const avgIfChangedNow = timeRemaining / remainingDriverChanges;

    return { avgStintTime: avgStintTime || null, avgIfChangedNow: avgIfChangedNow || null };
  }
}
