import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { combineLatest, map, Observable, takeUntil } from "rxjs";
import { Stint } from "../model/stint";
import { FirestoreService } from "./firestore.service";
import { RaceService } from "./race.service";
import { Race } from "../model/race";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class StintService extends FirestoreService {
  private readonly raceService = inject(RaceService);
  protected collectionPath = '/stints';
  protected collectionRef = collection(this.firestore, this.collectionPath);
  private readonly activeRace: Signal<Race | undefined> = this.raceService.activeRace;

  readonly stints: WritableSignal<Stint[]> = signal([]);
  readonly activeStint: WritableSignal<Stint | undefined> = signal(undefined);

  constructor() {
    super();
    this.getRaceStints()
    .pipe(takeUntilDestroyed())
    .subscribe(stints => {
      this.stints.set(stints);
      const activeStint = this.getActiveStint(stints);
      this.activeStint.set(activeStint);
    });
  }

  getRaceStints(): Observable<Stint[]> {
    return combineLatest({
      stints: collectionData(this.collectionRef),
      activeRace: toObservable(this.activeRace)
    })
    .pipe(
        takeUntil(this.destroy$),
        map(({stints, activeRace}) => {
          if (activeRace) {
            return (stints as Stint[]).filter(stints => !stints.deleted && stints.raceId === activeRace.id);
          }
          return []
        })
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

  private getActiveStint(stints: Stint[]): Stint | undefined {
    const sortedStints = stints.sort((a, b) => b.startDate.toDate().getTime() - a.startDate.toDate().getTime());
    for (const stint of sortedStints) {
      if (!stint.endDate) {
        return stint;
      }
    }
    return undefined;
  }
}
