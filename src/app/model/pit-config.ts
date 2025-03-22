export interface PitConfig {
  minPitSeconds: number;
  minPitWithTyreChangeSeconds: number;
  nextPitDriverId: string;
  nextPitInterphoneChange: boolean;
  nextPitRefueling: boolean;
  nextPitTyreChange: boolean;
  pitLaneCloseBeforeEndRaceMinute: number;
}
