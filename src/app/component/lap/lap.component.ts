import { Component } from '@angular/core';
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-lap',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './lap.component.html',
  styleUrl: './lap.component.css'
})
export class LapComponent {

  isOpen = false;
}
