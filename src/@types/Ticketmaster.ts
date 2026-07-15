export interface TicketmasterEvent {
  _embedded?: {
    attractions?: { name: string }[];
    venues?: TicketmasterVenue[];
  };
  dates: {
    start: {
      dateTime?: string;
      localDate: string;
    };
  };
  id: string;
  name: string;
  url: string;
}

export interface TicketmasterSearchResponse {
  _embedded?: {
    events: TicketmasterEvent[];
  };
}

export interface TicketmasterVenue {
  city?: { name: string };
  country?: { countryCode: string; name: string };
  name: string;
  state?: { name: string };
}
