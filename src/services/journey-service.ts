import mongoose from 'mongoose';
import Station from '../models/station';

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

export const updateStation = async (
  departureID: number,
  returnID: number,
  journeyID: mongoose.Types.ObjectId,
  username: string,
) => {
  const departureStation = await Station.findOne({
    SId: departureID,
  });
  const destinationStation = await Station.findOne({
    SId: returnID,
  });
  if (departureStation && destinationStation) {
    const departureFrom = departureStation.journeys.get('depart');
    if (departureFrom) {
      departureStation.journeys.set(
        'depart',
        // eslint-disable-next-line no-underscore-dangle
        departureFrom.concat(journeyID),
      );
    } else {
      return {
        error: `Can not assign 'depart' of journeys for user ${username}`,
      };
    }
    const destinationMap = departureStation.destination.get(
      // eslint-disable-next-line no-underscore-dangle
      destinationStation._id,
    );
    if (destinationMap) {
      departureStation.destination.set(
        // eslint-disable-next-line no-underscore-dangle
        destinationStation._id,
        destinationMap + 1,
      );
    } else {
      departureStation.destination.set(
        // eslint-disable-next-line no-underscore-dangle
        destinationStation._id,
        1,
      );
    }
    const destinationTo = destinationStation.journeys.get('arrive');
    if (destinationTo) {
      destinationStation.journeys.set(
        'arrive',
        // eslint-disable-next-line no-underscore-dangle
        destinationTo.concat(journeyID),
      );
    } else {
      return {
        error: `Can not assign 'depart' of journeys for user ${username}`,
      };
    }
    const departureMap = destinationStation.departure.get(
      // eslint-disable-next-line no-underscore-dangle
      departureStation._id,
    );
    if (departureMap) {
      destinationStation.departure.set(
        // eslint-disable-next-line no-underscore-dangle
        departureStation._id,
        departureMap + 1,
      );
    } else {
      destinationStation.departure.set(
        // eslint-disable-next-line no-underscore-dangle
        departureStation._id,
        1,
      );
    }
    const newDepart = await departureStation.save();
    const newDestin = await destinationStation.save();

    return { newDepart, newDestin };
  }
  return { error: 'No station found.' };
};
