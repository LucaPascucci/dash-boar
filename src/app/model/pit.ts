interface Pit {
  id: number;
  raceId: number;
  entryTime: Date;
  exitTime: Date;
  entryDriverId: number;
  exitDriverId: number;
  refuel: boolean;
  tyreChange: boolean;
}
