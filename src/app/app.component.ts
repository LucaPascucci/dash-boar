import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RaceComponent } from "./component/race/race.component";
import {
  TyreChangeWindowComponent
} from "./component/tyre-change-window/tyre-change-window.component";
import { FuelComponent } from "./component/fuel/fuel.component";
import { StintOptimizerComponent } from "./component/stint-optimizer/stint-optimizer.component";
import { DriverComponent } from "./component/driver/driver.component";
import { PitLaneComponent } from "./component/pit-lane/pit-lane.component";
import { DriverChangeComponent } from "./component/driver-change/driver-change.component";
import { ActiveStintComponent } from "./component/active-stint/active-stint.component";
import { StintComponent } from "./component/stint/stint.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RaceComponent, TyreChangeWindowComponent, FuelComponent, StintOptimizerComponent, DriverComponent, PitLaneComponent, DriverChangeComponent, ActiveStintComponent, StintComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent { }
