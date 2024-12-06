import { Timestamp } from "@firebase/firestore";

export interface Pit {
  id: string;
  raceId: number;
  entryTime: Timestamp;
  exitTime: Timestamp;
  entryDriverId: string;
  exitDriverId: string;
  refuel: boolean;
  tyreChange: boolean;
  deleted: boolean;
}
