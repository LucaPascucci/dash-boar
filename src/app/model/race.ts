import { Timestamp } from "@firebase/firestore";

export interface Race {
  id: string;
  start: Timestamp;
  deleted: boolean;
}
