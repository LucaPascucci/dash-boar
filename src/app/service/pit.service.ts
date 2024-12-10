import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { combineLatest, map, Observable, takeUntil } from "rxjs";
import { Pit } from "../model/pit";
import { FirestoreService } from "./firestore.service";
import { Race } from "../model/race";
import { RaceService } from "./race.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class PitService extends FirestoreService {
  protected collectionPath = '/pits';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly raceService = inject(RaceService);
  private readonly activeRace: Signal<Race | undefined> = this.raceService.activeRace;

  readonly activePit: WritableSignal<Pit | undefined> = signal(undefined);


  constructor() {
    super();
    this.getRacePits()
    .pipe(takeUntilDestroyed())
    .subscribe(pits => {
      const activePit = this.getActivePit(pits);
      this.activePit.set(activePit);
    });
  }

  getRacePits(): Observable<Pit[]> {
    return combineLatest({
      pits: collectionData(this.collectionRef),
      activeRace: toObservable(this.activeRace)
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

  getActivePit(pits: Pit[]): Pit | undefined {
    const sortedPits = pits.sort((a, b) => b.entryTime.toDate().getTime() - a.entryTime.toDate().getTime());
    for (const pit of sortedPits) {
      if (!pit.exitTime) {
        return pit;
      }
    }
    return undefined;
  }
}
