import { DepartureStatus } from "./departureStatus";
import { Message } from "./message";
import { Product } from "./product";
import { RecognizableDestination } from "./recognizableDestination";
import { RouteStation } from "./routeStation";
import { TrainCategory } from "./trainCategory";

export type NSDeparture = {
  direction: string;
  name: string;
  plannedDateTime: string;
  plannedTimeZoneOffset: number;
  actualDateTime: string;
  actualTimeZoneOffset: number;
  plannedTrack: string;
  actualTrack: string;
  product: Product;
  trainCategory: TrainCategory;
  cancelled: boolean;
  routeStations: RouteStation[];
  messages: Message[];
  departureStatus: DepartureStatus;
  recognizableDestination?: RecognizableDestination;
};
