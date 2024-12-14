import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { collection, collectionData, } from "@angular/fire/firestore";
import { combineLatest, map, Observable } from "rxjs";
import { FirestoreService } from "./firestore.service";
import { Lap } from "../model/lap";
import { RaceService } from "./race.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class LapService extends FirestoreService {
  protected collectionPath = '/laps';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly raceService = inject(RaceService);

  readonly laps: WritableSignal<Lap[]> = signal([]);

  constructor() {
    super();
    combineLatest({
      laps: this.getRaceLaps(),
      activeRace: toObservable(this.raceService.activeRace)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(result => this.laps.set(result.laps))
  }

  private getRaceLaps(): Observable<Lap[]> {
    return combineLatest({
      laps: collectionData(this.collectionRef),
      activeRace: toObservable(this.raceService.activeRace)
    })
    .pipe(
        takeUntilDestroyed(),
        map(({laps, activeRace}) => {
          if (activeRace) {
            return (laps as Lap[]).filter(lap => !lap.deleted && lap.raceId === activeRace.id);
          }
          return []
        })
    );
  }

  async create(lap: Lap): Promise<void> {
    lap.id = await this.generateNextId();
    return this.createData(lap.id, lap);
  }

  update(driver: Lap): Promise<void> {
    return this.updateData(driver.id, driver);
  }

  getById(id: string): Promise<Lap | undefined> {
    return this.getDataById(id);
  }

}
