import { PitConfig } from "./pit-config";

// TODO: Estrarre: TyreConfig + DriverConfig
export interface RaceConfig {
  id: string;
  durationHour: number;
  endTyreChangeWindowHour: number;
  endRaceThresholdSeconds: number;
  fuelDurationMinute: number;
  interphoneBatteryDurationMinute: number;
  maxDriverOnTrackHour: number;
  minDriverChange: number;
  minDriverOnTrackHour: number;
  minStintMinute: number;
  referenceLapTimeMillisecond: number;
  startRaceDriverId: string;
  startTyreChangeWindowHour: number;
  warningDriverOnTrackThresholdMinute: number;
  pitConfig: PitConfig;
  deleted: boolean;
}
