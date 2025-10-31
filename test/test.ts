/* istanbul ignore file */
import NSAPI from '../src/nsapi';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const config = {
  key: process.env.NS_APIKEY ?? '',
  timeout: Number(process.env.NS_TIMEOUT) || 8000,
};

const ns = new NSAPI(config);

let disruption: any;
let trip: any;

let dateTime = new Date();
dateTime.setDate(dateTime.getDate() + 1);
dateTime.setHours(14, 0, 0, 0);

describe('NSAPI Module', () => {
  test('exports expected methods', () => {
    expect(typeof NSAPI).toBe('function');
    const methods = [
      'getAllStations',
      'getArrivals',
      'getCalamities',
      'getDepartures',
      'getDisruption',
      'getDisruptions',
      'getStationDisruption',
      'getTrip',
      'getTrips',
      'getPrice',
      'getJourney',
      'placesList',
      'placesGet',
      'placesOvfiets',
    ];

    for (const fn of methods) {
      expect(typeof (ns as any)[fn]).toBe('function');
    }
  });

  test('API error - statusCode', async () => {
    await expect(ns.getTrip()).rejects.toMatchObject({
      message: 'API error',
      statusCode: 404,
    });
  });

  test('API error - code && message', async () => {
    await expect(ns.getPrice({})).rejects.toMatchObject({
      code: 404,
    });
  });

  test('Method .getAllStations', async () => {
    const data = await ns.getAllStations();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(typeof data[0].code).toBe('string');
  });

  test('Method .getArrivals - Without dateTime', async () => {
    const data = await ns.getArrivals({ station: 'UT' });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(typeof data[0].name).toBe('string');
  });

  test('Method .getArrivals - With dateTime', async () => {
    const data = await ns.getArrivals({ station: 'UT', dateTime });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(typeof data[0].actualDateTime).toBe('string');
  });

  test('Method .getDisruptions', async () => {
    const data = await ns.getDisruptions();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) disruption = data[0];
  });

  test('Method .getDisruption', async () => {
    if (!disruption) return;
    const data = await ns.getDisruption({
      type: disruption.type,
      id: disruption.id,
    });
    expect(data.id).toBe(disruption.id);
  });

  test('Method .getTrips', async () => {
    const data = await ns.getTrips({ fromStation: 'UT', toStation: 'AMF' });
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) trip = data[0];
  });

  test('Method .getTrip', async () => {
    if (!trip) return;
    const data = await ns.getTrip({ ctxRecon: trip.ctxRecon });
    expect(data.ctxRecon).toBe(trip.ctxRecon);
  });

  test('Method .getPrice', async () => {
    const data = await ns.getPrice({ fromStation: 'UT', toStation: 'AMF' });
    expect(typeof data.totalPriceInCents).toBe('number');
  });

  test('Config timeout', async () => {
    const tmp = new NSAPI({ key: config.key ?? '', timeout: 1 });
    await expect(tmp.getAllStations()).rejects.toMatchObject({
      name: 'TimeoutError',
    });
  });
});
