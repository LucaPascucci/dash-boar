import { computed, inject, Injectable, Signal } from '@angular/core';
import { RaceService } from "./race.service";
import { StintService } from "./stint.service";
import { Race } from "../model/race";
import { Timestamp } from "@firebase/firestore";
import { Stint } from "../model/stint";
import { PitService } from "./pit.service";
import { Pit } from "../model/pit";
import { StintOptimizerService } from "./stint-optimizer.service";

@Injectable({
  providedIn: 'root'
})
export class RaceManagerService {
  private readonly raceService = inject(RaceService);
  private readonly stintService = inject(StintService);
  private readonly pitService = inject(PitService);
  private readonly stintOptimizerService = inject(StintOptimizerService)

  private readonly activeRace: Signal<Race | undefined> = this.raceService.activeRace;
  private readonly activeStint: Signal<Stint | undefined> = this.stintService.activeStint;
  private readonly activePit: Signal<Pit | undefined> = this.pitService.activePit;
  private readonly optimizedStintMilliseconds = computed(() => {
      const optimizedStint = this.stintOptimizerService.optimizedStint();
      if (optimizedStint) {
        return optimizedStint.avgStintMillisecondsTime;
      }
      return 0;
  })

  async startRace(firstDriverId: string): Promise<void> {
    const race = this.createRace();
    const createdRace = await this.raceService.create(race);
    if (createdRace) {
      await this.startStint(createdRace.id, firstDriverId, createdRace.start);
    }
  }

  async pitIn(newDriverId: string, refueling: boolean, tyreChange: boolean): Promise<void> {
    const activeRace = this.activeRace();
    const activeStint = this.activeStint();

    if (activeRace && activeStint) {
      const pit = this.createPit(activeStint.driverId, newDriverId, activeRace.id, refueling, tyreChange);
      const createdPit = await this.pitService.create(pit);
      await this.closeActiveStint(createdPit.entryTime);
    }
  }

  async pitOut(): Promise<void> {
    const activeRace = this.activeRace();
    const activePit = this.activePit();

    if (activeRace && activePit) {
        const now = Timestamp.now();
        await this.closeActivePit(now);
        await this.startStint(activeRace.id, activePit.exitDriverId, now);
    }
  }

  private async startStint(raceId: string, driverId: string, start: Timestamp): Promise<Stint> {
    const stint = this.createStint(raceId, driverId, start);
    await this.stintService.create(stint);
    return stint;
  }

  private async closeActiveStint(end: Timestamp): Promise<void> {
    const activeStint = this.activeStint();
    if (activeStint) {
      activeStint.endDate = end;
      await this.stintService.update(activeStint);
    }
  }

  private async closeActivePit(end: Timestamp): Promise<void> {
    const activePit = this.activePit();
    if (activePit) {
      activePit.exitTime = end;
      await this.pitService.update(activePit);
    }
  }

  private createRace(): Race {
    return {
      id: '1',
      start: Timestamp.now(),
      deleted: false
    };
  }

  private createStint(raceId: string, driverId: string, start: Timestamp): Stint {
    return {
      id: "1",
      deleted: false,
      driverId: driverId,
      endDate: null,
      optimumMilliseconds: this.optimizedStintMilliseconds(),
      raceId: raceId,
      startDate: start
    };
  }

  private createPit(entryDriveId: string, exitDriverId: string, raceId: string, refueling: boolean, tyreChange: boolean ): Pit {
    return {
      id: "1",
      entryDriverId: entryDriveId,
      entryTime: Timestamp.now(),
      exitDriverId: exitDriverId,
      exitTime: null,
      raceId: raceId,
      refuel: refueling,
      tyreChange: tyreChange,
      deleted: false,

    }
  }
}
