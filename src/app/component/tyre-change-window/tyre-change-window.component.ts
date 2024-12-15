import { Component, computed, inject, Signal } from '@angular/core';
import { DatePipe, NgClass } from "@angular/common";
import { getTimeUntilFutureDate } from "../../util/date.util";
import { TyreService } from "../../service/tyre.service";

@Component({
  selector: 'app-tyre-change-window',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './tyre-change-window.component.html',
  styleUrl: './tyre-change-window.component.css'
})
export class TyreChangeWindowComponent {
  private readonly tyreService = inject(TyreService);

  openingTime: Signal<Date | undefined> = this.tyreService.openingTime;
  closingTime: Signal<Date | undefined> = this.tyreService.closingTime;
  remainingTyreChange: Signal<number> = this.tyreService.remainingTyreChange
  tyreChangeWindowOpen: Signal<boolean> = this.tyreService.tyreChangeWindowOpen;

  countdownOpeningTime = computed(() => getTimeUntilFutureDate(this.tyreService.openingTime()))
  countdownClosingTime= computed(() => getTimeUntilFutureDate(this.tyreService.closingTime()))

  isOpen = false;

  constructor() { }
}
