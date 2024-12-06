import { Component, inject, OnDestroy, OnInit, Signal, WritableSignal } from '@angular/core';
import { RaceService } from "../../service/race.service";
import { RaceConfigService } from "../../service/race-config.service";
import { Race } from "../../model/race";
import { Timestamp } from "@firebase/firestore";

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [],
  templateUrl: './race.component.html',
  styleUrl: './race.component.css'
})
export class RaceComponent implements OnInit, OnDestroy {
  private readonly raceService = inject(RaceService);
  private readonly raceConfigService = inject(RaceConfigService);
  private readonly durationHour: number;

  private intervalId: any;

  activeRace: Signal<Race | undefined>;
  timeLeft: string = '';

  constructor() {
    this.durationHour = this.raceConfigService.get().durationHour;
    this.activeRace = this.raceService.activeRace;
  }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      const race = this.activeRace();
      if (race) {
        this.timeLeft = this.calculateLeftTime(race.start.toDate());
      } else {
        this.timeLeft = '';
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

  private calculateLeftTime(start: Date): string {
    const now = new Date().getTime();
    const targetTime = start.getTime() + this.durationHour * 60 * 60 * 1000;
    const distance = targetTime - now;

    if (distance < 0) {
      return "00:00:00";
    } else {
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      // const milliseconds = Math.floor((distance % 1000));

      // return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}:${this.pad(milliseconds, 3)}`;
      return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }
  }

  private pad(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) {
      s = "0" + s;
    }
    return s;
  }
}
