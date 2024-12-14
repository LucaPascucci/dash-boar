export interface RaceConfig {
  id: string;
  durationHour: number;
  fuelDurationMinute: number;
  minDriverChange: number;
  minStintMinute: number;
  startTyreChangeWindowHour: number;
  endTyreChangeWindowHour: number;
  minTyreChange: number;
  pitLaneCloseBeforeEndRaceMinute: number;
  minDriverOnTrackHour: number;
  maxDriverOnTrackHour: number;
  deleted: boolean;
  // TODO: minPitSeconds
  // TODO: referenceLapTimeMilliseconds
}
