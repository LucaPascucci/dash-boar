import { Injectable } from '@angular/core';
import { Stint } from "../model/stint";
import { Race } from "../model/race";
import { RaceConfig } from "../model/race-config";

@Injectable({
  providedIn: 'root'
})
export class RaceLogicService {

  constructor() { }

  nextStintsAvgTime(stints: Stint[], race: Race, raceConfig: RaceConfig): { avgStintTime: number | null, avgIfChangedNow: number | null } {
    const currentTime = new Date();
    const raceEndTime = new Date(race.start.toDate().getTime() + raceConfig.durationHour * 60 * 60 * 1000);
  
    if (currentTime >= raceEndTime) {
      console.error('La gara è già finita.');
      return { avgStintTime: null, avgIfChangedNow: null };
    }
  
    // Calculate the remaining race time in minutes
    const timeRemaining = (raceEndTime.getTime() - currentTime.getTime()) / 60000; // Convert to minutes
  
    // Calculate the number of completed driver changes
    const completedDriverChanges = stints.filter(
      (stint, index, arr) => index > 0 && stint.driverId !== arr[index - 1].driverId
    ).length;
  
    // Calculate the number of remaining driver changes
    const remainingDriverChanges = Math.max(0, raceConfig.minDriverChange - completedDriverChanges);
  
    if (remainingDriverChanges === 0) {
      console.log('Hai già fatto tutti i cambi pilota richiesti.');
      return { avgStintTime: null, avgIfChangedNow: null };
    }
  
    // Determine the time remaining at the last driver change
    const lastDriverChange = stints.length > 0 ? stints[stints.length - 1].endDate.toDate() : race.start.toDate();
    const timeRemainingAtLastChange = (raceEndTime.getTime() - lastDriverChange.getTime()) / 60000; // Time in minutes
  
    // Case 1: Calculate avgStintTime considering the time at the last driver change
    const avgStintTime = timeRemainingAtLastChange / remainingDriverChanges;
  
    // Case 2: Calculate avgIfChangedNow if a driver change happens now
    const avgIfChangedNow = timeRemaining / remainingDriverChanges;
  
    return { avgStintTime: avgStintTime || null, avgIfChangedNow: avgIfChangedNow || null };
  }  
}
