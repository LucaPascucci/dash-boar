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
import { LapComponent } from "./component/lap/lap.component";
import { PitComponent } from "./component/pit/pit.component";
import { DeltaStintComponent } from "./component/delta-stint/delta-stint.component";
import { TimelineComponent } from "./component/timeline/timeline.component";
import { RaceButtonComponent } from "./component/race-button/race-button.component";
import { DocumentComponent } from "./component/document/document.component";
import { PairingComponent } from "./component/pairing/pairing.component";


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RaceComponent,
    TyreChangeWindowComponent,
    FuelComponent,
    StintOptimizerComponent,
    DriverComponent,
    PitLaneComponent,
    DriverChangeComponent,
    ActiveStintComponent,
    StintComponent,
    LapComponent,
    PitComponent,
    DeltaStintComponent,
    TimelineComponent,
    RaceButtonComponent,
    DocumentComponent,
    PairingComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
