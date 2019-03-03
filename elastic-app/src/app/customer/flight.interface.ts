export interface Flights {
    FlightNum: string;
    DestCountry: string;
    OriginWeather: string;
    OriginCityName: string;
    AvgTicketPrice: number;
    DistanceMiles: number;
    FlightDelay: boolean;
    DestWeather: string;
    Dest: string;
    FlightDelayType: string;
    OriginCountry: string;
    DistanceKilometers: string;
    Carrier: string;


}

export interface FlightSource {
    _source: Flights;
}

