import { intervalToDuration } from "date-fns";

export function calculateCountdownStringToDate(futureDate: Date): string {
  const duration = intervalToDuration({
    end: futureDate,
    start: new Date()
  });
  if (duration.hours && duration.hours < 0) {
    return '00:00:00';
  }
  if (duration.minutes && duration.minutes < 0) {
    return '00:00:00';
  }
  if (duration.seconds && duration.seconds < 0) {
    return '00:00:00';
  }
  return [padTwo(duration.hours), padTwo(duration.minutes), padTwo(duration.seconds)].join(":");
}

function padTwo(num: number | undefined) {
  if (num) {
    return num < 10 ? `0${num}` : `${num}`;
  }
  return '00';
}


