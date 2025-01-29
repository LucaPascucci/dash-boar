import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { combineLatest, interval, map, Observable, takeUntil } from "rxjs";
import { Pit } from "../model/pit";
import { FirestoreService } from "./firestore.service";
import { RaceService } from "./race.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { RaceConfigService } from "./race-config.service";
import { RaceConfig } from "../model/race-config";
import { addSeconds } from "date-fns";

@Injectable({
  providedIn: 'root'
})
export class PitService extends FirestoreService {
  protected collectionPath = '/pits';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);

  readonly activePit: WritableSignal<Pit | undefined> = signal(undefined);
  readonly activePitRemainingMilliseconds: WritableSignal<number> = signal(0);
  readonly lastRefuelPit: WritableSignal<Pit | undefined> = signal(undefined);
  readonly pits: WritableSignal<Pit[]> = signal([]);
  readonly completedDriverChanges: WritableSignal<number> = signal(0);
  readonly lastPit: WritableSignal<Pit | undefined> = signal(undefined);
  readonly remainingDriverChanges: WritableSignal<number> = signal(0);

  constructor() {
    super();
    combineLatest({
      pits: this.getRacePits(),
      activeRaceConfig: toObservable(this.raceConfigService.activeRaceConfig),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({pits, activeRaceConfig}) => {
      this.pits.set(pits);
      this.activePit.set(this.getActivePit(pits));
      this.activePitRemainingMilliseconds.set(this.calculateActivePitRemainingMilliseconds(pits, activeRaceConfig))
      this.lastRefuelPit.set(this.getLastRefuelPit(pits));
      this.lastPit.set(this.getLastPit(pits));
      this.completedDriverChanges.set(this.calculateCompletedDriverChanges(pits));
      this.remainingDriverChanges.set(this.calculateRemainingDriverChanges(pits, activeRaceConfig));
    });
  }

  async create(pit: Pit): Promise<Pit> {
    pit.id = await this.generateNextId();
    await this.createData(pit.id, pit);
    return pit;
  }

  update(pit: Pit): Promise<void> {
    return this.updateData(pit.id, pit);
  }

  private getRacePits(): Observable<Pit[]> {
    return combineLatest({
      pits: collectionData(this.collectionRef),
      activeRace: toObservable(this.raceService.activeRace)
    })
    .pipe(
        takeUntil(this.destroyed),
        map(({pits, activeRace}) => {
          if (activeRace) {
            return (pits as Pit[])
            .filter(pit => !pit.deleted && pit.raceId === activeRace.id)
            .sort((a, b) => b.entryTime.toDate().getTime() - a.entryTime.toDate().getTime());
          }
          return []
        })
    );
  }

  private getActivePit(pits: Pit[]): Pit | undefined {
    for (const pit of pits) {
      if (!pit.exitTime) {
        return pit;
      }
    }
    return undefined;
  }

  private calculateActivePitRemainingMilliseconds(pits: Pit[], raceConfig: RaceConfig | undefined): number  {
    if (!raceConfig) {
      return 0;
    }

    const activePit = this.getActivePit(pits);
    if (activePit) {
      const now = new Date().getTime();
      const endPitTime = addSeconds(activePit.entryTime.toDate(), raceConfig.minPitSeconds).getTime()
      return endPitTime - now;
    }

    return 0;
  }

  private getLastRefuelPit(pits: Pit[]): Pit | undefined {
    const filteredRefuelPits = pits
    .filter(pit => pit.refuel && pit.exitTime)
    .sort((a, b) => b.entryTime.toDate().getTime() - a.entryTime.toDate().getTime());
    return filteredRefuelPits.at(0);
  }

  private getLastPit(pits: Pit[]): Pit | undefined {
    if (pits.length === 0) {
      return undefined;
    }

    const sortedPits = pits.sort((a, b) => b.entryTime.toDate().getTime() - a.entryTime.toDate().getTime());

    return sortedPits.at(0);
  }

  private calculateCompletedDriverChanges(pits: Pit[]) {
    return pits
    .reduce((count, pit) => {
      return count + (pit.entryDriverId !== pit.exitDriverId ? 1 : 0);
    }, 0);
  }

  private calculateRemainingDriverChanges(pits: Pit[], raceConfig: RaceConfig | undefined): number {
    if (!raceConfig) {
      return 0;
    }
    return Math.max(0, raceConfig.minDriverChange - this.calculateCompletedDriverChanges(pits));
  }
}
