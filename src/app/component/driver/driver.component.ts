import { Component, computed, inject, Signal } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";
import { DriverService } from "../../service/driver.service";
import { Driver } from "../../model/driver";
import { millisecondsToLapString, millisecondsToTimeString } from "../../util/date.util";
import { StintService } from "../../service/stint.service";

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [
    NgClass,
    NgForOf
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.css'
})
export class DriverComponent {
  private readonly driverService = inject(DriverService);
  private readonly stintService = inject(StintService);

  readonly drivers: Signal<Driver[]> = this.driverService.drivers;
  readonly driversTimeOnTrackWarningCount: Signal<number> = this.driverService.driversTimeOnTrackWarningCount;
  readonly activeStintDriverId = computed(() => {
    const activeStint = this.stintService.activeStint();
    if (activeStint) {
      return activeStint.driverId;
    }
    return undefined;
  });

  readonly totalStints = computed(() => {
    const stintCountMap = this.driverService.driversStintCountMap();
    let totalStints = 0;
    stintCountMap.forEach(count => {
      totalStints += count;
    });
    return totalStints;
  })

  readonly totalTimeOnTrack = computed(() => {
    const timeOnTrackMap = this.driverService.driversTimeOnTrackMap();
    let totalTime = 0;
    timeOnTrackMap.forEach(time => {
      totalTime += time;
    });
    return millisecondsToTimeString(totalTime);
  })


  isOpen = true;

  getDriverReferenceLapTime(driverId: string): string {
    return millisecondsToLapString(this.driverService.driversReferenceLapTimeMap().get(driverId));
  }

  getDriverTimeOnTrack(driverId: string): string {
    return millisecondsToTimeString(this.driverService.driversTimeOnTrackMap().get(driverId));
  }

  getDriverTimeOnTrackWarning(driverId: string): boolean {
    return this.driverService.driversTimeOnTrackWarningMap().get(driverId) || false;
  }

  getDriverStintCount(driverId: string): number {
    return this.driverService.driversStintCountMap().get(driverId) || 0;
  }
}
