import { Component, inject, Signal } from '@angular/core';
import { RaceService } from "../../service/race.service";
import { Timestamp } from "@firebase/firestore";
import { getTimeUntilFutureDate, } from "../../util/date.util";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [],
  templateUrl: './race.component.html',
  styleUrl: './race.component.css'
})
export class RaceComponent {
  private readonly raceService = inject(RaceService);

  endRaceDate: Signal<Date | undefined> = this.raceService.endRaceDate;

  endRaceCountdown: string = '--:--:--';

  constructor() {

    combineLatest({
      endRaceDate: toObservable(this.endRaceDate),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(result => {
      this.endRaceCountdown = getTimeUntilFutureDate(result.endRaceDate);
    });
  }

  startRace(): void {
    this.raceService.create({
      id: '1',
      start: Timestamp.now(),
      deleted: false
    })
  }
}
