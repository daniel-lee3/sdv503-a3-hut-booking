interface Hut {
    id: number;
    name: string;
    location: string;
    capacity: number;
}
interface Booking {
    id: number;
    tramperName: string;
    hut: Hut;
    arrivalDate: Date;
    nights: number;
    partySize: number;
    cancelled: boolean;
}
export declare function updateBookings(fileName: string, bookings: Array<Booking>): Promise<void>;
export declare function getStoredBookings(fileName: string): Promise<Array<Booking>>;
export {};
//# sourceMappingURL=file_management.d.ts.map