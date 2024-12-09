import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RaceComponent } from "./component/race/race.component";
import {
  TyreChangeWindowComponent
} from "./component/tyre-change-window/tyre-change-window.component";
import { FuelComponent } from "./component/fuel/fuel.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RaceComponent, TyreChangeWindowComponent, FuelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
