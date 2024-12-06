import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subject } from "rxjs";
import { Firestore, getDocs } from "@angular/fire/firestore";
import { Entity } from "../model/entity";

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService implements OnDestroy {
  protected readonly firestore = inject(Firestore);
  protected readonly destroy$: Subject<void> = new Subject<void>();

  protected abstract collectionPath: string;
  protected abstract collectionRef: any;

  constructor() {
  }

  async generateNextId(): Promise<string> {
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

  ngOnDestroy(): void {
    // Emit a value to complete all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
}
