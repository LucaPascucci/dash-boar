import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData, deleteDoc,
  doc,
  Firestore, getDocs, query,
  setDoc, where
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Driver } from "../model/driver";

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly firestorePath: string = '/drivers';
  private readonly firestore: Firestore = inject(Firestore);
  private readonly driversRef: any;

  constructor() {
    this.driversRef = collection(this.firestore, this.firestorePath);
  }

  getAll(): Observable<Driver[]> {
    return collectionData(this.driversRef);
  }

  create(driver: Driver): Promise<void> {
    const documentReference = driver.id ? doc(this.driversRef, driver.id) : doc(this.driversRef);
    return setDoc(documentReference, driver);
  }

  update(driver: Driver): Promise<void> {
    return setDoc(doc(this.driversRef, driver.id), driver, { merge: true });
  }

  async getById(id: string): Promise<Driver | undefined> {
    const q = query(this.driversRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      return docSnapshot.data() as Driver;
    }
    return undefined;
  }

}
