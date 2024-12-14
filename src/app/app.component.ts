import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RaceComponent } from "./component/race/race.component";
import {
  TyreChangeWindowComponent
} from "./component/tyre-change-window/tyre-change-window.component";
import { FuelComponent } from "./component/fuel/fuel.component";
import { RaceLogicComponent } from "./component/race-logic/race-logic.component";
import { DriverComponent } from "./component/driver/driver.component";
import { PitLaneComponent } from "./component/pit/pit-lane.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RaceComponent, TyreChangeWindowComponent, FuelComponent, RaceLogicComponent, DriverComponent, PitLaneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent { }
