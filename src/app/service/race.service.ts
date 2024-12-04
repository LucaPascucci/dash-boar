import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore, getDocs, query,
  setDoc, where
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Race } from "../model/race";

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private readonly firestorePath: string = '/races';
  private readonly firestore: Firestore = inject(Firestore);
  private readonly racesRef: any;

  constructor() {
    this.racesRef = collection(this.firestore, this.firestorePath);
  }

  getAll(): Observable<Race[]> {
    return collectionData(this.racesRef);
  }

  create(race: Race): Promise<void> {
    const documentReference = race.id ? doc(this.racesRef, race.id) : doc(this.racesRef);
    return setDoc(documentReference, race);
  }

  update(race: Race): Promise<void> {
    return setDoc(doc(this.racesRef, race.id), race, { merge: true });
  }

  delete(id: string): Promise<void> {
    return deleteDoc(doc(this.racesRef, id))
  }

  async getById(id: string): Promise<Race | undefined> {
    const q = query(this.racesRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      return docSnapshot.data() as Race;
    }
    return undefined;
  }
}
