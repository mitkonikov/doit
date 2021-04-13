export interface User {
    uid: string;
    calendars?: string[];
}

export interface Calendar {
    data: number[];
    name: string;
    start_date: firebase.default.firestore.Timestamp
}