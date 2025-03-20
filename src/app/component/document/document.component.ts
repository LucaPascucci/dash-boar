import { Component } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";

@Component({
  selector: 'app-document',
  imports: [
    NgClass,
    NgForOf
  ],
  templateUrl: './document.component.html',
  styleUrl: './document.component.css'
})
export class DocumentComponent {

  isOpen = false;

  documents = [
    { name: 'Briefing', url: 'assets/documents/briefing.pdf' },
    { name: 'Entry list', url: 'assets/documents/entry-list.pdf' },
    { name: 'Programma Venerdì', url: 'assets/documents/programma-venerdi.pdf' },
    { name: 'Programma 24H', url: 'assets/documents/programma-24h.pdf' },
    { name: 'Regolamento 24H', url: 'assets/documents/regolamento-24h.pdf' },
    { name: 'Interfono cuffie', url: 'assets/documents/interfono-cuffie.pdf' },
  ];

  openDocument(url: string) {
    window.open(url, '_blank');
  }
}
