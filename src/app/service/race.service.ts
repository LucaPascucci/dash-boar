import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { Race } from "../model/race";
import { RaceConfigService } from "./race-config.service";
import { map, Observable, takeUntil } from "rxjs";
import { FirestoreService } from "./firestore.service";
import { addHours } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class RaceService extends FirestoreService {
  protected collectionPath = '/races';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly raceConfigService = inject(RaceConfigService);

  readonly activeRace: WritableSignal<Race | undefined> = signal(undefined);

  constructor() {
    super();
    this.getAll().pipe(
        takeUntil(this.destroy$)
    ).subscribe(races => {
      const activeRace = this.getActiveRace(races);
      this.activeRace.set(activeRace);
    });
  }

  // NOTE: emette due valori uguali
  getAll(): Observable<Race[]> {
    return collectionData(this.collectionRef).pipe(
        takeUntil(this.destroy$),
        map((races: Race[]) => races.filter(race => !race.deleted))
    );
  }

  async create(race: Race): Promise<void> {
    if (this.activeRace() !== undefined) {
      console.warn('Race already active -> ' + this.activeRace());
      return Promise.resolve();
    }

    race.id = await this.generateNextId();
    return this.createData(race.id, race);
  }

  updateRace(race: Race): Promise<void> {
    return this.updateData(race.id, race)
  }

  getById(id: string): Promise<Race | undefined> {
    return this.getDataById(id);
  }

  private getActiveRace(races: Race[]): Race | undefined {
    const now = new Date();
    for (const race of races) {
      const finishDate = addHours(race.start.toDate(), this.raceConfigService.get().durationHour);
      if (finishDate > now) {
        return race;
      }
    }
    return undefined;
  }
}
