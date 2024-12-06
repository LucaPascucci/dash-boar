import { Injectable } from '@angular/core';
import {
  collection,
  collectionData
} from "@angular/fire/firestore";
import { map, Observable } from "rxjs";
import { Stint } from "../model/stint";
import { FirestoreService } from "./firestore.service";

@Injectable({
  providedIn: 'root'
})
export class StintService extends FirestoreService {
  protected collectionPath: string = '/stints';
  protected collectionRef: any = collection(this.firestore, this.collectionPath);

  constructor() {
    super();
  }

  getAll(): Observable<Stint[]> {
    return collectionData(this.collectionRef).pipe(
        map((stints: Stint[]) => stints.filter(stint => !stint.deleted))
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
}
