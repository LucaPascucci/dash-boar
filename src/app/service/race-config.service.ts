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

  readonly raceConfig: WritableSignal<RaceConfig | undefined> = signal(undefined);

  constructor() {
    super()
    this.getAll()
    .pipe(takeUntilDestroyed())
    .subscribe(raceConfigs => {
      if (raceConfigs.length > 0) {
        this.raceConfig.set(raceConfigs.at(0));
      }
    });
  }

  updateFuelDurationMinute(value: number): Promise<void> {
    const activeRaceConfig = this.raceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.fuelDurationMinute = value;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  updateInterphoneBatteryDurationMinute(value: number): Promise<void> {
    const activeRaceConfig = this.raceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.interphoneBatteryDurationMinute = value;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  updateStartRaceDriverId(driverId: string): Promise<void> {
    const activeRaceConfig = this.raceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.startRaceDriverId = driverId;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  updateNextPitDriverId(driverId: string): Promise<void> {
    const raceConfig = this.raceConfig();
    if (raceConfig) {
      raceConfig.pitConfig.nextPitDriverId = driverId;
      return this.updateData(raceConfig.id, raceConfig)
    }
    return Promise.resolve();
  }

  updateNextPitRefueling(refueling: boolean): Promise<void> {
    const raceConfig = this.raceConfig();
    if (raceConfig) {
      raceConfig.pitConfig.nextPitRefueling = refueling;
      return this.updateData(raceConfig.id, raceConfig)
    }
    return Promise.resolve();
  }

  updateNextPitTyreChange(tyreChange: boolean): Promise<void> {
    const raceConfig = this.raceConfig();
    if (raceConfig) {
      raceConfig.pitConfig.nextPitTyreChange = tyreChange;
      return this.updateData(raceConfig.id, raceConfig)
    }
    return Promise.resolve();
  }

  updateNextPitInterphoneChange(interphoneChange: boolean): Promise<void> {
    const raceConfig = this.raceConfig();
    if (raceConfig) {
      raceConfig.pitConfig.nextPitInterphoneChange = interphoneChange;
      return this.updateData(raceConfig.id, raceConfig)
    }
    return Promise.resolve();
  }

  updateReferenceLapTime(lapTime: number): Promise<void> {
    const raceConfig = this.raceConfig();
    if (raceConfig) {
      raceConfig.referenceLapTimeMillisecond = lapTime;
      return this.updateData(raceConfig.id, raceConfig)
    }
    return Promise.resolve();
  }

  private getAll(): Observable<RaceConfig[]> {
    return collectionData(this.collectionRef).pipe(
        takeUntil(this.destroyed),
        map((data: DocumentData[]) => data.map(doc => doc as RaceConfig).filter(raceConfig => !raceConfig.deleted))
    );
  }
}
