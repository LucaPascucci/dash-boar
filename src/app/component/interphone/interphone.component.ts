import { Component, computed, inject, Signal } from '@angular/core';
import { RaceConfigService } from "../../service/race-config.service";
import { BatteryComponent } from "../battery/battery.component";
import { DatePipe, NgClass } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { getElapsedTime, getTimeUntilFutureDate } from "../../util/date.util";
import { FuelService } from "../../service/fuel.service";
import { InterphoneService } from "../../service/interphone.service";

@Component({
  selector: 'app-interphone',
  imports: [
    BatteryComponent,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './interphone.component.html',
  styleUrl: './interphone.component.css'
})
export class InterphoneComponent {
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly interphoneService = inject(InterphoneService);

  readonly remainingBatteryPercentage = this.interphoneService.remainingBatteryPercentage;
  readonly emptyBatteryDate: Signal<Date | undefined> = this.interphoneService.emptyBatteryDate;
  readonly lastChangeTime: Signal<Date | undefined> = this.interphoneService.lastChangeDate;

  emptyBatteryCountdown = computed(() => {
    return getTimeUntilFutureDate(this.emptyBatteryDate())
  });

  sinceLastChange = computed(() => {
    return getElapsedTime(this.lastChangeTime(), new Date());
  });

  warning = computed(() => {
    return this.remainingBatteryPercentage() <= 20;
  });

  remainingColor = computed(() => {
    return this.getRemainingColor(this.remainingBatteryPercentage());
  });

  isOpen = false;
  batteryDurationMinute = 0;

  onSubmit() {
    this.raceConfigService.updateInterphoneBatteryDurationMinute(this.batteryDurationMinute);
  }

  increaseBatteryDuration() {
    this.raceConfigService.updateInterphoneBatteryDurationMinute(this.batteryDurationMinute + 1);
  }

  decreaseBatteryDuration() {
    this.raceConfigService.updateInterphoneBatteryDurationMinute(this.batteryDurationMinute - 1);
  }

  private getRemainingColor(batteryPercentage: number): string {
    if (batteryPercentage <= 10) {
      return 'bg-red-500';
    }
    if (batteryPercentage <= 25) {
      return 'bg-orange-500';
    }
    if (batteryPercentage <= 50) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  }
}
