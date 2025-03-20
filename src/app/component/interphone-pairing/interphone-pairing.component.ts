import { Component } from '@angular/core';
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-interphone-pairing',
  imports: [
    NgClass
  ],
  templateUrl: './interphone-pairing.component.html',
  styleUrl: './interphone-pairing.component.css'
})
export class InterphonePairingComponent {

  isOpen = false;
}
