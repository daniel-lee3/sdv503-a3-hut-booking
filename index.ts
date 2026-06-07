interface Hut {
    name: string,
    location: string,
    capacity: number;
}

interface Booking {
    tramperName: string,
    hut: Hut,
    arrivalDay: Date,
    nights: number,
    partySize: number
}