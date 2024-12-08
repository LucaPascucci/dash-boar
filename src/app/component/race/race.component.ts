import { Component, inject, OnDestroy, OnInit, Signal, WritableSignal } from '@angular/core';
import { RaceService } from "../../service/race.service";
import { RaceConfigService } from "../../service/race-config.service";
import { Race } from "../../model/race";
import { Timestamp } from "@firebase/firestore";
import { DatePipe } from "@angular/common";
import { calculateCountdownStringToDate, } from "../../util/date.util";
import { addHours } from "date-fns";

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './race.component.html',
  styleUrl: './race.component.css'
})
export class RaceComponent implements OnInit, OnDestroy {
  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly durationHour = this.raceConfigService.get().durationHour;

  private intervalId: any;

  activeRace: Signal<Race | undefined> = this.raceService.activeRace;
  countdown: string = '--:--:--';

  constructor() {
  }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      const race = this.activeRace();
      if (race) {
        const targetDate = addHours(race.start.toDate(), this.durationHour);
        this.countdown = calculateCountdownStringToDate(targetDate);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startRace(): void {
    this.raceService.create({
      id: '1',
      start: Timestamp.now(),
      deleted: false
    })
  }
}
