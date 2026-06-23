import fs = require("node:fs/promises");

// Data structure for Hut
interface Hut {
    id: number,
    name: string,
    location: string,
    capacity: number;
}

// Data structure for Bookings
interface Booking {
    id: number,
    tramperName: string,
    hut: Hut,
    arrivalDate: Date,
    nights: number,
    partySize: number,
    cancelled: boolean
}

// Changes a files contents to the given information
export async function updateBookings(fileName: string, bookings: Array<Booking>): Promise<void> {
    try {
        await fs.writeFile(fileName, JSON.stringify(bookings, null, 2), "utf8");
        console.log("Successfully saved!");
    } catch (error) {
        console.log("Something went wrong when trying to save.");
    }
    
}

// Gets information from the contents of a file
export async function getStoredBookings(fileName: string): Promise<Array<Booking>> {
    const bookingsArray: Array<Booking> = []
    await fs.readFile(fileName, "utf8").then((value) => {
        const storedJson: Array<{id: number, tramperName: string, hut: Hut, arrivalDate: Date, nights: number, partySize: number, cancelled: boolean}> = JSON.parse(value);
        // Iterates through information and constructs a Booking object
        storedJson.forEach(element => {
            const booking: Booking = {
                id: element.id,
                tramperName: element.tramperName,
                hut: element.hut,
                arrivalDate: new Date(element.arrivalDate),
                nights: element.nights,
                partySize: element.partySize,
                cancelled: element.cancelled
            }
            bookingsArray.push(booking);
        });
        // Returns the stored information in proper construct
        return bookingsArray;
    }).catch((error) => {
        // Creates file if it does not exist
        if (error.code === "ENOENT") {
            fs.writeFile(fileName, "[]", { flag: 'wx' });
            return [];
        }
        console.log(`Something went wrong while trying to load booking information: ${error}`)
        process.exit();
    })
    return bookingsArray;
}