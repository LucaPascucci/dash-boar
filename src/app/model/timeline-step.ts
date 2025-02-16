import { Pit } from "./pit";
import { Stint } from "./stint";

export interface TimelineStep {
  type: 'STINT' | 'PIT';
  pit: Pit | undefined;
  stint: Stint | undefined;
  start: Date;
  end: Date | undefined;
  durationMills: number | undefined;
  status: 'DONE' | 'ACTIVE' | 'FUTURE'
}
