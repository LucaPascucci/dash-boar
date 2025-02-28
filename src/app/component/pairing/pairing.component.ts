import { Component } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";

@Component({
  selector: 'app-pairing',
  imports: [
    NgForOf,
    NgClass
  ],
  templateUrl: './pairing.component.html',
  styleUrl: './pairing.component.css'
})
export class PairingComponent {

  isOpen = true;
}
