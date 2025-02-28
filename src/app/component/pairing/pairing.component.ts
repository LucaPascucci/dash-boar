import { Component } from '@angular/core';
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-pairing',
  imports: [
    NgClass
  ],
  templateUrl: './pairing.component.html',
  styleUrl: './pairing.component.css'
})
export class PairingComponent {

  isOpen = true;
}
