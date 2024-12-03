import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { collection, collectionData, Firestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { RaceManagerService } from './service/race-manager.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  firestore: Firestore = inject(Firestore);
  items$: Observable<any[]>;
  raceManager: RaceManagerService = inject(RaceManagerService);

  constructor() {
    const aCollection = collection(this.firestore, 'items')
    this.items$ = collectionData(aCollection);
  }
}
