import { PitConfig } from "./pit-config";
import { TyreConfig } from "./tyre-config";
import { DriverConfig } from "./driver-config";

export interface RaceConfig {
  id: string;
  durationHour: number;
  endRaceThresholdSeconds: number;
  fuelDurationMinute: number;
  interphoneBatteryDurationMinute: number;
  minStintMinute: number;
  referenceLapTimeMillisecond: number;
  startRaceDriverId: string;
  driverConfig: DriverConfig;
  pitConfig: PitConfig;
  tyreConfig: TyreConfig;
  deleted: boolean;
}
