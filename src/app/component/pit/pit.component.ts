import { Component } from '@angular/core';
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-pit',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './pit.component.html',
  styleUrl: './pit.component.css'
})
export class PitComponent {

  isOpen = false;
}
