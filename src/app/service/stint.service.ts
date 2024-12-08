import { inject, Injectable, Signal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { map, Observable, takeUntil } from "rxjs";
import { Stint } from "../model/stint";
import { FirestoreService } from "./firestore.service";
import { RaceService } from "./race.service";
import { Race } from "../model/race";

@Injectable({
  providedIn: 'root'
})
export class StintService extends FirestoreService {
  private readonly raceService = inject(RaceService);
  protected collectionPath = '/stints';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly activeRace: Signal<Race | undefined>;

  constructor() {
    super();
    this.activeRace = this.raceService.activeRace;
  }

  getStintsForActiveRace(): Observable<Stint[]> {
    return collectionData(this.collectionRef).pipe(
        takeUntil(this.destroy$),
        map((stints: Stint[]) => stints.filter(stint => {
          const activeRace = this.activeRace();
          if (activeRace) {
            return stint.raceId === activeRace.id && !stint.deleted;
          }
          return false
        }))
    );
  }

  async create(stint: Stint): Promise<void> {
    stint.id = await this.generateNextId();
    return this.createData(stint.id, stint);
  }

  update(stint: Stint): Promise<void> {
    return this.updateData(stint.id, stint);
  }

  getById(id: string): Promise<Stint | undefined> {
    return this.getDataById(id);
  }
}
