import readline = require("node:readline");
import process = require("node:process");

interface Hut {
    id: number,
    name: string,
    location: string,
    capacity: number;
}

interface Booking {
    id: number,
    tramperName: string,
    hut: Hut,
    arrivalDate: Date,
    nights: number,
    partySize: number
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const bookings: Array<Booking> = [];