import { Injectable, signal, WritableSignal } from '@angular/core';
import { RaceConfig } from "../model/race-config";
import { FirestoreService } from "./firestore.service";
import { collection, collectionData } from "@angular/fire/firestore";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { map, Observable, takeUntil } from "rxjs";
import { Race } from "../model/race";

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

  private getAll(): Observable<RaceConfig[]> {
    return collectionData(this.collectionRef).pipe(
        takeUntil(this.destroy$),
        map((raceConfigs: RaceConfig[]) => raceConfigs.filter(raceConfig => !raceConfig.deleted))
    );
  }

  updateFuelDurationMinute(fuelDurationMinute: number): Promise<void> {
    const activeRaceConfig = this.activeRaceConfig();
    if (activeRaceConfig) {
      activeRaceConfig.fuelDurationMinute = fuelDurationMinute;
      return this.updateData(activeRaceConfig.id, activeRaceConfig)
    }
    return Promise.resolve();
  }

  // TODO: rimuovere
  get(): RaceConfig {
    return {
      id: '1',
      durationHour: 24,
      endTyreChangeWindowHour: 14,
      fuelDurationMinute: 120,
      minDriverChange: 30,
      minStintMinute: 5,
      minTyreChange: 1,
      startTyreChangeWindowHour: 10,
      deleted: false
    }
  }


}
