import { Timestamp } from "@firebase/firestore";

export interface Stint {
  id: string;
  raceId: string;
  driverId: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  deleted: boolean
}
