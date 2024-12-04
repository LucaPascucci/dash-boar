import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { DriverService } from "./service/driver.service";
import { Driver } from "./model/driver";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
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
