import { Component, computed, inject, OnDestroy } from '@angular/core';
import { RaceConfigService } from "../../service/race-config.service";
import { RaceService } from "../../service/race.service";
import { DatePipe, NgClass } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PitService } from "../../service/pit.service";
import { calculateCountdownStringToDate } from "../../util/date.util";

@Component({
  selector: 'app-tyre-change-window',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './tyre-change-window.component.html',
  styleUrl: './tyre-change-window.component.css'
})
export class TyreChangeWindowComponent implements OnDestroy {
  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly pitService = inject(PitService);
  private readonly startTyreChangeWindowHour = this.raceConfigService.get().startTyreChangeWindowHour;
  private readonly endTyreChangeWindowHour = this.raceConfigService.get().endTyreChangeWindowHour;
  private readonly minTyreChange = this.raceConfigService.get().minTyreChange;

  private intervalId: any;

  isOpen = true;
  isTyreChangeWindowOpen = false;
  remainingTyreChange = this.raceConfigService.get().minTyreChange;
  activeRace = this.raceService.activeRace;

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

    this.intervalId = setInterval(() => {
      const opening = this.openingTime();
      const closing = this.closingTime();

      this.updateCountdownOpeningTime(opening);
      this.updateCountdownClosingTime(closing);
      this.updateTyreChangeWindowOpen(opening, closing);
    }, 1000);

    this.pitService.getRacePits()
    .pipe(takeUntilDestroyed())
    .subscribe(pits => {
      const tyreChangesDone = pits.filter(pit => pit.tyreChange).length;
      this.remainingTyreChange = this.minTyreChange - tyreChangesDone;
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateCountdownOpeningTime(date: Date | undefined) {
    if (date) {
      this.countdownOpeningTime = calculateCountdownStringToDate(date);
    } else {
      this.countdownOpeningTime = '--:--:--';
    }
  }

  private updateCountdownClosingTime(date: Date | undefined) {
    if (date) {
      this.countdownClosingTime = calculateCountdownStringToDate(date);
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
