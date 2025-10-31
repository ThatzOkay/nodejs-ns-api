import { Land } from "./land"
import { Namen } from "./namen"
import { NearbyMeLocationID } from "./nearbyMeLocationID"
import { Sporen } from "./sporen"
import { StationType } from "./stationType"

  export type NSStation = {
    EVACode: string
    UICCode: string
    code: string
    ingangsDatum: Date
    heeftFaciliteiten: boolean
    heeftReisassistentie: boolean
    heeftVertrektijden: boolean
    land: Land
    lat: number
    lng: number
    radius: number
    naderenRadius: number
    namen: Namen
    synoniemen: string[]
    nearbyMeLocationId: NearbyMeLocationID
    sporen: Sporen[]
    stationType: StationType
    cdCode?: number
  }
