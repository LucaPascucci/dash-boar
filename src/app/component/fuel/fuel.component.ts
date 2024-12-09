import { Component, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from "@angular/common";
import { RaceService } from "../../service/race.service";
import { RaceConfigService } from "../../service/race-config.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PitService } from "../../service/pit.service";
import { combineLatest, interval, map } from "rxjs";
import { addMinutes, differenceInMilliseconds, differenceInMinutes, } from "date-fns";
import { getElapsedTime, getTimeUntilFutureDate } from "../../util/date.util";
import { Pit } from "../../model/pit";
import { BatteryComponent } from "../battery/battery.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [NgClass, DatePipe, BatteryComponent, FormsModule],
  templateUrl: './fuel.component.html',
  styleUrl: './fuel.component.css'
})
export class FuelComponent {
  private readonly raceService = inject(RaceService);
  private readonly pitService = inject(PitService);
  private readonly raceConfigService = inject(RaceConfigService);
  private referenceLapTimeMillisecond = signal(44789); // TODO: collegare vero valore
  private activeRace = this.raceService.activeRace;

  fuelDurationMinute = this.raceConfigService.get().fuelDurationMinute;

  isOpen = true;
  warning = false;
  remainingColor = 'bg-green-500';
  fuelPercentage = 100;
  remainingLap = 0;
  emptyTime: Date | undefined;
  emptyCountdown = '--:--:--';
  lastRefuelTime: Date | undefined;
  sinceLastRefuel = '--:--:--';

  constructor() {
    const pits$ = this.pitService.getRacePits().pipe(takeUntilDestroyed())
    const interval$ = interval(1000).pipe(takeUntilDestroyed());

    combineLatest([toObservable(this.activeRace), pits$, interval$])
    .pipe(
        takeUntilDestroyed(),
        map(([activeRace, pits]) => {
          const recentRefuelPit = this.getRecentRefuelPit(pits);
          return {activeRace, recentRefuelPit};
        })
    )
    .subscribe(({activeRace, recentRefuelPit}) => {
      let date: Date | undefined = undefined;

      if (recentRefuelPit) {
        date = recentRefuelPit.exitTime.toDate()
      } else if (activeRace) {
        date = activeRace.start.toDate();
      }
      this.updateInfoFromDate(date);
    })
  }

  onSubmit() {
    console.log('New fuel duration minute:', this.fuelDurationMinute);
  }

  private updateInfoFromDate(date: Date | undefined) {
    this.lastRefuelTime = date;
    this.emptyTime = this.calculateEmptyTime(date);
    this.emptyCountdown = getTimeUntilFutureDate(this.emptyTime);
    this.fuelPercentage = this.calculateFuelPercentage(this.emptyTime, this.fuelDurationMinute);
    this.warning = this.fuelPercentage <= 20;
    this.remainingColor = this.getRemainingColor(this.fuelPercentage);
    this.remainingLap = this.calculateRemainingLaps(this.emptyTime, this.referenceLapTimeMillisecond());
    this.sinceLastRefuel = getElapsedTime(date, new Date());
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

  private calculateEmptyTime(date: Date | undefined): Date | undefined {
    if (date) {
      return addMinutes(date, this.fuelDurationMinute)
    } else {
      return undefined
    }
  }

  private calculateRemainingLaps(emptyTime: Date | undefined, referenceLapTimeMillisecond: number | undefined): number {
    if (emptyTime && referenceLapTimeMillisecond) {
      const millisecondsUntilEmpty = differenceInMilliseconds(emptyTime, new Date());
      return Math.floor(millisecondsUntilEmpty / referenceLapTimeMillisecond);
    } else {
      return 0;
    }
  }

  private calculateFuelPercentage(emptyTime: Date | undefined, fuelDurationMinute: number): number {
    if (emptyTime) {
      const remainingMinutes = differenceInMinutes(emptyTime, new Date());
      const percentage = (remainingMinutes / fuelDurationMinute) * 100;
      const clampedPercentage = Math.max(0, Math.min(percentage, 100));
      return parseFloat(clampedPercentage.toFixed(0));
    } else {
      return 100;
    }
  }

  private getRemainingColor(fuelPercentage: number): string {
    if (fuelPercentage <= 10) {
      return 'bg-red-500';
    }
    if (fuelPercentage <= 25) {
      return 'bg-orange-500';
    }
    if (fuelPercentage <= 50) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  }
}
