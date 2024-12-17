import { Component, effect, inject } from '@angular/core';
import { NgClass } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RaceConfigService } from "../../service/race-config.service";
import { millisecondsToLapString } from "../../util/date.util";

@Component({
  selector: 'app-lap',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './lap.component.html',
  styleUrl: './lap.component.css'
})
export class LapComponent {
  private readonly raceConfigService = inject(RaceConfigService);

  isOpen = true;

  referenceLapTime = 0
  referenceLapTimeString: string = "--:--:---";

  constructor() {
    effect(() => {
      const activeRaceConfig = this.raceConfigService.activeRaceConfig()
      if (activeRaceConfig) {
        this.referenceLapTime = activeRaceConfig.referenceLapTimeMillisecond;
        this.referenceLapTimeString = millisecondsToLapString(activeRaceConfig.referenceLapTimeMillisecond);
      }
    });
  }

  onSubmit() {
    this.raceConfigService.updateReferenceLapTime(this.referenceLapTime);
  }

  increaseReferenceLapTime() {
    this.raceConfigService.updateReferenceLapTime(this.referenceLapTime + 1);
  }

  decreaseReferenceLapTime() {
    this.raceConfigService.updateReferenceLapTime(this.referenceLapTime - 1);
  }
}
