export interface RaceConfig {
  id: string;
  durationHour: number;
  endTyreChangeWindowHour: number;
  endRaceThresholdSeconds: number;
  fuelDurationMinute: number;
  maxDriverOnTrackHour: number;
  minDriverChange: number;
  minDriverOnTrackHour: number;
  minPitSeconds: number;
  minPitWithTyreChangeSeconds: number;
  minStintMinute: number;
  minTyreChange: number;
  nextPitDriverId: string;
  nextPitRefueling: boolean;
  nextPitTyreChange: boolean;
  pitLaneCloseBeforeEndRaceMinute: number;
  referenceLapTimeMillisecond: number;
  startRaceDriverId: string;
  startTyreChangeWindowHour: number;
  warningDriverOnTrackThresholdMinute: number;
  deleted: boolean;
}
