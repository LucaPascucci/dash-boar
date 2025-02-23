import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { StintService } from "./stint.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { DeltaStint } from "../model/delta-stint";
import { Stint } from "../model/stint";

@Injectable({
  providedIn: 'root'
})
export class DeltaStintService {
  private readonly stintService = inject(StintService);

  readonly deltaStints: WritableSignal<DeltaStint[]> = signal([]);
  readonly totalDeltaMilliseconds: WritableSignal<number> = signal(0);
  readonly deltaMilliseconds: WritableSignal<number> = signal(0);


  constructor() {
    combineLatest({
      stints: toObservable(this.stintService.stints),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({stints}) => {
      const deltaStints = this.createDeltaStints(stints)
      this.deltaStints.set(deltaStints);
      this.totalDeltaMilliseconds.set(deltaStints.reduce((accumulator, currentValue) => accumulator + currentValue.delta, 0));
      this.deltaMilliseconds.set(
          this.createDeltaStints(this.filterCompletedStints(stints))
          .reduce((accumulator, currentValue) => accumulator + currentValue.delta, 0)
      );
    })
  }

  private filterCompletedStints(stints: Stint[]): Stint[] {
    return stints.filter(stint => stint.endDate !== null);
  }

  private createDeltaStints(stints: Stint[]): DeltaStint[] {
    const result: DeltaStint[] = [];
    stints.forEach(stint => {
      result.push(this.createDeltaStint(stint));
    })
    return result;
  }

  private createDeltaStint(stint: Stint): DeltaStint {
    const endDate: Date = stint.endDate ? stint.endDate.toDate() : new Date();
    const timeOnTrack: number = endDate.getTime() - stint.startDate.toDate().getTime();
    const delta = timeOnTrack - stint.optimumMilliseconds;

    return {
      id: stint.id,
      delta: delta,
      optimum: stint.optimumMilliseconds,
      timeOnTrack: timeOnTrack
    }
  }
}
