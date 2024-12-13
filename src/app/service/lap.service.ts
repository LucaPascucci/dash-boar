import { inject, Injectable, signal, Signal } from '@angular/core';
import { collection, collectionData, } from "@angular/fire/firestore";
import { combineLatest, map, Observable, takeUntil } from "rxjs";
import { FirestoreService } from "./firestore.service";
import { Lap } from "../model/lap";
import { Race } from "../model/race";
import { RaceService } from "./race.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Pit } from "../model/pit";

@Injectable({
  providedIn: 'root'
})
export class LapService extends FirestoreService {
  protected collectionPath = '/laps';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly raceService = inject(RaceService);
  private readonly activeRace: Signal<Race | undefined> = this.raceService.activeRace;

  readonly referenceLapTimeMillisecond = signal(64567); // TODO: calcolare vero valore


  constructor() {
    super();
  }

  getRaceLaps(): Observable<Lap[]> {
    return combineLatest({
      laps: collectionData(this.collectionRef),
      activeRace: toObservable(this.activeRace)
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
