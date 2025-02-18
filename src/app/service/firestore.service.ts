import { DestroyRef, inject, Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { doc, Firestore, getDocs, query, setDoc, where } from "@angular/fire/firestore";
import { Entity } from "../model/entity";

@Injectable({
  providedIn: 'root'
})
export abstract class FirestoreService {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly firestore = inject(Firestore);
  protected readonly destroyed = new Subject<void>();

  protected abstract collectionPath: string;
  protected abstract collectionRef: any;

  protected constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed.next();
      this.destroyed.complete();
    });
  }

  protected async generateNextId(): Promise<string> {
    const querySnapshot = await getDocs(this.collectionRef);
    let maxId = 0;
    querySnapshot.forEach(doc => {
      const entityData = doc.data() as Entity;
      const entityId = parseInt(entityData.id, 10);
      if (!isNaN(entityId) && entityId > maxId) {
        maxId = entityId;
      }
    });
    // Increment the highest ID to generate a new ID
    return (maxId + 1).toString();
  }

  protected createData(id: string, data: any): Promise<void> {
    const documentReference = doc(this.collectionRef, id);
    return setDoc(documentReference, data);
  }

  protected updateData(id: string, data: any): Promise<void> {
    return setDoc(doc(this.collectionRef, id), data, {merge: true});
  }

  protected async getDataById(id: string): Promise<any | undefined> {
    const q = query(this.collectionRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      return docSnapshot.data();
    }
    return undefined;
  }
}
