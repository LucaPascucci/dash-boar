import { Component, inject, Signal } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";
import { TimelineService } from "../../service/timeline.service";
import { TimelineStep } from "../../model/timeline-step";
import { addMilliseconds, format } from "date-fns";
import { TooltipDirective } from "../ui/tooltip/tooltip.directive";
import { getElapsedTime, millisecondsToTimeString } from "../../util/date.util";
import { Tooltip } from "../ui/tooltip/tooltip";
import { DriverService } from "../../service/driver.service";
import { TooltipPosition } from "../ui/tooltip/tooltip.enums";

@Component({
    selector: 'app-timeline',
    imports: [
        NgForOf,
        NgClass,
        TooltipDirective
    ],
    templateUrl: './timeline.component.html',
    styleUrl: './timeline.component.css'
})
export class TimelineComponent {
  private readonly timelineService = inject(TimelineService);
  private readonly driverService = inject(DriverService);

  readonly timelineSteps: Signal<TimelineStep[]> = this.timelineService.timelineSteps;

  hide = false;

  constructor() {
    this.onResize();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize() {
    this.hide = window.innerWidth <= 1460;
  }

  getTooltipPosition(stepIndex: number): TooltipPosition {
    if (stepIndex < 5) {
      return TooltipPosition.RIGHT;
    }
    if (stepIndex >= 56) {
      return TooltipPosition.LEFT;
    }
    return TooltipPosition.BELOW;
  }

  ////// STINT
  getStintColor(step: TimelineStep): string {
    if (step.status === 'DONE') {
      return 'bg-blue-400';
    } else if (step.status === 'FUTURE') {
      return 'bg-blue-100';
    }
    return 'bg-green-500';
  }

  getStintIcon(step: TimelineStep): string {
    if (step.status === 'ACTIVE') {
      return '🏎️';
    }
    return '⏳';
  }

  getStintTooltipInfo(step: TimelineStep): Tooltip {
    let paragraphs = [this.getStintTimeInfo(step), this.getDriverInfo(step)].filter(Boolean);
    return {
      footer: "",
      paragraphs: paragraphs,
      title: this.getTooltipTitle(step)
    }
  }

  private getStintTimeInfo(step: TimelineStep): string {
    let result: string[] = [];
    result.push('Start: ' + format(step.start, 'HH:mm:ss'));
    let optimumMilliseconds = step.stint ? step.stint.optimumMilliseconds ?? 0 : 0;

    switch (step.status) {
      case 'ACTIVE':
        result.push('On track: ' + getElapsedTime(step.start, new Date()));
        result.push('Optimum: ' + millisecondsToTimeString(optimumMilliseconds));
        result.push('End: (' + format(addMilliseconds(step.start, optimumMilliseconds), 'HH:mm:ss') + ')');
        break;
      case "DONE":
        result.push('On track: ' + getElapsedTime(step.start, step.end));
        result.push('Optimum: ' + millisecondsToTimeString(optimumMilliseconds));
        result.push('End: ' + (step.end ? format(step.end, 'HH:mm:ss') : ''));
        break;
      case "FUTURE":
        result.push('Optimum: ' + millisecondsToTimeString(step.durationMills));
        result.push('End: ' + (step.end ? format(step.end, 'HH:mm:ss') : ''));
        break
    }
    return result.filter(Boolean).join('\n');
  }

  ////// PIT
  getPitColor(step: TimelineStep): string {
    if (step.status === 'DONE') {
      return 'bg-amber-400';
    } else if (step.status === 'FUTURE') {
      return 'bg-amber-100';
    }
    return 'bg-green-500';
  }

  getPitIcon(step: TimelineStep): string {
    if (step.status === 'ACTIVE') {
      return '🅿️';
    }
    return '👨🏻‍🔧';
  }

  getPitTooltipInfo(step: TimelineStep): Tooltip {
    let paragraphs = [this.getPitTimeInfo(step), this.getDriverInfo(step)].filter(Boolean);
    return {
      footer: this.getPitFooter(step),
      paragraphs: paragraphs,
      title: this.getTooltipTitle(step)
    }
  }

  private getPitTimeInfo(step: TimelineStep): string {
    let result: string[] = [];
    result.push('Enter: ' + format(step.start, 'HH:mm:ss'));
    switch (step.status) {
      case 'ACTIVE':
        result.push('Time: ' + getElapsedTime(step.start, new Date()));
        break
      case "DONE":
        result.push('Time: ' + millisecondsToTimeString(step.durationMills));
        result.push('Exit: ' + (step.end ? format(step.end, 'HH:mm:ss') : ''));
        break;
      case "FUTURE":
        result.push('Time: ' + millisecondsToTimeString(step.durationMills));
        result.push('Exit: ' + (step.end ? format(step.end, 'HH:mm:ss') : ''));
        break;

    }

    return result.filter(Boolean).join('\n');
  }

  private getPitFooter(step: TimelineStep): string {
    let result = [];
    if (step.pit) {
      if (step.pit.entryDriverId !== step.pit.exitDriverId) {
        result.push('🐗');
      }
      if (step.pit.refuel) {
        result.push('⛽️');
      }
      if (step.pit.tyreChange) {
        result.push('🛞️');
      }
    }
    return result.join(' | ');
  }


  // GENERAL
  private getTooltipTitle(step: TimelineStep): string {
    if (step.type === 'STINT') {
      let id = step.stint ? '(' + step.stint.id + ')': '';
      if (step.status === 'ACTIVE') {
        return 'Active stint ' + id;
      } else if (step.status === 'DONE') {
        return 'Stint ' + id;
      } else {
        return 'Future stint';
      }
    }

    if (step.type === 'PIT') {
      let id = step.pit ? '(' + step.pit.id + ')': '';
      if (step.status === 'ACTIVE') {
        return 'Active pit ' + id;
      } else if (step.status === 'DONE') {
        return 'Pit ' + id;
      } else {
        return 'Future pit';
      }
    }

    return '';
  }

  private getDriverInfo(step: TimelineStep): string {
    if (step.type === 'STINT' && step.stint) {
      return 'Driver: ' + this.getDriverRacingName(step.stint.driverId);
    }

    if (step.type === 'PIT' && step.pit) {
      let driverIn = 'Driver in: ' + this.getDriverRacingName(step.pit.entryDriverId);
      let driverOut = 'Driver out: ' + this.getDriverRacingName(step.pit.exitDriverId);
      return driverIn + '\n' + driverOut;
    }
    return '';
  }

  private getDriverRacingName(driverId: string): string {
    const drivers = this.driverService.drivers();
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.raceName : '';
  }
}
