import { Injectable } from '@angular/core';
import { RaceConfig } from "../model/race-config";

@Injectable({
  providedIn: 'root'
})
export class RaceConfigService {

  constructor() {
  }

  get(): RaceConfig {
    return {
      durationHour: 24,
      endTyreChangeWindowHour: 14,
      fuelDurationMinute: 120,
      minDriverChange: 30,
      minStintMinute: 5,
      minTyreChange: 1,
      startTyreChangeWindowHour: 10
    }
  }
}
