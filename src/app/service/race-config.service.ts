import { Injectable, signal, WritableSignal } from '@angular/core';
import { RaceConfig } from "../model/race-config";
import { FirestoreService } from "./firestore.service";
import { collection, collectionData } from "@angular/fire/firestore";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { map, Observable, takeUntil } from "rxjs";
import { DocumentData } from "@angular/fire/compat/firestore";

@Injectable({
  providedIn: 'root'
})
export class RaceConfigService extends FirestoreService {
  protected collectionPath: string = '/race-configs';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  readonly activeRaceConfig: WritableSignal<RaceConfig | undefined> = signal(undefined);

  constructor() {
    super()
    this.getAll()
    .pipe(takeUntilDestroyed())
    .subscribe(raceConfigs => {
      if (raceConfigs.length > 0) {
        this.activeRaceConfig.set(raceConfigs.at(0));
      }
    });
  }

  updateFuelDurationMinute(fuelDurationMinute: number): Promise<void> {
    const activeRaceConfig = this.activeRaceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.fuelDurationMinute = fuelDurationMinute;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  updateStartRaceDriverId(driverId: string): Promise<void> {
    const activeRaceConfig = this.activeRaceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.startRaceDriverId = driverId;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  updateNextPitDriverId(driverId: string): Promise<void> {
    const activeRaceConfig = this.activeRaceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.nextPitDriverId = driverId;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  updateNextPitRefueling(refueling: boolean): Promise<void> {
    const activeRaceConfig = this.activeRaceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.nextPitRefueling = refueling;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  updateNextPitTyreChange(tyreChange: boolean): Promise<void> {
    const activeRaceConfig = this.activeRaceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.nextPitTyreChange = tyreChange;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  updateReferenceLapTime(lapTime: number): Promise<void> {
    const activeRaceConfig = this.activeRaceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.referenceLapTimeMillisecond = lapTime;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  private getAll(): Observable<RaceConfig[]> {
    return collectionData(this.collectionRef).pipe(
        takeUntil(this.destroyed),
        map((data: DocumentData[]) => data.map(doc => doc as RaceConfig).filter(raceConfig => !raceConfig.deleted))

        // map((raceConfigs: RaceConfig[]) => raceConfigs.filter(raceConfig => !raceConfig.deleted))
    );
  }
}
