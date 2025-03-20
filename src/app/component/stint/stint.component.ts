import { Component, computed, inject, Signal } from '@angular/core';
import { DatePipe, NgClass, NgForOf } from "@angular/common";
import { StintService } from "../../service/stint.service";
import { DriverService } from "../../service/driver.service";
import { getElapsedTime, millisecondsToTimeString } from "../../util/date.util";
import { Stint } from "../../model/stint";
import { addMilliseconds, format } from "date-fns";

@Component({
  selector: 'app-stint',
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

  isOpen = false;

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

  getEndDate(stint: Stint): string {
    if (stint.endDate) {
      return format(stint.endDate.toDate(), 'HH:mm:ss');
    }

    const provisionedEnd = addMilliseconds(stint.startDate.toDate(), stint.optimumMilliseconds);
    return '(' + format(provisionedEnd, 'HH:mm:ss') + ')';
  }
}
