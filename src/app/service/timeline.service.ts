import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { TimelineStep } from "../model/timeline-step";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { StintService } from "./stint.service";
import { StintOptimizerService } from "./stint-optimizer.service";
import { Stint } from "../model/stint";
import { PitService } from "./pit.service";
import { Pit } from "../model/pit";
import { OptimizedStint } from "../model/optimized-stint";
import { RaceConfigService } from "./race-config.service";
import { RaceConfig } from "../model/race-config";
import { addMilliseconds, addSeconds, secondsToMilliseconds } from "date-fns";
import { TyreService } from "./tyre.service";

@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  private readonly stintService = inject(StintService);
  private readonly pitService = inject(PitService);
  private readonly stintOptimizerService = inject(StintOptimizerService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly tyreService = inject(TyreService);

  readonly timelineSteps: WritableSignal<TimelineStep[]> = signal([]);

  constructor() {
    combineLatest({
      stints: toObservable(this.stintService.stints),
      pits: toObservable(this.pitService.pits),
      remainingDriverChanges: toObservable(this.pitService.remainingDriverChanges),
      raceConfig: toObservable(this.raceConfigService.activeRaceConfig),
      optimizedStint: toObservable(this.stintOptimizerService.optimizedStint),
      remainingTyreChange: toObservable(this.tyreService.remainingTyreChange),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({stints, pits, remainingDriverChanges, raceConfig, optimizedStint, remainingTyreChange}) => {

      let result: TimelineStep[] = this.createRealSteps(stints, pits);

      result = result.sort((a, b) => a.start.getTime() - b.start.getTime());

      if (remainingDriverChanges > 0 && optimizedStint && raceConfig) {
        const futureSteps = this.createFutureSteps(
            result.at(result.length - 1),
            remainingDriverChanges,
            optimizedStint,
            raceConfig,
            remainingTyreChange);
        result.push(...futureSteps);
      }

      result = result.sort((a, b) => a.start.getTime() - b.start.getTime());

      this.timelineSteps.set(result);

    })
  }

  private createRealSteps(stints: Stint[], pits: Pit[]): TimelineStep[] {
    const result: TimelineStep[] = [];

    stints.forEach((stint) => {
      result.push(this.createTimelineStepFromStint(stint));
    })

    pits.forEach((pit) => {
      result.push(this.createTimelineStepFromPit(pit));
    })

    return result;
  }

  private createTimelineStepFromPit(pit: Pit): TimelineStep {
    return {
      durationMills: pit.exitTime ? (pit.exitTime.toDate().getTime() - pit.entryTime.toDate().getTime()) : undefined,
      end: pit.exitTime?.toDate(),
      pit: pit,
      start: pit.entryTime.toDate(),
      status: pit.exitTime ? 'DONE' : 'ACTIVE',
      stint: undefined,
      type: 'PIT'
    }
  }

  private createTimelineStepFromStint(stint: Stint): TimelineStep {
    return {
      durationMills: stint.endDate ? (stint.endDate.toDate().getTime() - stint.startDate.toDate().getTime()) : undefined,
      end: stint.endDate?.toDate(),
      pit: undefined,
      start: stint.startDate.toDate(),
      status: stint.endDate ? 'DONE' : 'ACTIVE',
      stint: stint,
      type: 'STINT'
    }
  }

  private createFutureSteps(
      lastRealStep: TimelineStep | undefined,
      remainingDriverChanges: number,
      optimizedStint: OptimizedStint,
      raceConfig: RaceConfig,
      remainingTyreChange: number
  ): TimelineStep[] {

    const result: TimelineStep[] = [];
    let lastEndDate: Date = this.calculateLastEndDateFromRealStep(lastRealStep, optimizedStint, raceConfig);

    if (lastRealStep === undefined || lastRealStep.type === 'PIT') {
      const stintEndDate = addMilliseconds(lastEndDate, optimizedStint.avgStintMillisecondsTime);
      result.push(this.createFutureStintStep(lastEndDate, stintEndDate, optimizedStint.avgStintMillisecondsTime))
      lastEndDate = stintEndDate;
    }

    const midPoint = Math.floor(remainingDriverChanges / 2);

    for (let i = 0; i < remainingDriverChanges; i++) {

      let pitDuration = secondsToMilliseconds(raceConfig.minPitSeconds);

      if (remainingTyreChange > 0 && i >= midPoint - Math.floor(remainingTyreChange / 2) && i < midPoint + Math.ceil(remainingTyreChange / 2)) {
        pitDuration = secondsToMilliseconds(raceConfig.minPitWithTyreChangeSeconds);
        remainingTyreChange--;
      }

      const pitEndDate = addMilliseconds(lastEndDate, pitDuration);
      result.push(this.createFuturePitStep(lastEndDate, pitEndDate, pitDuration));
      const stintEndDate = addMilliseconds(pitEndDate, optimizedStint.avgStintMillisecondsTime);
      result.push(this.createFutureStintStep(pitEndDate, stintEndDate, optimizedStint.avgStintMillisecondsTime));
      lastEndDate = stintEndDate;
    }

    return result;
  }

  private createFutureStintStep(start: Date, end: Date, durationMills: number): TimelineStep {
    return {
      durationMills: durationMills,
      end: end,
      pit: undefined,
      start: start,
      status: 'FUTURE',
      stint: undefined,
      type: 'STINT'
    }
  }

  private createFuturePitStep(start: Date, end: Date, durationMills: number): TimelineStep {
    return {
      durationMills: durationMills,
      end: end,
      pit: undefined,
      start: start,
      status: 'FUTURE',
      stint: undefined,
      type: 'PIT'
    }
  }

  private calculateLastEndDateFromRealStep(lastRealStep: TimelineStep | undefined,
                                           optimizedStint: OptimizedStint,
                                           raceConfig: RaceConfig): Date {
    if (lastRealStep === undefined) {
      return new Date();
    }
    let supposedEndDate: Date;
    if (lastRealStep.type === 'PIT') {
      supposedEndDate = addSeconds(lastRealStep.start, raceConfig.minPitSeconds);
    } else {
      supposedEndDate = addMilliseconds(lastRealStep.start, optimizedStint.avgStintMillisecondsTime);
    }
    return supposedEndDate > new Date ? supposedEndDate : new Date();
  }
}
