import { Component, computed, inject, Signal } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";
import { DriverService } from "../../service/driver.service";
import { Driver } from "../../model/driver";
import { millisecondsToTimeString } from "../../util/date.util";
import { StintService } from "../../service/stint.service";

@Component({
  selector: 'app-driver',
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

  isOpen = false;

  getDriverTimeOnTrack(driverId: string): string {
    return millisecondsToTimeString(this.driverService.driversTimeOnTrackMap().get(driverId));
  }

  getDriverTimeOnTrackWarning(driverId: string): boolean {
    return this.driverService.driversTimeOnTrackWarningMap().get(driverId) || false;
  }

  getDriverStintCount(driverId: string): number {
    return this.driverService.driversStintCountMap().get(driverId) ?? 0;
  }

  getDriverTimeFromLastStint(driverId: string): string {
    return millisecondsToTimeString(this.driverService.driversTimeFromLastStintMap().get(driverId));
  }
}
