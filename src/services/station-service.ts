import Station from '../models/station';

export interface DJourney {
  departure: number;
  returnID: number;
  journeyID: string;
}

export const deleteJourney = async ({
  departure,
  returnID,
  journeyID,
}: DJourney) => {
  const departStation = await Station.findOne({ SId: departure });
  const destStation = await Station.findOne({ SId: returnID });
  if (departStation && destStation) {
    const departJourneyArray = departStation.journeys.get('depart');
    // eslint-disable-next-line no-underscore-dangle
    const destStationCount = departStation.destination.get(destStation._id);
    if (departJourneyArray && destStationCount) {
      departStation.journeys.set(
        'depart',
        departJourneyArray.filter((jour) => jour.toString() !== journeyID),
      );
      // eslint-disable-next-line no-underscore-dangle
      departStation.destination.set(destStation._id, destStationCount - 1);
      const destJourneyArray = destStation.journeys.get('arrive');
      // eslint-disable-next-line no-underscore-dangle
      const departStationCount = destStation.departure.get(departStation._id);
      if (destJourneyArray && departStationCount) {
        destStation.journeys.set(
          'arrive',
          destJourneyArray.filter((jour) => jour.toString() !== journeyID),
        );
        // eslint-disable-next-line no-underscore-dangle
        destStation.departure.set(departStation._id, departStationCount - 1);
        const updatedDepartStation = await departStation.save();
        const updatedDestStation = await destStation.save();
        return { updatedDepartStation, updatedDestStation };
      }
      return { error: 'Error in the logic of the destination station' };
    }
    return { error: 'Error in the logic of the departure station' };
  }
  return { error: 'No station found' };
};
