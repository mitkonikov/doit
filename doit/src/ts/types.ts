export interface User {
    username: string;
    firstname: string;
    lastname: string;
    calendars: { id: string }[];
}