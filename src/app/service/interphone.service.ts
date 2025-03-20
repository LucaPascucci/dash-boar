import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { RaceService } from "./race.service";
import { PitService } from "./pit.service";
import { RaceConfigService } from "./race-config.service";
import { combineLatest, interval } from "rxjs";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Pit } from "../model/pit";
import { Race } from "../model/race";
import { RaceConfig } from "../model/race-config";
import {
  addMinutes,
  differenceInMinutes,
} from "date-fns";

@Injectable({
  providedIn: 'root'
})
export class InterphoneService {
  private readonly raceService = inject(RaceService);
  private readonly pitService = inject(PitService);
  private readonly raceConfigService = inject(RaceConfigService);

  readonly lastChangeDate: WritableSignal<Date | undefined> = signal(undefined);
  readonly emptyBatteryDate: WritableSignal<Date | undefined> = signal(undefined);
  readonly remainingBatteryPercentage: WritableSignal<number> = signal(100);

  constructor() {
    combineLatest({
      lastInterphoneChangePit: toObservable(this.pitService.lastInterphoneChangePit),
      race: toObservable(this.raceService.activeRace),
      raceConfig: toObservable(this.raceConfigService.raceConfig),
      ping: interval(1000)
    })
    .pipe(takeUntilDestroyed())
    .subscribe(
        ({
           lastInterphoneChangePit,
           race,
           raceConfig
         }) => {
            this.lastChangeDate.set(this.getInterphoneChangeDate(lastInterphoneChangePit, race));
            this.emptyBatteryDate.set(this.calculateEmptyBatteryDate(this.lastChangeDate(), raceConfig));
            this.remainingBatteryPercentage.set(this.calculateRemainingBatteryPercentage(this.emptyBatteryDate(),raceConfig))
        });

  }

  private getInterphoneChangeDate(lastInterphoneChangePit: Pit | undefined, race: Race | undefined): Date | undefined {
    if (lastInterphoneChangePit?.exitTime) {
      return lastInterphoneChangePit.exitTime.toDate();
    }
    if (race) {
      return race.start.toDate();
    }
    return undefined;
  }

  private calculateEmptyBatteryDate(lastInterphoneChangeDate: Date | undefined, raceConfig: RaceConfig | undefined): Date | undefined {
    if (lastInterphoneChangeDate && raceConfig) {
      return addMinutes(lastInterphoneChangeDate, raceConfig.interphoneBatteryDurationMinute)
    }
    return undefined;
  }

  private calculateRemainingBatteryPercentage(emptyBatteryDate: Date | undefined, raceConfig: RaceConfig | undefined): number {
    if (emptyBatteryDate && raceConfig) {
      const remainingMinutes = differenceInMinutes(emptyBatteryDate, new Date());
      const percentage = (remainingMinutes / raceConfig.interphoneBatteryDurationMinute) * 100;
      const clampedPercentage = Math.max(0, Math.min(percentage, 100));
      return parseFloat(clampedPercentage.toFixed(0));
    }
    return 100;
  }
}
