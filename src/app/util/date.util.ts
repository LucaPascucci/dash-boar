import { Duration, intervalToDuration } from "date-fns";

export function getElapsedTime(start: Date | undefined, end: Date | undefined): string {
  if (!start || !end) {
    return '--:--:--';
  }
  const duration = intervalToDuration({
    end: end,
    start: start
  });
  return formatDuration(duration);
}

export function getTimeUntilFutureDate(futureDate: Date | undefined): string {
  if (!futureDate) {
    return '--:--:--';
  }
  const duration = intervalToDuration({
    end: futureDate,
    start: new Date()
  });
  return formatDuration(duration);
}


function formatDuration(duration: Duration): string {
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


