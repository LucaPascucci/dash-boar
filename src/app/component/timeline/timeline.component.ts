import { Component, inject, Signal } from '@angular/core';
import { NgClass, NgForOf } from "@angular/common";
import { TimelineService } from "../../service/timeline.service";
import { TimelineStep } from "../../model/timeline-step";
import { format } from "date-fns";
import { TooltipDirective } from "../ui/tooltip/tooltip.directive";
import { millisecondsToTimeString } from "../../util/date.util";

@Component({
  selector: 'app-timeline',
  standalone: true,
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

  getStintTooltipInfo(step: TimelineStep): string {
    let startInfo = 'Start: ' + format(step.start, 'HH:mm:ss');
    let endInfo = step.end ? 'End: ' + format(step.end, 'HH:mm:ss') : '';
    let durationInfo = step.durationMills ? 'On Track: ' + millisecondsToTimeString(step.durationMills) : '';

    if (endInfo.length > 0) {
      startInfo += '\n';
    }
    if (durationInfo.length > 0) {
      endInfo += '\n';
    }
    return startInfo + endInfo + durationInfo;
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

  getPitTooltipInfo(step: TimelineStep): string {
    let startInfo = 'Enter: ' + format(step.start, 'HH:mm:ss');
    let durationInfo = step.durationMills ? 'Time: ' + millisecondsToTimeString(step.durationMills) : '';

    let pitInfo = '';
    if (step.pit) {
      pitInfo += '🐗 -> ' + (step.pit.entryDriverId !== step.pit.exitDriverId ? '✅' : '') + '\n';
      pitInfo += '⛽️ -> ' + (step.pit.refuel ? '✅' : '') + '\n';
      pitInfo += '🛞 -> ' + (step.pit.tyreChange ? '✅' : '');
    }

    if (durationInfo.length > 0) {
      startInfo += '\n';
    }
    if (pitInfo.length > 0) {
      durationInfo += '\n';
    }

    return startInfo + durationInfo + pitInfo;
  }
}
