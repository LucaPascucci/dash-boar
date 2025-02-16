import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { Race } from "../model/race";
import { RaceConfigService } from "./race-config.service";
import { combineLatest, map, Observable, takeUntil } from "rxjs";
import { FirestoreService } from "./firestore.service";
import { addHours } from 'date-fns';
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { DocumentData } from "@angular/fire/compat/firestore";
import { RaceConfig } from "../model/race-config";

@Injectable({
  providedIn: 'root'
})
export class RaceService extends FirestoreService {
  protected collectionPath = '/races';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly raceConfigService = inject(RaceConfigService);

  readonly activeRace: WritableSignal<Race | undefined> = signal(undefined);
  readonly willEndRaceDate: WritableSignal<Date | undefined> = signal(undefined);

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
        const activeRace = this.getActiveRace(races);
        const willEndRaceDate = this.getWillEndRaceDate(activeRace, raceConfig)
        return { activeRace: activeRace, willEndRaceDate: willEndRaceDate };
      }
      return { activeRace: undefined, willEndRaceDate: undefined};
    }))
    .subscribe((result, )  => {
      this.activeRace.set(result.activeRace);
      this.willEndRaceDate.set(result.willEndRaceDate);
    });
  }

  async create(race: Race): Promise<Race | void> {
    if (this.activeRace() !== undefined) {
      console.warn('Race already active -> ' + this.activeRace());
      return Promise.resolve();
    }

    race.id = await this.generateNextId();
    await this.createData(race.id, race);
    return race;
  }

  update(race: Race): Promise<void> {
    return this.updateData(race.id, race);
  }

  private getAll(): Observable<Race[]> {
    return collectionData(this.collectionRef).pipe(
        takeUntil(this.destroyed),
        map((data: DocumentData[]) => data.map(doc => doc as Race).filter(race => !race.deleted))
    );
  }

  private getActiveRace(races: Race[]): Race | undefined {
    const sortedRaces = races.sort((a, b) => b.start.toDate().getTime() - a.start.toDate().getTime());
    return sortedRaces.at(0);
  }

  private getWillEndRaceDate(activeRace: Race | undefined, raceConfig: RaceConfig): Date | undefined {
    if (activeRace === undefined) {
      return undefined;
    }

    if (activeRace.end !== null) {
      return activeRace.end.toDate();
    }

    return addHours(activeRace.start.toDate(), raceConfig.durationHour)
  }
}
