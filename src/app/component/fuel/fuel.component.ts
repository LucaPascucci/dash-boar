import { Component, computed, effect, inject, Signal } from '@angular/core';
import { DatePipe, NgClass } from "@angular/common";
import { RaceConfigService } from "../../service/race-config.service";
import { getElapsedTime, getTimeUntilFutureDate } from "../../util/date.util";
import { BatteryComponent } from "../battery/battery.component";
import { FormsModule } from "@angular/forms";
import { FuelService } from "../../service/fuel.service";

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [NgClass, DatePipe, BatteryComponent, FormsModule],
  templateUrl: './fuel.component.html',
  styleUrl: './fuel.component.css'
})
export class FuelComponent {
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly fuelService = inject(FuelService);

  readonly remainingFuelPercentage = this.fuelService.remainingFuelPercentage;
  readonly remainingFuelLap = this.fuelService.remainingFuelLap;
  readonly emptyFuelTime: Signal<Date | undefined> = this.fuelService.emptyFuelTime;
  readonly lastRefuelTime: Signal<Date | undefined> = this.fuelService.lastRefuelTime;

  emptyFuelCountdown = computed(() => {
    return getTimeUntilFutureDate(this.emptyFuelTime())
  });

  sinceLastRefuel = computed(() => {
    return getElapsedTime(this.lastRefuelTime(), new Date());
  });

  warning = computed(() => {
    return this.remainingFuelPercentage() <= 20;
  });
  remainingColor = computed(() => {
    return this.getRemainingColor(this.remainingFuelPercentage());
  });

  isOpen = true;
  fuelDurationMinute = 0;

  constructor() {
    effect(() => {
      const activeRaceConfig = this.raceConfigService.activeRaceConfig()
      if (activeRaceConfig) {
        this.fuelDurationMinute = activeRaceConfig.fuelDurationMinute;
      }
    });
  }

  onSubmit() {
    this.raceConfigService.updateFuelDurationMinute(this.fuelDurationMinute);
  }

  increaseFuelDuration() {
    this.raceConfigService.updateFuelDurationMinute(this.fuelDurationMinute + 1);
  }

  decreaseFuelDuration() {
    this.raceConfigService.updateFuelDurationMinute(this.fuelDurationMinute - 1);
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
