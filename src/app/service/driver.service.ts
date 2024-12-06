import { Injectable } from '@angular/core';
import { collection, collectionData, } from "@angular/fire/firestore";
import { map, Observable } from "rxjs";
import { Driver } from "../model/driver";
import { FirestoreService } from "./firestore.service";

@Injectable({
  providedIn: 'root'
})
export class DriverService extends FirestoreService {
  protected collectionPath: string = '/drivers';
  protected collectionRef: any = collection(this.firestore, this.collectionPath);

  constructor() {
    super();
  }

  getAll(): Observable<Driver[]> {
    return collectionData(this.collectionRef).pipe(
        map((drivers: Driver[]) => drivers.filter(driver => !driver.deleted))
    );
  }

  async create(driver: Driver): Promise<void> {
    driver.id = await this.generateNextId();
    return this.createData(driver.id, driver);
  }

  update(driver: Driver): Promise<void> {
    return this.updateData(driver.id, driver);
  }

  getById(id: string): Promise<Driver | undefined> {
    return this.getDataById(id);
  }

}
