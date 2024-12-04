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
import { Stint } from "../model/stint";

@Injectable({
  providedIn: 'root'
})
export class StintService {
  private readonly firestorePath: string = '/stints';
  private readonly firestore: Firestore = inject(Firestore);
  private readonly stintsRef: any;

  constructor() {
    this.stintsRef = collection(this.firestore, this.firestorePath);
  }

  getAll(): Observable<Stint[]> {
    return collectionData(this.stintsRef);
  }

  create(stint: Stint): Promise<void> {
    const documentReference = stint.id ? doc(this.stintsRef, stint.id) : doc(this.stintsRef);
    return setDoc(documentReference, stint);
  }

  update(stint: Stint): Promise<void> {
    return setDoc(doc(this.stintsRef, stint.id), stint, { merge: true });
  }

  delete(id: string): Promise<void> {
    return deleteDoc(doc(this.stintsRef, id))
  }

  async getById(id: string): Promise<Stint | undefined> {
    const q = query(this.stintsRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      return docSnapshot.data() as Stint;
    }
    return undefined;
  }
}
