import { Component, computed, inject, Signal } from '@angular/core';
import { DatePipe, NgClass, NgForOf } from "@angular/common";
import { PitService } from "../../service/pit.service";
import { Pit } from "../../model/pit";
import {
  getElapsedTime,
  millisecondsToLapString,
  millisecondsToTimeString
} from "../../util/date.util";

@Component({
  selector: 'app-pit',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    NgForOf
  ],
  templateUrl: './pit.component.html',
  styleUrl: './pit.component.css'
})
export class PitComponent {
  private readonly pitService = inject(PitService);

  readonly pits: Signal<Pit[]> = this.pitService.pits;

  readonly activePitId = computed(() => {
    const activePit = this.pitService.activePit();
    if (activePit) {
      return activePit.id;
    }
    return undefined;
  })

  readonly completedDriverChanges: Signal<number> = this.pitService.completedDriverChanges;

  isOpen = true;

  calculatePitTime(start: Date, end: Date | undefined): string {
    if (end) {
      return getElapsedTime(start, end);
    }
    return getElapsedTime(start, new Date());
  }

  calculateTotalPitTime(): string {
    const pits = this.pitService.pits();
    let timeSpent = 0;
    pits.forEach(pit => {
      if (pit.exitTime) {
        timeSpent += pit.exitTime.toDate().getTime() - pit.entryTime.toDate().getTime();
      } else {
        // PIT CORRENTE
        timeSpent += new Date().getTime() - pit.entryTime.toDate().getTime();
      }
    })
    return millisecondsToTimeString(timeSpent);
  }

  calculateTotalRefueling(): number {
    return this.pitService.pits().filter(pit => pit.refuel).length;
  }

  calculateTotalTyreChanges(): number {
    return this.pitService.pits().filter(pit => pit.tyreChange).length;
  }
}
