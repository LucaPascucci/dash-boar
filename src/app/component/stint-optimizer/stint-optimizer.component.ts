import { Component, computed, inject, Signal } from '@angular/core';
import { NgClass } from "@angular/common";
import { RaceLogicService } from "../../service/race-logic.service";
import { RaceLogic } from "../../model/race-logic";
import { millisecondsToTimeString } from "../../util/date.util";

@Component({
  selector: 'app-stint-optimizer',
  standalone: true,
  imports: [ NgClass ],
  templateUrl: './stint-optimizer.component.html',
  styleUrl: './stint-optimizer.component.css'
})
export class StintOptimizerComponent {
  private readonly raceLogicService = inject(RaceLogicService);

  AVGStintTime = computed(() => {
    const activeRaceLogic = this.raceLogicService.activeRaceLogic();
    if (activeRaceLogic) {
      return millisecondsToTimeString(activeRaceLogic.avgStintMillisecondsTime);
    }
    return '--:--:--'
  });

  laps = computed(() => {
    const activeRaceLogic = this.raceLogicService.activeRaceLogic();
    if (activeRaceLogic) {
      return activeRaceLogic.laps;
    }
    return 0;
  });

  AVGStintTimeIfDriverChangeNow = computed(() => {
    const activeRaceLogic = this.raceLogicService.activeRaceLogic();
    if (activeRaceLogic) {
      return millisecondsToTimeString(activeRaceLogic.avgStintMillisecondsIfDriverChangedNow);
    }
    return '--:--:--'
  });

  lapsIfDriverChangeNow = computed(() => {
    const activeRaceLogic = this.raceLogicService.activeRaceLogic();
    if (activeRaceLogic) {
      return activeRaceLogic.lapsIfDriverChangeNow;
    }
    return 0;
  });

  isOpen = true;
}