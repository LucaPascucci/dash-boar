import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { Race } from "../model/race";
import { RaceConfigService } from "./race-config.service";
import { combineLatest, map, Observable, takeUntil } from "rxjs";
import { FirestoreService } from "./firestore.service";
import { addHours } from 'date-fns';
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { RaceConfig } from "../model/race-config";

@Injectable({
  providedIn: 'root'
})
export class RaceService extends FirestoreService {
  protected collectionPath = '/races';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly raceConfigService = inject(RaceConfigService);

  readonly activeRace: WritableSignal<Race | undefined> = signal(undefined);
  readonly endRaceDate: WritableSignal<Date | undefined> = signal(undefined);

  constructor() {
    super();

    combineLatest({
      races: this.getAll(),
      raceConfig: toObservable(this.raceConfigService.activeRaceConfig)
    })
    .pipe(
        takeUntilDestroyed(),
        map(({races, raceConfig}) => {
      if (races && raceConfig) {
        const activeRace = this.getActiveRace(races, raceConfig);
        const endRaceDate = (activeRace) ? addHours(activeRace.start.toDate(), raceConfig.durationHour) : undefined;
        return { activeRace: activeRace, endRaceDate: endRaceDate };
      }
      return { activeRace: undefined, endRaceDate: undefined};
    }))
    .subscribe((result, )  => {
      this.activeRace.set(result.activeRace);
      this.endRaceDate.set(result.endRaceDate);
    });
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

  private getAll(): Observable<Race[]> {
    return collectionData(this.collectionRef).pipe(
        takeUntil(this.destroy$),
        map((races: Race[]) => races.filter(race => !race.deleted))
    );
  }

  private getActiveRace(races: Race[], raceConfig: RaceConfig): Race | undefined {
    const now = new Date();
    const sortedRaces = races.sort((a, b) => b.start.toDate().getTime() - a.start.toDate().getTime());

    for (const race of sortedRaces) {
      const finishDate = addHours(race.start.toDate(), raceConfig.durationHour);
      if (finishDate >= now) {
        return race;
      }
    }
    return undefined;
  }
}
