export interface RaceConfig {
  durationHour: number;
  fuelDurationMinute: number;
  minDriverChange: number;
  minStintMinute: number;
  startTyreChangeWindowHour: number;
  endTyreChangeWindowHour: number;
  minTyreChange: number;
  // TODO: aggiungere minimo e massimo ore in pista che può fare un pilota (tra 1 e 7)
  // TODO: pitlane chiusa 5 minuti prima della fine della gara
}
