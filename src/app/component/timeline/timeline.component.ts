import { Component, inject, Signal } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";
import { TimelineService } from "../../service/timeline.service";
import { TimelineStep } from "../../model/timeline-step";
import { addMilliseconds, format } from "date-fns";
import { TooltipDirective } from "../ui/tooltip/tooltip.directive";
import { getElapsedTime, millisecondsToTimeString } from "../../util/date.util";
import { Tooltip } from "../ui/tooltip/tooltip";
import { DriverService } from "../../service/driver.service";

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
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize() {
    this.hide = window.innerWidth <= 1460;
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

  getStintText(step: TimelineStep): string {
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

  getPitText(step: TimelineStep): string {
    if (step.status === 'ACTIVE') {
      return '🅿️';
    }
    return '👨🏻‍🔧';
  }

  getPitTooltipInfo(step: TimelineStep): Tooltip {
    let startInfo = 'Enter: ' + format(step.start, 'HH:mm:ss');
    let durationInfo = step.durationMills ? 'Time: ' + millisecondsToTimeString(step.durationMills) : '';
    let endInfo = 'Exit: ' + (step.end ?  format(step.end, 'HH:mm:ss') : format(addMilliseconds(step.start, step.durationMills ?? 0), 'HH:mm:ss'));

    let emojis = [];
    if (step.pit) {
      if (step.pit.entryDriverId !== step.pit.exitDriverId) {
        emojis.push('🐗');
      }
      if (step.pit.refuel) {
        emojis.push('⛽️');
      }
      if (step.pit.tyreChange) {
        emojis.push('🛞️');
      }
    }

    if (durationInfo.length > 0) {
      startInfo += '\n';
    }

    if (endInfo.length > 0) {
      durationInfo += '\n';
    }

    let timeParagraph = startInfo + durationInfo + endInfo;
    let paragraphs = [timeParagraph, this.getDriverInfo(step)].filter(Boolean);
    return {
      footer: emojis.join(' | '),
      paragraphs: paragraphs,
      title: this.getTooltipTitle(step)
    }
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
