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
  readonly activePitRemainingMilliseconds: WritableSignal<number | undefined> = signal(undefined);
  readonly lastRefuelPit: WritableSignal<Pit | undefined> = signal(undefined);
  readonly pits: WritableSignal<Pit[]> = signal([]);
  readonly completedDriverChanges: WritableSignal<number> = signal(0);
  readonly lastDriverChangePit: WritableSignal<Pit | undefined> = signal(undefined);
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
      this.lastDriverChangePit.set(this.getLastDriverChangePit(pits));
      this.completedDriverChanges.set(this.calculateCompletedDriverChanges(pits));
      this.remainingDriverChanges.set(this.calculateRemainingDriverChanges(pits, activeRaceConfig));
    });

    this.getRacePits()
    .pipe(takeUntilDestroyed())
    .subscribe(pits => {

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

  getById(id: string): Promise<Pit | undefined> {
    return this.getDataById(id);
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
            return (pits as Pit[]).filter(pit => !pit.deleted && pit.raceId === activeRace.id);
          }
          return []
        })
    );
  }

  private getActivePit(pits: Pit[]): Pit | undefined {
    const sortedPits = pits.sort((a, b) => b.entryTime.toDate().getTime() - a.entryTime.toDate().getTime());
    for (const pit of sortedPits) {
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
    const sortedRefuelPits = pits
    .filter(pit => pit.refuel && pit.exitTime !== undefined)
    .sort((a, b) => {
      const exitTimeA = a.exitTime ? a.exitTime.toDate().getTime() : 0;
      const exitTimeB = b.exitTime ? b.exitTime.toDate().getTime() : 0;
      return exitTimeB - exitTimeA;
    });

    return sortedRefuelPits.at(0);
  }

  private getLastDriverChangePit(pits: Pit[]): Pit | undefined {
    if (pits.length === 0) {
      return undefined;
    }

    // Sort the stints by startDate in descending order
    const sortedPits = pits
    .filter(pit => pit.exitTime)
    .sort((a, b) => b.entryTime.toMillis() - a.entryTime.toMillis());

    for (const pit of sortedPits) {
      if (pit.entryDriverId !== pit.exitDriverId) {
        return pit
      }
    }
    return undefined;
  }

  private calculateCompletedDriverChanges(pits: Pit[]) {
    return pits
    .filter(pit => pit.exitTime)
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
