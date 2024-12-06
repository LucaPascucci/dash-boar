import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  collection,
  collectionData,
  doc, getDocs, query,
  setDoc, where
} from "@angular/fire/firestore";
import { Race } from "../model/race";
import { RaceConfigService } from "./race-config.service";
import { map, Observable, takeUntil } from "rxjs";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class RaceService extends BaseService {
  protected collectionPath: string = '/races';
  protected collectionRef: any = collection(this.firestore, this.collectionPath);

  private readonly raceConfigService = inject(RaceConfigService);

  readonly activeRace: WritableSignal<Race | undefined> =  signal(undefined);

  constructor() {
    super();
    console.log('RaceService constructor')
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
        map((races: Race[]) => races.filter(race => !race.deleted))
    )
  }

  async create(race: Race): Promise<void> {
    if (this.activeRace() !== undefined) {
      console.log('Race already active -> ' + this.activeRace());
      return Promise.resolve();
    }

    race.id = await this.generateNextId();

    const documentReference = doc(this.collectionRef, race.id);
    return setDoc(documentReference, race);
  }

  update(race: Race): Promise<void> {
    return setDoc(doc(this.collectionRef, race.id), race, { merge: true });
  }

  async getById(id: string): Promise<Race | undefined> {
    const q = query(this.collectionRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      return docSnapshot.data() as Race;
    }
    return undefined;
  }

  private getActiveRace(races: Race[]): Race | undefined {
    const now = new Date();
    for (const race of races) {
      const finishDate = race.start.toDate()
      finishDate.setHours(finishDate.getHours() + this.raceConfigService.get().durationHour);
      if (finishDate > now) {
        return race;
      }
    }
    return undefined;
  }
}
