import { Timestamp } from "@firebase/firestore";

export interface Pit {
  id: string;
  raceId: string;
  entryTime: Timestamp;
  exitTime: Timestamp | null;
  entryDriverId: string;
  exitDriverId: string;
  refuel: boolean;
  tyreChange: boolean;
  interphoneChange: boolean;
  deleted: boolean;
}
