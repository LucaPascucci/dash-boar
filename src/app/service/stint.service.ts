import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { combineLatest, interval, map, Observable, takeUntil } from "rxjs";
import { Stint } from "../model/stint";
import { FirestoreService } from "./firestore.service";
import { RaceService } from "./race.service";
import { Race } from "../model/race";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { RaceConfigService } from "./race-config.service";
import { StintOptimizerService } from "./stint-optimizer.service";
import { RaceConfig } from "../model/race-config";
import { OptimizedStint } from "../model/optimized-stint";

@Injectable({
  providedIn: 'root'
})
export class StintService extends FirestoreService {
  protected collectionPath = '/stints';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly stintOptimizerService = inject(StintOptimizerService);

  private readonly activeRace: Signal<Race | undefined> = this.raceService.activeRace;

  readonly stints: WritableSignal<Stint[]> = signal([]);
  readonly activeStint: WritableSignal<Stint | undefined> = signal(undefined);
  readonly activeStintTimeOnTrack: WritableSignal<number> = signal(0);
  readonly activeStintLaps: WritableSignal<number> = signal(0);
  readonly activeStintRemainingTimeOnTrack: WritableSignal<number> = signal(0);
  readonly activeStintRemainingLaps: WritableSignal<number> = signal(0);
  readonly activeStintGainedTimeOnTrack: WritableSignal<number> = signal(0);
  readonly activeStintGainedLaps: WritableSignal<number> = signal(0);

  constructor() {
    super();
    combineLatest({
      stints: this.getRaceStints(),
      activeRaceConfig: toObservable(this.raceConfigService.activeRaceConfig),
      optimizedStint: toObservable(this.stintOptimizerService.optimizedStint),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({stints, activeRaceConfig, optimizedStint}) => {
      this.stints.set(stints);
      this.activeStint.set(this.getActiveStint(stints));
      this.activeStintTimeOnTrack.set(this.calculateActiveStintTimeOnTrack(this.activeStint()));
      this.activeStintLaps.set(this.calculateActiveStintLaps(this.activeStintTimeOnTrack(), activeRaceConfig));
      this.activeStintRemainingTimeOnTrack.set(this.calculateActiveStintRemainingTimeOnTrack(this.activeStintTimeOnTrack(), optimizedStint));
      this.activeStintRemainingLaps.set(this.calculateActiveStintRemainingLaps(this.activeStintLaps(), optimizedStint));
      this.activeStintGainedTimeOnTrack.set(this.calculateActiveStintGainedTimeOnTrack(this.activeStintTimeOnTrack(), optimizedStint));
      this.activeStintGainedLaps.set(this.calculateActiveStintGainedLaps(this.activeStintLaps(), optimizedStint));
    })
  }

  async create(stint: Stint): Promise<Stint> {
    stint.id = await this.generateNextId();
    await this.createData(stint.id, stint);
    return stint;
  }

  async update(stint: Stint): Promise<Stint> {
    await this.updateData(stint.id, stint);
    return stint;
  }

  private getRaceStints(): Observable<Stint[]> {
    return combineLatest({
      stints: collectionData(this.collectionRef),
      activeRace: toObservable(this.activeRace)
    })
    .pipe(
        takeUntil(this.destroyed),
        map(({stints, activeRace}) => {
          if (activeRace) {
            return (stints as Stint[])
            .filter(stints => !stints.deleted && stints.raceId === activeRace.id)
            .sort((a, b) => b.startDate.toDate().getTime() - a.startDate.toDate().getTime());
          }
          return []
        })
    );
  }

  private getActiveStint(stints: Stint[]): Stint | undefined {
    for (const stint of stints) {
      if (!stint.endDate) {
        return stint;
      }
    }
    return undefined;
  }

  private calculateActiveStintTimeOnTrack(activeStint: Stint | undefined): number {
    if (activeStint) {
      return new Date().getTime() - activeStint.startDate.toDate().getTime();
    }
    return 0;
  }

  private calculateActiveStintLaps(timeOnTrack: number, raceConfig: RaceConfig | undefined): number {
    if (timeOnTrack >= 0 && raceConfig) {
      return Math.floor(timeOnTrack / raceConfig.referenceLapTimeMillisecond);
    }
    return 0;
  }

  private calculateActiveStintRemainingTimeOnTrack(timeOnTrack: number, optimizedStint: OptimizedStint | undefined): number {
    if (timeOnTrack >= 0 && optimizedStint) {
      return optimizedStint.avgStintMillisecondsTime - timeOnTrack;
    }
    return 0;
  }

  private calculateActiveStintRemainingLaps(laps: number, optimizedStint: OptimizedStint | undefined): number {
    let result = 0;
    if (laps >= 0 && optimizedStint) {
      result = optimizedStint.laps - laps;
    }
    return result > 0 ? result : 0;
  }

  private calculateActiveStintGainedTimeOnTrack(timeOnTrack: number, optimizedStint: OptimizedStint | undefined): number {
    let result = 0;
    if (timeOnTrack >= 0 && optimizedStint) {
      result = optimizedStint.avgStintMillisecondsTime - timeOnTrack;
    }
    return result < 0 ? Math.abs(result) : 0;
  }

  private calculateActiveStintGainedLaps(laps: number, optimizedStint: OptimizedStint | undefined): number {
    let result = 0;
    if (laps >= 0 && optimizedStint) {
      result = optimizedStint.laps - laps;
    }
    return result < 0 ? Math.abs(result) : 0;
  }
}
