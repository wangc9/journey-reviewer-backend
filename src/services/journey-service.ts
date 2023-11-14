export interface IDuration {
  startTime: string;
  endTime: string;
  duration?: number;
}

export const checkDuration = (body: IDuration): undefined | number => {
  const journeyStart = new Date(body.startTime);
  const journeyEnd = new Date(body.endTime);
  const duration = Math.abs(
    (journeyEnd.getTime() - journeyStart.getTime()) / 1000,
  );
  if (body.duration && Math.abs(body.duration - duration) > 1) {
    return undefined;
  }
  return duration;
};
