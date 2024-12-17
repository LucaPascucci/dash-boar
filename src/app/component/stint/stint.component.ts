import { Component, computed, inject, Signal } from '@angular/core';
import { DatePipe, NgClass, NgForOf } from "@angular/common";
import { StintService } from "../../service/stint.service";
import { DriverService } from "../../service/driver.service";
import { getElapsedTime, millisecondsToTimeString } from "../../util/date.util";
import { Stint } from "../../model/stint";

@Component({
  selector: 'app-stint',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    DatePipe
  ],
  templateUrl: './stint.component.html',
  styleUrl: './stint.component.css'
})
export class StintComponent {
  private readonly stintService = inject(StintService);
  private readonly driverService = inject(DriverService);

  readonly stints: Signal<Stint[]> = this.stintService.stints;
  readonly activeStintId = computed(() => {
    const activeStint = this.stintService.activeStint();
    if (activeStint) {
      return activeStint.id;
    }
    return undefined;
  })

  isOpen = true;

  getDriverRacingName(driverId: string): string {
    const drivers = this.driverService.drivers();
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.raceName : '';
  }

  calculateTimeOnTrack(start: Date, end: Date | undefined): string {
    if (end) {
      return getElapsedTime(start, end);
    }
    return getElapsedTime(start, new Date());
  }

  getOptimumString(milliseconds: number): string {
    return millisecondsToTimeString(milliseconds);
  }

  calculateTotalTimeOnTrack(): string {
    const stints = this.stintService.stints();
    let timeSpent = 0;
    stints.forEach(stint => {
      if (stint.endDate) {
        timeSpent += stint.endDate.toDate().getTime() - stint.startDate.toDate().getTime();
      } else {
        // STINT CORRENTE
        timeSpent += new Date().getTime() - stint.startDate.toDate().getTime();
      }
    })
    return millisecondsToTimeString(timeSpent);
  }
}
