import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from "rxjs";
import { DriverService } from "./service/driver.service";
import { Driver } from "./model/driver";
import { RaceComponent } from "./component/race/race.component";
import {
  TyreChangeWindowComponent
} from "./component/tyre-change-window/tyre-change-window.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RaceComponent, TyreChangeWindowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly driverService: DriverService = inject(DriverService);

  drivers$: Observable<Driver[]>;

  constructor() {
    this.drivers$ = this.driverService.getAll();
  }
}
