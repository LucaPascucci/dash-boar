export interface RaceConfig {
  id: string;
  durationHour: number;
  fuelDurationMinute: number;
  minDriverChange: number;
  minStintMinute: number;
  startTyreChangeWindowHour: number;
  endTyreChangeWindowHour: number;
  minTyreChange: number;
  deleted: boolean;
  // TODO: aggiungere minimo e massimo ore in pista che può fare un pilota (tra 1 e 7)
  // TODO: pitlane chiusa 5 minuti prima della fine della gara
}
