import { NSDeparture } from "./nsDeparture";
import { NSStation } from "./nsStation";

export default interface NSAPIInterface {
    getDepartures(station: string, dateTime: Date | string): Promise<NSDeparture[]>
    getAllStations(query?: string): Promise<NSStation[]>
    _request(options: { path: string; parameters?: Record<string, any> }): Promise<any>
}
