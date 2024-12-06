import { Injectable } from '@angular/core';
import { collection, collectionData } from "@angular/fire/firestore";
import { map, Observable } from "rxjs";
import { Pit } from "../model/pit";
import { FirestoreService } from "./firestore.service";

@Injectable({
  providedIn: 'root'
})
export class PitService extends FirestoreService {
  protected collectionPath: string = '/pits';
  protected collectionRef: any = collection(this.firestore, this.collectionPath);

  constructor() {
    super();
  }

  getAll(): Observable<Pit[]> {
    return collectionData(this.collectionRef).pipe(
        map((pits: Pit[]) => pits.filter(pit => !pit.deleted))
    );
  }

  async create(pit: Pit): Promise<void> {
    pit.id = await this.generateNextId();
    return this.createData(pit.id, pit);
  }

  update(pit: Pit): Promise<void> {
    return this.updateData(pit.id, pit);
  }

  getById(id: string): Promise<Pit | undefined> {
    return this.getDataById(id);
  }
}
