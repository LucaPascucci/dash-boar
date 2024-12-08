import { Component, computed, inject } from '@angular/core';
import { DatePipe, NgClass } from "@angular/common";
import { RaceService } from "../../service/race.service";
import { RaceConfigService } from "../../service/race-config.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PitService } from "../../service/pit.service";
import { combineLatest, interval, map } from "rxjs";
import { addMinutes, differenceInMinutes } from "date-fns";
import {
  getTimeUntilFutureDate,
  getElapsedTime
} from "../../util/date.util";
import { Pit } from "../../model/pit";
import { BatteryComponent } from "../battery/battery.component";

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [NgClass, DatePipe, BatteryComponent],
  templateUrl: './fuel.component.html',
  styleUrl: './fuel.component.css'
})
export class FuelComponent {
  private readonly raceService = inject(RaceService);
  private readonly pitService = inject(PitService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly fuelDurationMinute = this.raceConfigService.get().fuelDurationMinute;

  isOpen = true;
  warning = false;
  remainingColor = 'bg-green-500';
  fuelPercentage: number = 100;

  emptyTime: Date | undefined;
  emptyCountdown = '--:--:--';
  lastRefuelTime: Date | undefined;
  sinceLastRefuel = '--:--:--';

  activeRace = this.raceService.activeRace;

  constructor() {
    const pits$ = this.pitService.getRacePits().pipe(takeUntilDestroyed())
    const interval$ = interval(1000).pipe(takeUntilDestroyed());

    combineLatest([toObservable(this.activeRace), pits$, interval$])
    .pipe(
        takeUntilDestroyed(),
        map(([activeRace, pits]) => {
          const recentRefuelPit = this.getRecentRefuelPit(pits);
          return { activeRace, recentRefuelPit };
        })
    )
    .subscribe(({ activeRace, recentRefuelPit }) => {
      let date: Date | undefined = undefined;

      if (recentRefuelPit) {
        date = recentRefuelPit.exitTime.toDate()
      } else if (activeRace) {
        date = activeRace.start.toDate();
      }
      this.updateInfoFromDate(date);
    })
  }

  private updateInfoFromDate(date: Date | undefined) {
    if (date) {
      this.lastRefuelTime = date;
      this.sinceLastRefuel = getElapsedTime(date, new Date());
      this.emptyTime = addMinutes(date, this.fuelDurationMinute)
      this.emptyCountdown = getTimeUntilFutureDate(this.emptyTime);
      this.fuelPercentage = this.calculateFuelPercentage(this.emptyTime, this.fuelDurationMinute);
      this.warning = this.fuelPercentage <= 20;
      this.remainingColor = this.getRemainingColor(this.fuelPercentage );
    } else {
      this.lastRefuelTime = undefined;
      this.sinceLastRefuel = '--:--:--';
      this.emptyTime = undefined;
      this.emptyCountdown = '--:--:--';
      this.fuelPercentage = 100;
      this.warning = false
      this.remainingColor = 'bg-green-500';
    }
  }

  private getRecentRefuelPit(pits: Pit[]): Pit | undefined {
    const sortedRefuelPits = pits
    .filter(pit => pit.refuel)
    .sort((a, b) => b.exitTime.toDate().getTime() - a.exitTime.toDate().getTime())
    if (sortedRefuelPits.length > 0) {
      return sortedRefuelPits[0];
    }
    return undefined;
  }

  private calculateFuelPercentage(emptyTime: Date, fuelDurationMinute: number): number {
    const remainingMinutes = differenceInMinutes(emptyTime, new Date());
    const percentage = (remainingMinutes / fuelDurationMinute) * 100;
    const clampedPercentage = Math.max(0, Math.min(percentage, 100));
    return parseFloat(clampedPercentage.toFixed(2));
  }

  private getRemainingColor(fuelPercentage: number): string {
    if (this.fuelPercentage <= 10) {
      return 'bg-red-500';
    }
    if (this.fuelPercentage <= 25) {
      return 'bg-orange-500';
    }
    if (this.fuelPercentage <= 50) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  }
}
