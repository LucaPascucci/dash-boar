import { Component, inject, Signal } from '@angular/core';
import { RaceService } from "../../service/race.service";
import { RaceConfigService } from "../../service/race-config.service";
import { Race } from "../../model/race";
import { Timestamp } from "@firebase/firestore";
import { getTimeUntilFutureDate, } from "../../util/date.util";
import { addHours } from "date-fns";
import { interval } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [],
  templateUrl: './race.component.html',
  styleUrl: './race.component.css'
})
export class RaceComponent {
  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly durationHour = this.raceConfigService.get().durationHour;

  activeRace: Signal<Race | undefined> = this.raceService.activeRace;
  countdown: string = '--:--:--';

  constructor() {
    interval(1000).pipe(takeUntilDestroyed())
    .subscribe(() => {
      const race = this.activeRace();
      if (race) {
        const targetDate = addHours(race.start.toDate(), this.durationHour);
        this.countdown = getTimeUntilFutureDate(targetDate);
      }
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
