interface Pit {
  id: string;
  raceId: number;
  entryTime: Date;
  exitTime: Date;
  entryDriverId: string;
  exitDriverId: string;
  refuel: boolean;
  tyreChange: boolean;
}
