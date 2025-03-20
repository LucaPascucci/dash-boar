// TODO: provare mapping con firestore

export interface PitConfig {
  minPitSeconds: number;
  minPitWithTyreChangeSeconds: number;
  minTyreChange: number;
  nextPitDriverId: string;
  nextPitInterphoneChange: boolean;
  nextPitRefueling: boolean;
  nextPitTyreChange: boolean;
  pitLaneCloseBeforeEndRaceMinute: number;
}
