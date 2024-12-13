import { Injectable, signal, WritableSignal } from '@angular/core';
import { collection, collectionData, } from "@angular/fire/firestore";
import { map, Observable, takeUntil } from "rxjs";
import { Driver } from "../model/driver";
import { FirestoreService } from "./firestore.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class DriverService extends FirestoreService {
  protected collectionPath = '/drivers';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  readonly drivers: WritableSignal<Driver[]> = signal([]);

  constructor() {
    super();
    this.getAll()
    .pipe(takeUntilDestroyed())
    .subscribe(drivers => {
      this.drivers.set(drivers);
    })
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

  private getAll(): Observable<Driver[]> {
    return collectionData(this.collectionRef).pipe(
        takeUntil(this.destroy$),
        map((drivers: Driver[]) => drivers.filter(driver => !driver.deleted))
    );
  }

}
