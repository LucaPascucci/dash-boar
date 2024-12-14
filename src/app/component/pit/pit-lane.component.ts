import { Component, computed, inject, Signal } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";
import { PitLaneService } from "../../service/pit-lane.service";
import { PitService } from "../../service/pit.service";
import { FormsModule } from "@angular/forms";
import { Driver } from "../../model/driver";
import { DriverService } from "../../service/driver.service";
import { Pit } from "../../model/pit";
import { millisecondsToPitString, millisecondsToTimeString } from "../../util/date.util";
import { RaceManagerService } from "../../service/race-manager.service";

@Component({
  selector: 'app-pit-lane',
  standalone: true,
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

  readonly pitLaneOpen: Signal<boolean> = this.pitLaneService.open;

  readonly activePit: Signal<Pit | undefined> = this.pitService.activePit
  readonly remainingDriverChanges: Signal<number> = this.pitService.remainingDriverChanges;
  readonly completedDriverChanges: Signal<number> = this.pitService.completedDriverChanges;
  readonly drivers: Signal<Driver[]> = this.driverService.drivers;

  readonly activePitRemainingMilliseconds = computed(() => {
    return millisecondsToPitString(this.pitService.activePitRemainingMilliseconds());
  })

  readonly pitLaneOpenInMilliseconds = computed(() => {
    return millisecondsToTimeString(this.pitLaneService.openInMilliseconds());
  });

  isOpen = true;
  refueling = false;
  tyreChange = false;
  selectedDriver: string = '1';

  pitIn() {
    this.raceManagerService.pitIn(this.selectedDriver, this.refueling, this.tyreChange);
  }

  pitOut() {
    this.raceManagerService.pitOut();
    this.tyreChange = false;
    this.refueling = false;
  }
}
