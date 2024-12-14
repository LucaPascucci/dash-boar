import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { collection, collectionData, } from "@angular/fire/firestore";
import { combineLatest, interval, map, Observable, takeUntil } from "rxjs";
import { Driver } from "../model/driver";
import { FirestoreService } from "./firestore.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { LapService } from "./lap.service";
import { Lap } from "../model/lap";
import { StintService } from "./stint.service";
import { Stint } from "../model/stint";
import { RaceConfigService } from "./race-config.service";
import { RaceConfig } from "../model/race-config";

@Injectable({
  providedIn: 'root'
})
export class DriverService extends FirestoreService {
  protected collectionPath = '/drivers';
  protected collectionRef = collection(this.firestore, this.collectionPath);

  private readonly lapService = inject(LapService);
  private readonly stintService = inject(StintService);
  private readonly raceConfigService = inject(RaceConfigService);

  readonly drivers: WritableSignal<Driver[]> = signal([]);
  readonly driversReferenceLapTimeMap: WritableSignal<Map<string, number>> = signal(new Map<string, number>());
  readonly driversTimeOnTrackMap: WritableSignal<Map<string, number>> = signal(new Map<string, number>());
  readonly driversTimeOnTrackWarningMap: WritableSignal<Map<string, boolean>> = signal(new Map<string, boolean>());

  readonly driversTimeOnTrackWarningCount = computed(() => {
    const warningMap = this.driversTimeOnTrackWarningMap();
    let warningCount = 0;
    warningMap.forEach((isWarning) => {
      if (isWarning) {
        warningCount++;
      }
    });
    return warningCount;
  });

  constructor() {
    super();
    combineLatest({
      drivers: this.getAll(),
      laps: toObservable(this.lapService.laps),
      stints: toObservable(this.stintService.stints),
      activeRaceConfig: toObservable(this.raceConfigService.activeRaceConfig),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({drivers, laps, stints, activeRaceConfig}) => {
      this.drivers.set(drivers);
      this.driversReferenceLapTimeMap.set(this.createDriverReferenceLapTimeMap(laps, drivers));
      this.driversTimeOnTrackMap.set(this.createDriverTrackTimeMap(stints, drivers));
      this.driversTimeOnTrackWarningMap.set(this.createDriversTimeOnTrackWarningMap(this.driversTimeOnTrackMap(), activeRaceConfig))
    })
  }

  private getAll(): Observable<Driver[]> {
    return collectionData(this.collectionRef)
    .pipe(
        takeUntil(this.destroyed),
        map((drivers: Driver[]) => drivers.filter(driver => !driver.deleted))
    );
  }

  private createDriverReferenceLapTimeMap(laps: Lap[], drivers: Driver[]): Map<string, number> {
    // Create a map with driver ID as key and average lap time as value
    const driverLapTimesMap = new Map<string, number>();
    drivers.forEach(driver => {
      driverLapTimesMap.set(driver.id, 0);
    });

    // Group laps by driver ID and calculate average lap time
    const lapsGroupedByDriver = laps.reduce((acc, lap) => {
      if (!acc[lap.driverId]) {
        acc[lap.driverId] = [];
      }
      acc[lap.driverId].push(lap.millisecondsTime);
      return acc;
    }, {} as Record<string, number[]>);

    for (const driverId in lapsGroupedByDriver) {
      const times = lapsGroupedByDriver[driverId];
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      driverLapTimesMap.set(driverId, averageTime);
    }
    return driverLapTimesMap;
  }

  private createDriverTrackTimeMap(stints: Stint[], drivers: Driver[]): Map<string, number> {
    const driverTrackTimeMap = new Map<string, number>();

    drivers.forEach(driver => {
      driverTrackTimeMap.set(driver.id, 0);
    });

    stints.forEach(stint => {
      let timeSpent;
      if (stint.endDate) {
        timeSpent = stint.endDate.toDate().getTime() - stint.startDate.toDate().getTime();
      } else {
        // STINT CORRENTE
        timeSpent = new Date().getTime() - stint.startDate.toDate().getTime();
      }
      if (driverTrackTimeMap.has(stint.driverId)) {
        driverTrackTimeMap.set(stint.driverId, driverTrackTimeMap.get(stint.driverId)! + timeSpent);
      } else {
        driverTrackTimeMap.set(stint.driverId, timeSpent);
      }
    });

    return driverTrackTimeMap;
  }

  private createDriversTimeOnTrackWarningMap(
      driverTrackTimeMap: Map<string, number>,
      activeRaceConfig: RaceConfig | undefined
  ): Map<string, boolean> {
    const result = new Map<string, boolean>();

    if (activeRaceConfig) {
      const minDriverOnTrackMillis = activeRaceConfig.minDriverOnTrackHour * 60 * 60 * 1000;
      const maxDriverOnTrackMillis = activeRaceConfig.maxDriverOnTrackHour * 60 * 60 * 1000;
      const warningThresholdMillis = 20 * 60 * 1000; // 20 minutes in milliseconds

      driverTrackTimeMap.forEach((timeOnTrack, driverId) => {
        const isBelowMin = timeOnTrack < minDriverOnTrackMillis;
        const isNearMax = (maxDriverOnTrackMillis - timeOnTrack) <= warningThresholdMillis;
        result.set(driverId, isBelowMin || isNearMax);
      });
    }

    return result;
  }

}
