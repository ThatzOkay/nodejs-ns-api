/*
Name:       nsapi.js - Unofficial NodeJS module for Nederlandse Spoorwegen API
Author:     Franklin (https://frankl.in)
Source:     https://github.com/fvdm/nodejs-ns-api
API Docs:   https://apiportal.ns.nl
License:    Unlicense (Public Domain, see LICENSE file)
*/

import NSAPIInterface from './types/interface';
import { NSDeparture } from './types/nsDeparture';
import { NSStation } from './types/nsStation';

export default class NSAPI implements NSAPIInterface {

  /**
   * Configuration
   *
   * @param   {string}  key             Primary API key
   * @param   {number}  [timeout=5000]  Request timeout in ms
   */

  constructor ( {

    key,
    timeout = 8000,

  }: {
    key: string,
    timeout?: number,
  } ) {

    this._config = {
      key,
      timeout,
    };

  }

  private _config : {
    key: string,
    timeout: number,
  } = {
    key: '',
    timeout: 8000,
  }

  /**
   * Talk to the API
   *
   * @param   {string}  path          Method path
   * @param   {object}  [parameters]  Request details
   *
   * @return  {Promise<object>}
   */

  async _request(options: { path: string; parameters?: Record<string, any> }): Promise<any> {
    let url = `https://gateway.apiportal.ns.nl${options.path}`;
    const params = new URLSearchParams(options.parameters as any);

    url += '?' + params.toString();

    const requestOptions = {
      method: 'GET',
      signal: AbortSignal.timeout( this._config.timeout ),
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': this._config.key,
      },
    };

    const res = await fetch( url, requestOptions );
    const data = await res.json();
    let error;

    // Normal API error
    if ( data.code && data.message ) {
      error = new Error( `API: ${data.message}` );
      error.cause = data.errors;
      throw error;
    }

    // API field error - hard to replicate
    /* istanbul ignore next */
    if ( data.fieldErrors && data.fieldErrors.length ) {
      error = new Error( 'API field error' );
      error.cause = data.fieldErrors;
      throw error;
    }

    // API error without message - hard to replicate
    /* istanbul ignore next */
    if ( data.errors && data.errors[0] ) {
      error = new Error( 'API error' );
      error.cause = data.errors;
      throw error;
    }

    // API server error
    if ( res.status >= 300 ) {
      error = new Error( 'API error' );
      error.cause = res.statusText;
      throw error;
    }

    // ok
    return data;
  }


  // ! REISINFORMATIE

  /**
   * Get a list of all stations
   *
   * @return  {Promise<array>}
   */

  async getAllStations(query?: string): Promise<NSStation[]> {
    const data = await this._request( {
      path: '/reisinformatie-api/api/v2/stations',
      parameters: { query },
    } );

    return data.payload;
  }


  /**
   * Get arrivals for a station
   *
   * @param   {object}          parameters  Request parameters
   * @return  {Promise<array>}
   */

  async getArrivals ( parameters: any ) {
    if ( parameters.dateTime && ! ( parameters.dateTime instanceof Date ) ) {
      parameters.dateTime = new Date( parameters.dateTime ).toString();
    }

    const data = await this._request( {
      path: '/reisinformatie-api/api/v2/arrivals',
      parameters,
    } );

    return data.payload.arrivals;
  }


  /**
   * Get calamities
   *
   * @param   {object}          [parameters]  Request parameters
   * @return  {Promise<array>}
   */

  async getCalamities ( parameters = {} ) {
    const data = await this._request( {
      path: '/reisinformatie-api/api/v1/calamities',
      parameters,
    } );

    return data.meldingen;
  }


  /**
   * Get a list of departure times
   *
   * @param   {object}          parameters  Request parameters
   * @return  {Promise<array>}
   */

  async getDepartures(station: string, dateTime: Date | string): Promise<NSDeparture[]> {
    if (dateTime && !(dateTime instanceof Date)) {
      dateTime = new Date(dateTime).toISOString();
    }

    const data = await this._request( {
      path: '/reisinformatie-api/api/v2/departures',
      parameters: { station, dateTime },
    } );

    return data.payload.departures;
  }


  /**
   * Get details about one disruption
   *
   * @param   {object}  parameters       Request parameters
   * @param   {string}  parameters.type  Disruption type
   * @param   {string}  parameters.id    Disruption ID
   *
   * @return  {Promise<object>}
   */

  async getDisruption ( parameters: any ) {
    const type = parameters.type;
    const id = parameters.id;

    delete parameters.type;
    delete parameters.id;

    const data = await this._request( {
      path: `/reisinformatie-api/api/v3/disruptions/${type}/${id}`,
      parameters,
    } );

    return data;
  }


  /**
   * Get a list of disruptions
   *
   * @param   {object}          parameters  Request parameters
   * @return  {Promise<array>}
   */

  async getDisruptions ( parameters: any = {} ) {
    parameters.actual = parameters.actual === true ? 'true' : 'false';

    const data = await this._request( {
      path: '/reisinformatie-api/api/v3/disruptions',
      parameters,
    } );

    return data;
  }


  /**
   * Get a list of disruptions for a specific station
   *
   * @param   {object}           parameters       Request parameters
   * @param   {object}           parameters.code  UICCode or station code
   *
   * @return  {Promise<object>}
   */

  async getStationDisruption ( parameters: any ) {
    const code = parameters.code;

    delete parameters.code;

    const data = await this._request( {
      path: `/reisinformatie-api/api/v3/disruptions/station/${code}`,
      parameters,
    } );

    return data;
  }


  /**
   * Reconstruct a trip if possible using the given reconCtx
   *
   * @param   {object}          parameters  Request parameters
   * @return  {Promise<array>}
   */

  async getTrip ( parameters = {} ) {

    /*
    if ( parameters.date && !( parameters.date instanceof Date ) ) {
      parameters.date = new Date ( parameters.date ).toISOString();
    }
    */

    const data = await this._request( {
      path: '/reisinformatie-api/api/v3/trips/trip',
      parameters,
    } );

    return data;
  }


  /**
   * Searches for a travel advice with the specified options between the
   * possible backends (HARP, 9292 or PAS/AVG)
   *
   * For door-to-door trips you need a special API key
   *
   * @param   {object}          parameters  Request parameters
   * @return  {Promise<array>}
   */

  async getTrips ( parameters: any ) {
    if ( parameters.dateTime && ! ( parameters.dateTime instanceof Date ) ) {
      parameters.dateTime = new Date( parameters.dateTime ).toISOString();
    }

    const data = await this._request( {
      path: '/reisinformatie-api/api/v3/trips',
      parameters,
    } );

    return data.trips;
  }


  /**
   * Get pricing for travel between two stations
   *
   * @param   {object}          parameters  Request parameters
   * @return  {Promise<array>}
   */

  async getPrice ( parameters: any ) {
    // YYYY-MM-DD
    if ( parameters.date && ! ( parameters.date instanceof Date ) ) {
      parameters.date = new Date( parameters.date ).toISOString().split( 'T' )[0];
    }

    const data = await this._request( {
      path: '/reisinformatie-api/api/v2/price',
      parameters,
    } );

    return data.payload;
  }


  /**
   * Get information about a specific journey
   *
   * @param   {object}          Parameters  Request parameters
   * @return  {Promise<object>}
   */

  async getJourney ( parameters: any ) {
    if ( parameters.dateTime && ! ( parameters.date instanceof Date ) ) {
      parameters.dateTime = new Date( parameters.dateTime ).toISOString();
    }

    const data = await this._request( {
      path: '/reisinformatie-api/api/v2/journey',
      parameters,
    } );

    return data.payload;
  }


  // ! PLACES

  /**
   * Get list of places
   *
   * @param   {object}  parameters  Request parameters
   * @return  {Promise<array>}
   */

  async placesList ( parameters: any ) {
    const data = await this._request( {
      path: '/places-api/v2/places',
      parameters,
    } );

    return data.payload;
  }


  /**
   * Get list of OV Fiets locations
   *
   * @param   {object}  parameters  Request parameters
   * @return  {Promise<array>}
   */

  async placesOvfiets ( parameters: any ) {
    const data = await this._request( {
      path: '/places-api/v2/ovfiets',
      parameters,
    } );

    return data.payload;
  }


  /**
   * Get place
   *
   * @param   {string}  type    Place type, ie. stationV2
   * @param   {string}  id      Place ID, ie. AMF
   * @param   {string}  [lang]  Response language
   *
   * @return  {Promise<object>}
   */

  async placesGet ( {
    type,
    id,
    lang = '',
  }: {
    type: string,
    id: string,
    lang?: string,
  } ) {
    const data = await this._request( {
      path: `/places-api/v2/places/${type}/${id}`,
      parameters: {
        lang,
      },
    } );

    return data.payload;
  }

};
