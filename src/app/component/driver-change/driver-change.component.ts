import { Component, inject, Signal } from '@angular/core';
import { NgClass } from "@angular/common";
import { PitService } from "../../service/pit.service";

@Component({
  selector: 'app-driver-change',
  imports: [
    NgClass
  ],
  templateUrl: './driver-change.component.html',
  styleUrl: './driver-change.component.css'
})
export class DriverChangeComponent {
  private readonly pitService = inject(PitService);

  readonly remainingDriverChanges: Signal<number> = this.pitService.remainingDriverChanges;
  readonly completedDriverChanges: Signal<number> = this.pitService.completedDriverChanges;

  isOpen = false;
}
