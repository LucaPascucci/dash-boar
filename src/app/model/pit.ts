import { Timestamp } from "@firebase/firestore";

export interface Pit {
  id: string;
  raceId: string;
  entryTime: Timestamp;
  exitTime: Timestamp | undefined;
  entryDriverId: string;
  exitDriverId: string;
  refuel: boolean;
  tyreChange: boolean;
  deleted: boolean;
}
