import { Component, computed, inject } from '@angular/core';
import { RaceConfigService } from "../../service/race-config.service";
import { RaceService } from "../../service/race.service";
import { DatePipe, NgClass } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PitService } from "../../service/pit.service";
import { getTimeUntilFutureDate } from "../../util/date.util";
import { interval } from "rxjs";

@Component({
  selector: 'app-tyre-change-window',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './tyre-change-window.component.html',
  styleUrl: './tyre-change-window.component.css'
})
export class TyreChangeWindowComponent {
  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly pitService = inject(PitService);
  private readonly startTyreChangeWindowHour = this.raceConfigService.get().startTyreChangeWindowHour;
  private readonly endTyreChangeWindowHour = this.raceConfigService.get().endTyreChangeWindowHour;
  private readonly minTyreChange = this.raceConfigService.get().minTyreChange;
  private readonly activeRace = this.raceService.activeRace;

  isOpen = true;
  isTyreChangeWindowOpen = false;
  remainingTyreChange = this.raceConfigService.get().minTyreChange;

  openingTime = computed(() => {
    const race = this.activeRace()
    if (race) {
      const timestamp = race.start.toDate().getTime() + (this.startTyreChangeWindowHour * 60 * 60 * 1000);
      return new Date(timestamp);
    }
    return undefined
  })

  closingTime = computed(() => {
    const race = this.activeRace()
    if (race) {
      const timestamp = race.start.toDate().getTime() + (this.endTyreChangeWindowHour * 60 * 60 * 1000);
      return new Date(timestamp);
    }
    return undefined;
  })

  countdownOpeningTime: string = '--:--:--';
  countdownClosingTime: string = '--:--:--';

  constructor() {
    interval(1000).pipe(takeUntilDestroyed())
    .subscribe(() => {
      const opening = this.openingTime();
      const closing = this.closingTime();

      this.updateCountdownOpeningTime(opening);
      this.updateCountdownClosingTime(closing);
      this.updateTyreChangeWindowOpen(opening, closing);
    });

    this.pitService.getRacePits()
    .pipe(takeUntilDestroyed())
    .subscribe(pits => {
      const tyreChangesDone = pits.filter(pit => pit.tyreChange).length;
      this.remainingTyreChange = this.minTyreChange - tyreChangesDone;
    });
  }

  private updateCountdownOpeningTime(date: Date | undefined) {
    if (date) {
      this.countdownOpeningTime = getTimeUntilFutureDate(date);
    } else {
      this.countdownOpeningTime = '--:--:--';
    }
  }

  private updateCountdownClosingTime(date: Date | undefined) {
    if (date) {
      this.countdownClosingTime = getTimeUntilFutureDate(date);
    } else {
      this.countdownClosingTime = '--:--:--';
    }
  }

  private updateTyreChangeWindowOpen(openingDate: Date | undefined, closingDate: Date | undefined) {
    if (openingDate && closingDate) {
      const now = new Date();
      this.isTyreChangeWindowOpen = now >= openingDate && now <= closingDate;
    } else {
      this.isTyreChangeWindowOpen = false;
    }
  }
}
