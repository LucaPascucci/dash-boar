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
  readonly endRaceDate: Signal<Date | undefined> = this.raceService.endRaceDate;

  endRaceCountdown: string = '--:--:--';
  selectedDriver: string = '1';

  constructor() {
    combineLatest({
      endRaceDate: toObservable(this.endRaceDate),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(result => {
      this.endRaceCountdown = getTimeUntilFutureDate(result.endRaceDate);
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
