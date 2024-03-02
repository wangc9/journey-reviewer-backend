/* eslint-disable @typescript-eslint/indent */
import mongoose from 'mongoose';
import Station, { IStationDocument } from '../models/station';

export interface IDuration {
  startTime: string;
  endTime: string;
  duration?: number;
}

export const checkDuration = (body: IDuration): undefined | number => {
  const journeyStart = new Date(body.startTime);
  const journeyEnd = new Date(body.endTime);
  const duration = (journeyEnd.getTime() - journeyStart.getTime()) / 1000;
  if (
    (body.duration && Math.abs(body.duration - duration) > 10) ||
    duration < 10
  ) {
    return undefined;
  }
  return duration;
};

export const adjustTime = (
  originalTime: string,
  duration: number,
  timeSpec: string,
) => {
  if (timeSpec === 'start') {
    const startTime = new Date(originalTime);
    const newEndTime = new Date();
    newEndTime.setTime(startTime.getTime() + duration * 1000);
    const result = {
      startTime: originalTime,
      endTime: newEndTime.toISOString(),
      duration,
    };

    return result;
  }
  const endTime = new Date(originalTime);
  const newStartTime = new Date();
  newStartTime.setTime(endTime.getTime() - duration * 1000);
  const result = {
    startTime: newStartTime.toISOString(),
    endTime: originalTime,
    duration,
  };

  return result;
};

export const updateDeparture = async (
  departureStation: mongoose.Document<unknown, {}, IStationDocument> &
    IStationDocument & {
      _id: mongoose.Types.ObjectId;
    },
  destinationStation: mongoose.Document<unknown, {}, IStationDocument> &
    IStationDocument & {
      _id: mongoose.Types.ObjectId;
    },
  journeyID: mongoose.Types.ObjectId,
  username: string,
) => {
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
  const newDepart = await departureStation.save();
  return newDepart;
};

export const updateDestination = async (
  departureStation: mongoose.Document<unknown, {}, IStationDocument> &
    IStationDocument & {
      _id: mongoose.Types.ObjectId;
    },
  destinationStation: mongoose.Document<unknown, {}, IStationDocument> &
    IStationDocument & {
      _id: mongoose.Types.ObjectId;
    },
  journeyID: mongoose.Types.ObjectId,
  username: string,
) => {
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
  const newDestin = await destinationStation.save();

  return newDestin;
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
    const newDepart = await updateDeparture(
      departureStation,
      destinationStation,
      journeyID,
      username,
    );
    const newDestin = await updateDestination(
      departureStation,
      destinationStation,
      journeyID,
      username,
    );

    return { newDepart, newDestin };
  }
  return { error: 'No station found.' };
};

export const renewStation = async (
  oldDepartureID: number,
  newDepartureID: number,
  oldReturnID: number,
  newReturnID: number,
  journeyID: mongoose.Types.ObjectId,
  username: string,
) => {
  if (oldDepartureID !== newDepartureID || oldReturnID !== newReturnID) {
    const oldDepartureStation = await Station.findOne({
      SId: oldDepartureID,
    });
    const oldDestinationStation = await Station.findOne({
      SId: oldReturnID,
    });
    if (oldDepartureStation && oldDestinationStation) {
      const departureFrom = oldDepartureStation.journeys.get('depart');
      if (departureFrom) {
        oldDepartureStation.journeys.set(
          'depart',
          // eslint-disable-next-line no-underscore-dangle
          departureFrom.filter((id) => id.toString() !== journeyID.toString()),
        );
      } else {
        return {
          error: `Can not delete old 'depart' of journeys for user ${username}`,
        };
      }
      const oldDestinationMap = oldDepartureStation.destination.get(
        // eslint-disable-next-line no-underscore-dangle
        oldDestinationStation._id,
      );
      if (oldDestinationMap) {
        oldDepartureStation.destination.set(
          // eslint-disable-next-line no-underscore-dangle
          oldDestinationStation._id,
          oldDestinationMap - 1,
        );
      }
      const destinationTo = oldDestinationStation.journeys.get('arrive');
      if (destinationTo) {
        oldDestinationStation.journeys.set(
          'arrive',
          // eslint-disable-next-line no-underscore-dangle
          destinationTo.filter((id) => id.toString() !== journeyID.toString()),
        );
      } else {
        return {
          error: `Can not delete old 'depart' of journeys for user ${username}`,
        };
      }
      const departureMap = oldDestinationStation.departure.get(
        // eslint-disable-next-line no-underscore-dangle
        oldDepartureStation._id,
      );
      if (departureMap) {
        oldDestinationStation.departure.set(
          // eslint-disable-next-line no-underscore-dangle
          oldDepartureStation._id,
          departureMap - 1,
        );
      }
      await oldDepartureStation.save();
      await oldDestinationStation.save();

      const { newDepart, newDestin } = await updateStation(
        newDepartureID,
        newReturnID,
        journeyID,
        username,
      );

      return { newDepart, newDestin };
    }
    return { error: 'No station found.' };
  }
  const departureStation = await Station.findOne({
    SId: oldDepartureID,
  });
  const destinationStation = await Station.findOne({
    SId: oldReturnID,
  });
  return { newDepart: departureStation, newDestin: destinationStation };
};
