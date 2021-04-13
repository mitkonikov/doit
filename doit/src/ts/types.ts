export interface User {
    calendars: string[];
}

export interface Calendar {
    data: number[];
    name: string;
    start_date: {
        nanoseconds: number;
        seconds: number;
    }
}