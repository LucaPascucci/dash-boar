import {
  Component,
  computed,
  inject,
  OnDestroy,
  Signal,
} from '@angular/core';
import { RaceConfigService } from "../../service/race-config.service";
import { Race } from "../../model/race";
import { RaceService } from "../../service/race.service";
import { DatePipe, NgClass } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PitService } from "../../service/pit.service";

@Component({
  selector: 'app-tyre-window',
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
  protected readonly destroy$ = new Subject<void>();

  private intervalId: any;

  isOpen: boolean = false;
  remainingTyreChange: number;
  activeRace: Signal<Race | undefined>;

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

  constructor() {
    this.activeRace = this.raceService.activeRace;

    this.intervalId = setInterval(() => {
      const now = new Date();
      const opening = this.openingTime();
      const closing = this.closingTime();

      if (opening && closing) {
        this.isOpen = now >= opening && now <= closing;
      } else {
        this.isOpen = false;
      }
    }, 1000);

    this.remainingTyreChange = this.raceConfigService.get().minTyreChange;
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
    // Emit a value to complete all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
}
