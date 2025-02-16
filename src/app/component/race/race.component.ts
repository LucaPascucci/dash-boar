import { Component, effect, inject, Signal } from '@angular/core';
import { RaceService } from "../../service/race.service";
import { getTimeUntilFutureDate, } from "../../util/date.util";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { RaceManagerService } from "../../service/race-manager.service";
import { FormsModule } from "@angular/forms";
import { NgForOf } from "@angular/common";
import { DriverService } from "../../service/driver.service";
import { Driver } from "../../model/driver";
import { RaceConfigService } from "../../service/race-config.service";
import { isAfter } from "date-fns";

@Component({
  selector: 'app-race',
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './race.component.html',
  styleUrl: './race.component.css'
})
export class RaceComponent {
  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly raceManagerService = inject(RaceManagerService);
  private readonly driverService = inject(DriverService);

  readonly drivers: Signal<Driver[]> = this.driverService.drivers;
  readonly willEndRaceDate: Signal<Date | undefined> = this.raceService.willEndRaceDate;

  endRaceCountdown: string = '00:00:00';
  selectedDriver: string = '1';

  constructor() {
    combineLatest({
      willEndRaceDate: toObservable(this.willEndRaceDate),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(result => {
      const willEndRaceDate = result.willEndRaceDate;
      if (willEndRaceDate) {
        if (isAfter(new Date(), willEndRaceDate)) {
          this.endRaceCountdown = '00:00:00';
        } else {
          this.endRaceCountdown = getTimeUntilFutureDate(willEndRaceDate);
        }
      }
    });

    effect(() => {
      const activeRaceConfig = this.raceConfigService.activeRaceConfig()
      if (activeRaceConfig) {
        this.selectedDriver = activeRaceConfig.startRaceDriverId;
      }
    });
  }

  startRace(): void {
    this.raceManagerService.startRace(this.selectedDriver);
  }

  updateDriverId() {
    this.raceConfigService.updateStartRaceDriverId(this.selectedDriver);
  }
}
