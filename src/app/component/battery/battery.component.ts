import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-battery',
  imports: [
    NgClass
  ],
  templateUrl: './battery.component.html',
  styleUrl: './battery.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatteryComponent implements OnChanges {
  @Input() charge: number = 100;

  batteryColor = 'bg-green-500'
  batteryBorderColor = 'border-gray-200'

  ngOnChanges(changes: SimpleChanges): void {
    this.batteryColor = this.getBackgroundColor(this.charge);
    this.batteryBorderColor = this.getBorderColor(this.charge);
  }

  private getBackgroundColor(charge: number) {
    if (charge <= 10) {
      return 'bg-red-500';
    }
    if (charge <= 25) {
      return 'bg-orange-500';
    }
    if (charge <= 50) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  }

  private getBorderColor(charge: number) {
    if (charge <= 10) {
      return 'border-red-500';
    }
    if (charge <= 25) {
      return 'border-orange-500';
    }
    return 'border-gray-200';
  }


}
