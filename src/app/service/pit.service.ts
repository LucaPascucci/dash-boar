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
import { Pit } from "../model/pit";

@Injectable({
  providedIn: 'root'
})
export class PitService {
  private readonly firestorePath: string = '/pits';
  private readonly firestore: Firestore = inject(Firestore);
  private readonly pitsRef: any;

  constructor() {
    this.pitsRef = collection(this.firestore, this.firestorePath);
  }

  getAll(): Observable<Pit[]> {
    return collectionData(this.pitsRef);
  }

  create(pit: Pit): Promise<void> {
    const documentReference = pit.id ? doc(this.pitsRef, pit.id) : doc(this.pitsRef);
    return setDoc(documentReference, pit);
  }

  update(pit: Pit): Promise<void> {
    return setDoc(doc(this.pitsRef, pit.id), pit, { merge: true });
  }

  delete(id: string): Promise<void> {
    return deleteDoc(doc(this.pitsRef, id))
  }

  async getById(id: string): Promise<Pit | undefined> {
    const q = query(this.pitsRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      return docSnapshot.data() as Pit;
    }
    return undefined;
  }
}
