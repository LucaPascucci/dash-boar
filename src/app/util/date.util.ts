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

export function millisecondsToTimeString(milliseconds: number | undefined): string {
  if (!milliseconds || milliseconds < 0) {
    return '--:--:--';
  }
  const totalSeconds = Math.floor(milliseconds / 1000);

  const duration: Duration = {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };

  return formatDuration(duration);
}

export function millisecondsToPitString(milliseconds: number | undefined): string {
  if (!milliseconds || milliseconds < 0) {
    return '--:--:--';
  }
  const totalSeconds = Math.floor(milliseconds / 1000);

  const duration: Duration = {
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };

  return formatDuration(duration);
}

export function millisecondsToLapString(milliseconds: number | undefined): string {
  if (!milliseconds || milliseconds < 0) {
    return '--:--:---';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const remainingMilliseconds = milliseconds % 1000;

  const duration: Duration = {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60
  };

  return formatDurationWithMilliseconds(duration, remainingMilliseconds);
}

function formatDurationWithMilliseconds(duration: Duration, milliseconds: number): string {
  if (duration.minutes && duration.minutes < 0) {
    return '--:--:---';
  }
  if (duration.seconds && duration.seconds < 0) {
    return '--:--:---';
  }
  return [padTwo(duration.minutes), padTwo(duration.seconds), padThree(milliseconds)].join(":");
}


function formatDuration(duration: Duration): string {
  if (duration.hours && duration.hours < 0) {
    return '--:--:--';
  }
  if (duration.minutes && duration.minutes < 0) {
    return '--:--:--';
  }
  if (duration.seconds && duration.seconds < 0) {
    return '--:--:--';
  }
  return [padTwo(duration.hours), padTwo(duration.minutes), padTwo(duration.seconds)].join(":");
}

function padTwo(num: number | undefined): string {
  if (num) {
    return num < 10 ? `0${num}` : `${num}`;
  }
  return '00';
}

function padThree(num: number): string {
  if (num < 10) {
    return `00${num}`;
  } else if (num < 100) {
    return `0${num}`;
  }
  return `${num}`;
}


