import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { combineLatest, map, Observable, takeUntil } from "rxjs";
import { Pit } from "../model/pit";
import { FirestoreService } from "./firestore.service";
import { RaceService } from "./race.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class PitService extends FirestoreService {
  protected collectionPath = '/pits';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly raceService = inject(RaceService);

  readonly activePit: WritableSignal<Pit | undefined> = signal(undefined);
  readonly lastRefuelPit: WritableSignal<Pit | undefined> = signal(undefined);
  readonly pits: WritableSignal<Pit[]> = signal([]);

  constructor() {
    super();
    this.getRacePits()
    .pipe(takeUntilDestroyed())
    .subscribe(pits => {
      this.pits.set(pits);
      this.activePit.set(this.getActivePit(pits));
      this.lastRefuelPit.set(this.getLastRefuelPit(pits));
    });
  }

  async create(pit: Pit): Promise<void> {
    pit.id = await this.generateNextId();
    return this.createData(pit.id, pit);
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
        takeUntil(this.destroy$),
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
}
