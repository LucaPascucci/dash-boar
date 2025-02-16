import { Component, computed, effect, inject, Signal } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";
import { PitLaneService } from "../../service/pit-lane.service";
import { PitService } from "../../service/pit.service";
import { FormsModule } from "@angular/forms";
import { Driver } from "../../model/driver";
import { DriverService } from "../../service/driver.service";
import { Pit } from "../../model/pit";
import { millisecondsToPitString, millisecondsToTimeString } from "../../util/date.util";
import { RaceManagerService } from "../../service/race-manager.service";
import { TyreService } from "../../service/tyre.service";
import { RaceConfigService } from "../../service/race-config.service";
import { AudioService } from "../../service/audio.service";

@Component({
  selector: 'app-pit-lane',
  imports: [
    NgClass,
    FormsModule,
    NgForOf
  ],
  templateUrl: './pit-lane.component.html',
  styleUrl: './pit-lane.component.css'
})
export class PitLaneComponent {
  private readonly pitLaneService = inject(PitLaneService);
  private readonly pitService = inject(PitService);
  private readonly driverService = inject(DriverService);
  private readonly raceManagerService = inject(RaceManagerService);
  private readonly tyreService = inject(TyreService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly audioService = inject(AudioService);

  readonly pitLaneOpen: Signal<boolean> = this.pitLaneService.open;
  readonly pitLaneOpenInMilliseconds: Signal<number> = this.pitLaneService.openInMilliseconds
  readonly pitLaneOpenInMillisecondsString = computed(() => {
    return millisecondsToTimeString(this.pitLaneService.openInMilliseconds());
  });

  readonly activePit: Signal<Pit | undefined> = this.pitService.activePit
  readonly activePitRemainingMilliseconds: Signal<number> = this.pitService.activePitRemainingMilliseconds
  readonly activePitRemainingMillisecondsString = computed(() => {
    return millisecondsToPitString(this.pitService.activePitRemainingMilliseconds());
  })

  readonly drivers: Signal<Driver[]> = this.driverService.drivers;

  readonly remainingTyreChange: Signal<number> = this.tyreService.remainingTyreChange
  readonly tyreChangeWindowOpen: Signal<boolean> = this.tyreService.tyreChangeWindowOpen;

  isOpen = true;
  refueling = false;
  tyreChange = false;
  selectedDriver: string = '1';

  constructor() {

    effect(() => {
      const activeRaceConfig = this.raceConfigService.activeRaceConfig()
      if (activeRaceConfig) {
        this.selectedDriver = activeRaceConfig.nextPitDriverId;
        this.refueling = activeRaceConfig.nextPitRefueling;
        this.tyreChange = activeRaceConfig.nextPitTyreChange;
      }
    });
  }

  async pitIn() {
    this.audioService.playFile('assets/box_box_box_box.mp3');
    await this.raceManagerService.pitIn(this.selectedDriver, this.refueling, this.tyreChange);
  }

  async pitOut() {
    await this.raceManagerService.pitOut();

    this.raceConfigService.updateNextPitRefueling(false);
    this.raceConfigService.updateNextPitTyreChange(false);
    const nextDriver: Driver | undefined = this.driverService.driverWithMoreTimeFromLastStint();
    if (nextDriver) {
      this.raceConfigService.updateNextPitDriverId(nextDriver.id);
    }
  }

  updateDriverId() {
    this.raceConfigService.updateNextPitDriverId(this.selectedDriver);
  }

  updateTyreChange() {
    this.raceConfigService.updateNextPitTyreChange(this.tyreChange);
  }

  updateRefueling() {
    this.raceConfigService.updateNextPitRefueling(this.refueling);
  }
}
