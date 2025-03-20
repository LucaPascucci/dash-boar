import { Component, inject, Signal } from '@angular/core';
import { RaceService } from "../../service/race.service";
import { RaceManagerService } from "../../service/race-manager.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { RaceConfig } from "../../model/race-config";
import { RaceConfigService } from "../../service/race-config.service";
import { Race } from "../../model/race";
import { addHours, differenceInSeconds } from "date-fns";

@Component({
  selector: 'app-race-button',
  imports: [],
  templateUrl: './race-button.component.html',
  styleUrl: './race-button.component.css'
})
export class RaceButtonComponent {
  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly raceManagerService = inject(RaceManagerService);

  readonly activeRace: Signal<Race | undefined> = this.raceService.activeRace;
  readonly activeRaceConfig: Signal<RaceConfig | undefined> = this.raceConfigService.raceConfig;
  readonly willEndRaceDate: Signal<Date | undefined> = this.raceService.willEndRaceDate;

  hideEndRaceButton = true;

  constructor() {
    combineLatest({
      activeRace: toObservable(this.activeRace),
      activeRaceConfig: toObservable(this.activeRaceConfig),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({activeRace, activeRaceConfig}) => {
      if (activeRace && activeRaceConfig) {
        this.hideEndRaceButton = this.calculateHide(activeRace, activeRaceConfig);
      } else {
        this.hideEndRaceButton = true;
      }
    });
  }

  endRace(): void {
    this.raceManagerService.endRace();
  }

  private calculateHide(race: Race, raceConfig: RaceConfig): boolean {
    if (race.end !== null) {
      return true;
    }

    const willEnd = addHours(race.start.toDate(), raceConfig.durationHour);
    const difference = differenceInSeconds(willEnd, new Date());

    return difference > raceConfig.endRaceThresholdSeconds || race.end !== null;
  }

  startRace(): void {
    const startDriverId = this.raceConfigService.raceConfig()?.startRaceDriverId;
    if (startDriverId) {
      this.raceManagerService.startRace(startDriverId);
    }

  }
}
