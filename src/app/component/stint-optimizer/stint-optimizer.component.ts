import { Component, computed, inject } from '@angular/core';
import { NgClass } from "@angular/common";
import { StintOptimizerService } from "../../service/stint-optimizer.service";
import { millisecondsToTimeString } from "../../util/date.util";

@Component({
  selector: 'app-stint-optimizer',
  standalone: true,
  imports: [ NgClass ],
  templateUrl: './stint-optimizer.component.html',
  styleUrl: './stint-optimizer.component.css'
})
export class StintOptimizerComponent {
  private readonly stintOptimizerService = inject(StintOptimizerService);

  AVGStintTime = computed(() => {
    const optimizedStint = this.stintOptimizerService.optimizedStint();
    if (optimizedStint) {
      return millisecondsToTimeString(optimizedStint.avgStintMillisecondsTime);
    }
    return '--:--:--'
  });

  laps = computed(() => {
    const optimizedStint = this.stintOptimizerService.optimizedStint();
    if (optimizedStint) {
      return optimizedStint.laps;
    }
    return 0;
  });

  AVGStintTimeIfDriverChangeNow = computed(() => {
    const optimizedStint = this.stintOptimizerService.optimizedStint();
    if (optimizedStint) {
      return millisecondsToTimeString(optimizedStint.avgStintMillisecondsIfDriverChangedNow);
    }
    return '--:--:--'
  });

  lapsIfDriverChangeNow = computed(() => {
    const optimizedStint = this.stintOptimizerService.optimizedStint();
    if (optimizedStint) {
      return optimizedStint.lapsIfDriverChangeNow;
    }
    return 0;
  });

  isOpen = true;
}
