import { computed, inject, Injectable, Signal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { combineLatest, forkJoin, map, Observable, takeUntil, tap } from "rxjs";
import { Pit } from "../model/pit";
import { FirestoreService } from "./firestore.service";
import { Race } from "../model/race";
import { RaceService } from "./race.service";
import { toObservable } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class PitService extends FirestoreService {
  private readonly raceService = inject(RaceService);
  protected collectionPath = '/pits';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly activeRace: Signal<Race | undefined>;

  constructor() {
    super();
    this.activeRace = this.raceService.activeRace;
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
}
