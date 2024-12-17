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
import { hoursToMilliseconds, minutesToMilliseconds } from "date-fns";

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
  readonly driversStintCountMap: WritableSignal<Map<string, number>> = signal(new Map<string, number>());
  readonly driverWithLessTimeOnTrack: WritableSignal<Driver | undefined> = signal(undefined);
  readonly driversTimeFromLastStintMap: WritableSignal<Map<string, number>> = signal(new Map<string, number>());

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
      this.driversStintCountMap.set(this.createDriverStintCountMap(stints, drivers));
      this.driverWithLessTimeOnTrack.set(this.getDriverWithLessTimeOnTrack(stints, drivers));
      this.driversTimeFromLastStintMap.set(this.createDriverTimeFromLastStintMap(stints, drivers));

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
    const result = new Map<string, number>();

    drivers.forEach(driver => {
      result.set(driver.id, 0);
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
      result.set(driverId, averageTime);
    }
    return result;
  }

  private createDriverTrackTimeMap(stints: Stint[], drivers: Driver[]): Map<string, number> {
    const result = new Map<string, number>();

    drivers.forEach(driver => {
      result.set(driver.id, 0);
    });

    stints.forEach(stint => {
      let timeSpent;
      if (stint.endDate) {
        timeSpent = stint.endDate.toDate().getTime() - stint.startDate.toDate().getTime();
      } else {
        // STINT CORRENTE
        timeSpent = new Date().getTime() - stint.startDate.toDate().getTime();
      }
      if (result.has(stint.driverId)) {
        result.set(stint.driverId, result.get(stint.driverId)! + timeSpent);
      } else {
        result.set(stint.driverId, timeSpent);
      }
    });

    return result;
  }

  private createDriversTimeOnTrackWarningMap(
      driverTrackTimeMap: Map<string, number>,
      activeRaceConfig: RaceConfig | undefined
  ): Map<string, boolean> {
    const result = new Map<string, boolean>();

    if (activeRaceConfig) {
      const minDriverOnTrackMillis = hoursToMilliseconds(activeRaceConfig.minDriverOnTrackHour);
      const maxDriverOnTrackMillis = hoursToMilliseconds(activeRaceConfig.maxDriverOnTrackHour);
      const warningThresholdMillis = minutesToMilliseconds(activeRaceConfig.warningDriverOnTrackThresholdMinute);

      driverTrackTimeMap.forEach((timeOnTrack, driverId) => {
        const isBelowMin = timeOnTrack < minDriverOnTrackMillis;
        const isNearMax = (maxDriverOnTrackMillis - timeOnTrack) <= warningThresholdMillis;
        result.set(driverId, isBelowMin || isNearMax);
      });
    }

    return result;
  }

  private createDriverStintCountMap(stints: Stint[], drivers: Driver[]): Map<string, number> {
    const result = new Map<string, number>();

    drivers.forEach(driver => {
      result.set(driver.id, 0);
    });

    // Count the number of stints for each driver
    stints.forEach(stint => {
      if (result.has(stint.driverId)) {
        result.set(stint.driverId, result.get(stint.driverId)! + 1);
      } else {
        result.set(stint.driverId, 1);
      }
    });

    return result;
  }

  private getDriverWithLessTimeOnTrack(stints: Stint[], drivers: Driver[]): Driver | undefined {
    if (drivers.length === 0) {
      return undefined;
    }

    const driversTimeOnTrackMap = this.createDriverTrackTimeMap(stints, drivers);

    // Find the driver currently on track
    const currentDriverId = stints.find(stint => stint.endDate === null)?.driverId;

    // Find the driver with the least time on track, excluding the current driver
    const driverMap = new Map(drivers.map(driver => [driver.id, driver]));
    let minTime = Infinity;
    let driverWithLeastTime: Driver | undefined = undefined;

    driversTimeOnTrackMap.forEach((timeOnTrack, driverId) => {
      if (driverId !== currentDriverId && timeOnTrack < minTime) {
        minTime = timeOnTrack;
        driverWithLeastTime = driverMap.get(driverId);
      }
    });

    return driverWithLeastTime;
  }

  private createDriverTimeFromLastStintMap(stints: Stint[], drivers: Driver[]): Map<string, number> {
    const result = new Map<string, number>();

    drivers.forEach(driver => {
      const lastDriverStint = stints.filter(stint => stint.driverId === driver.id)
      .sort((a, b) => b.startDate.toDate().getTime() - a.startDate.toDate().getTime())
      .at(0);

      if (lastDriverStint) {
        if (lastDriverStint.endDate) {
          result.set(driver.id, new Date().getTime() - lastDriverStint.endDate.toDate().getTime());
        } else {
          result.set(driver.id, 0);
        }
      } else {
        result.set(driver.id, 0);
      }
    });

    // prendere lo stint più recente di ogni driver e calcolare la sua distanza (millisecondi) da ora, impostare 0 se lo stint attivo (con endDate uguale a null)
    return result;
  }

}
