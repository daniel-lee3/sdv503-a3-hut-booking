import readline = require("node:readline/promises");
import process = require("node:process");
import nodeUtil = require("node:util");
import validation = require("./validation.js");
import fileManager = require("./file_management.js");

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

// Readline interface for console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Main function for asking users questions
async function askQuestion(question: string, errorMessage: string, additionalArgs: validation.ValidationArgs = {isNumber: false, isDate: false, defaultValue: undefined, minNum: 0, maxNum: 100, futureOnly: false}): Promise<any> {
    let validatedInput: any = undefined;

    // Loop to repeatedly ask user question until response is valid
    while (true) {
        const userInput: string = (await rl.question(question)).trim();
        // Validates user input using validateInput function
        validatedInput = validation.validateInput(userInput, additionalArgs);

        // Returns the result if successful
        if (validatedInput.success) {
            return validatedInput.result;
        // If input was invalid, display error and ask again
        } else {
            console.log(errorMessage);
            continue;
        }
    }
}

// Finds a Hut object from the Id
function getHutFromId(hutId: number): Hut|null {
    for (const hut of huts) {
        if (hut.id === hutId) {
            return hut
        }
    }
    return null;
}

// Finds a Booking object from the Id
function getBookingFromId(bookings: Array<Booking>, bookingId: number): Booking|undefined {
    for (const booking of bookings) {
        if (booking.id === bookingId) {
            return booking;
        }
    }
}

// Finds how many spaces are occupied in a hut on a given day
function getOccupiedSpaces(bookings: Array<Booking>, hutId: number, day: Date): number {
    const effectiveBookings : Array<Booking> = bookings.filter((booking: Booking) => {
        if (booking.cancelled) {
            return false;
        }
        const arrival: number = booking.arrivalDate.getTime()
        const checkout: number = arrival + (booking.nights * 86400000)
        return booking.hut.id === hutId && arrival <= day.getTime() && checkout > day.getTime()
    })
    return effectiveBookings.reduce((total, booking) => total + booking.partySize, 0);
}

// Checks if booking information conflicts with current bookings
function checkConflict(bookings: Array<Booking>, startDay: Date, stayLength: number, partySize: number, hutId: number): boolean {
    const hut: Hut|null = getHutFromId(hutId);
    if (hut === null) {
        return true;
    }

    const endDay: Date = new Date(startDay.getTime() + (stayLength * 86400000));
    // Iterates through each day to check for conflict on any day the booking will be active
    for (let i: number = startDay.getTime(); i < endDay.getTime(); i = i + 86400000) {
        const occupied = getOccupiedSpaces(bookings, hutId, new Date(i))
        // Returns true if a conflict was found on a given day
        if (hut.capacity < occupied + partySize) {
            return true;
        }
    }
    return false;
}

// Function that takes a booking and turns it into a readable string that is formatted and sectioned
function bookingToString(booking: Booking): string {
    const heading: string = `${`=`.repeat(10)} Booking #${booking.id} ${`=`.repeat(10)}`;
    const lines = [];
    if (booking.cancelled) {
        lines.push("CANCELLED");
    }
    lines.push(`${heading}`);
    lines.push(`Tramper: ${booking.tramperName}`);
    lines.push(`Hut #${booking.hut.id}`);
    lines.push(`=`.repeat(heading.length));
    lines.push(`Arrival date: ${booking.arrivalDate.toDateString()}`);
    lines.push(`Time of stay: ${booking.nights} days`);
    lines.push(`Party size: ${booking.partySize}`);
    lines.push(`=`.repeat(heading.length));

    return lines.join("\n");
}

// Function that takes a hut and turns it into a readable string that is formatted and sectioned
function hutToString(hut: Hut): string {
    const heading: string = `${'='.repeat(10)} Hut #${hut.id} ${'='.repeat(10)}`;
    const lines = [];
    lines.push(`${heading}`);
    lines.push(`Name: ${hut.name}`);
    lines.push(`Location: ${hut.location}`);
    lines.push(`Capacity: ${hut.capacity}`);
    lines.push('='.repeat(heading.length));

    return lines.join("\n");
}

// List of huts in the system
const huts: Array<Hut> = [
    {
        id: 1,
        name: "Mintaro Hut",
        location: "Milford Track",
        capacity: 40
    },
    {
        id: 2,
        name: "Dumpling Hut",
        location: "Milford Track",
        capacity: 40
    },
    {
        id: 3,
        name: "Clinton Hut",
        location: "Milford Track",
        capacity: 40
    },
    {
        id: 4,
        name: "Worsley Hut",
        location: "Western Fiordland",
        capacity: 12
    }
];

// File names for saved data
const bookingsFileName: string = "stored_bookings.json";
const waitlistFileName: string = "waitlist.json";

// Main function for program
async function main(bookings: Array<Booking>, waitlist: Array<Booking>) {
    let exit = false;
    while (!exit) {
        const task: number = await askQuestion(`What would you like to do?
    1. Add new booking
    2. View bookings
    3. Cancel booking
    4. Quit
`, "Please provide an input of 1, 2, 3 or 4", {isNumber: true, minNum: 1, maxNum: 4});
        
        switch(task) {
            // User requests to add a new booking
            case 1:
                // Asks all the questions
                const tramperName: string = await askQuestion("What is the name of the tramper? ", "Input must not be blank or contain special characters");
                huts.forEach((hutObject) => {
                    console.log(hutToString(hutObject));
                })
                const hutId: number = await askQuestion("What hut are you requesting? Hut #", "Please enter a valid hut id", {isNumber: true, minNum: 1, maxNum: huts.length});
                const hut: Hut|null = getHutFromId(hutId);
                // Fail-safe in the case something goes wrong
                if (hut === null) {
                    console.log(`Hut ${hutId} is an invalid id`);
                    break;
                }
                const partySize: number = await askQuestion("What is the size of the party? (leave blank for 1) ", "Please enter a valid whole number", {isNumber: true, minNum: 1, defaultValue: 1});
                const arrivalDate: Date = await askQuestion("What day is the tramper arriving? (DD/MM/YYYY) ", "Please enter a valid future day following the format", {isDate: true, futureOnly: true});
                const stayLength: number = await askQuestion("How many days will you be staying? ", "You must enter in a valid number of 1 or above", {isNumber: true, minNum: 1});
                const conflict: boolean = checkConflict(bookings, arrivalDate, stayLength, partySize, hutId);
                // Constructs Booking with provided information
                const booking: Booking = {
                    id: bookings.length + 1,
                    tramperName: tramperName,
                    hut: hut,
                    arrivalDate: arrivalDate,
                    nights: stayLength,
                    partySize: partySize,
                    cancelled: false
                };
                // Prompt user to add to waitlist if there is conflict with booking
                if (conflict) {
                    console.log(`There is not enough capacity for Hut ${hutId} across those days.`);
                    const addWaitlist: boolean = await askQuestion("Would you like to add the booking to a waitlist instead? ", "Please enter either yes or no", {isBoolean: true});
                    // Adds booking to the waitlist if prompted yes
                    if (addWaitlist === true) {
                        waitlist.push(booking);
                        await fileManager.updateBookings(waitlistFileName, waitlist);
                        console.log(`\n${bookingToString(booking)}\n`);
                    }
                    // Early break to avoid pushing into active bookings
                    break;
                }
                // Adds booking to stored bookings
                bookings.push(booking);
                await fileManager.updateBookings(bookingsFileName, bookings);
                console.log(`\n${bookingToString(booking)}\n`);
                break;
            // User requests to view booking information
            case 2:
                const day: null|Date = await askQuestion("What day would you like to view bookings for? (leave blank for all bookings) (DD/MM/YYY) ", "Please enter in a valid date", {isDate: true, futureOnly: false, defaultValue: null});
                huts.forEach((hutObject) => {
                    console.log(hutToString(hutObject));
                })
                const viewingHutId: number = await askQuestion("What Hut ID would you like to view bookings for? (leave blank for all huts)", "Please enter a valid hut Id", {isNumber: true, minNum: 1, maxNum: huts.length, defaultValue: -1});
                const viewingHut: Hut|null = getHutFromId(viewingHutId);
                // Fail-safe in the case something goes wrong
                if (viewingHut === null) {
                    console.log(`Hut ${viewingHutId} is an invalid id`);
                    break;
                }
                const bookingsInHut: Array<Booking> = bookings.filter((bookingInfo) => {
                    // Skips validation if user requests to view all huts
                    if (viewingHutId === -1) {
                        return true;
                    }
                    // Filters bookings by the hutId
                    if (viewingHut.id === bookingInfo.hut.id) {
                        return true;
                    }
                    return false;
                })
                if (day === null) {
                    // Skips validation if user requests to view all days, displays each booking
                    bookingsInHut.forEach(element => {
                        console.log(`\n${bookingToString(element)}\n`);
                    });
                    break;
                } else {
                    // Filters bookings by activity on given day
                    const availableBookings: Array<Booking> = bookingsInHut.filter((bookingInfo) => {
                        const startDay: Date = bookingInfo.arrivalDate;
                        const endDay: Date = new Date(startDay.getTime() + (bookingInfo.nights * 86400000));
                        return startDay <= day && endDay > day;
                    })
                    // Displays each booking that passes validation
                    availableBookings.forEach(element => {
                        console.log(`\n${bookingToString(element)}\n`);
                    });
                    break;
                }
            // User requests to cancel a booking
            case 3:
                while (true) {
                    const bookingId: number = await askQuestion("What booking would you like to cancel? (Leave blank to abort) Booking #", "Please enter a valid booking Id", {isNumber: true, minNum: 1, maxNum: bookings.length, defaultValue: -1});
                    const booking: Booking|undefined = getBookingFromId(bookings, bookingId);
                    if (booking === undefined) {
                        // Abort if user left input blank
                        if (bookingId === -1) {
                            break;
                        }
                        continue;
                    }
                    // Decline cancellation if booking is active or has already happened
                    if (booking.arrivalDate < new Date(Date.now())) {
                        console.log("It is too late to cancel this booking");
                        break;
                    }
                    booking.cancelled = true;
                    // Is there a booking in the waitlist
                    while (waitlist[0] !== undefined) {
                        // Checks if the waiting booking can fit into the hut
                        if (!checkConflict(bookings, waitlist[0].arrivalDate, waitlist[0].nights, waitlist[0].partySize, waitlist[0].hut.id)) {
                            // Moves first booking in the waitlist into the active bookings
                            const newBooking: Booking = waitlist.shift()!
                            bookings.push(newBooking);
                        } else {
                            break;
                        }
                    }
                    // Update stored bookings
                    await fileManager.updateBookings(bookingsFileName, bookings);
                    break;
                }
                break;
            // User requests to exit the program
            case 4:
                exit = true;
                break;
            // User inputs an invalid option
            default:
                console.log("Please provide an input of 1, 2, 3 or 4");
                break;
        }
    }
}

// Stores saved information in memory and then starts the main program, closes interface once completed
async function start() {
    const bookings: Array<Booking> = await fileManager.getStoredBookings(bookingsFileName);
    const waitlist: Array<Booking> = await fileManager.getStoredBookings(waitlistFileName);
    await main(bookings, waitlist);
    rl.close();
}

start();