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
  warningDriverOnTrackThresholdMinute: number;
  referenceLapTimeMillisecond: number;
  minPitSeconds: number;
  minPitWithTyreChangeSeconds: number;
  startRaceDriverId: string;
  nextPitDriverId: string;
  nextPitRefueling: boolean;
  nextPitTyreChange: boolean;
  deleted: boolean;
}
