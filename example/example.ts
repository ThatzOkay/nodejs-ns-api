/* eslint-disable no-console */

import NSAPI from '../src/nsapi.js';
const ns = new NSAPI( {
  key: 'abc123',
} );

// console.log does not log >3 levels
function output ( data: any ) {
  console.dir( data, {
    depth: null,
    colors: true,
  } );
}

// Get travel advise
ns.getTrips( {
  fromStation: 'Amersfoort',
  toStation: 'Den Haag',
} )
  .then( output )
  .catch( console.error )
;
