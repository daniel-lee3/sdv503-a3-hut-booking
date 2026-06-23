import readline = require("node:readline/promises");
import process = require("node:process");
import nodeUtil = require("node:util");
import fs = require("node:fs/promises");

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
    partySize: number,
    cancelled: boolean
}

interface ValidationArgs {
    isNumber?: boolean,
    isDate?: boolean,
    isBoolean?: boolean,
    futureOnly?: boolean,
    defaultValue?: any,
    minNum?: number,
    maxNum?: number
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function validateInput(input: string, additionalArgs: ValidationArgs) {
    // string validation and default values
    if (input === "") {
        if (additionalArgs.defaultValue === undefined) {
            return {
                success: false,
                result: undefined
            }
        }
        return {
            success: true,
            result: additionalArgs.defaultValue
        }
    }
    // Number validation
    if (additionalArgs.isNumber) {
        const numberInput = Number(input);
        if (isNaN(numberInput)) {
            return {
                success: false,
                result: undefined
            }
        } else {
            if (numberInput < (additionalArgs.minNum || -Infinity) || numberInput > (additionalArgs.maxNum || Infinity)) {
                return {
                    success: false,
                    result: undefined
                }
            }
            return {
                success: true,
                result: numberInput
            }
        }
    }
    // Date validation
    if (additionalArgs.isDate) {
        const dayInput = input.split("/").reverse().join("-");
        const date = new Date(dayInput);
        if (isNaN(date.getTime())) {
            return {
                success: false,
                result: undefined
            };
        } else {
            if (additionalArgs.futureOnly) {
                if (date.getTime() > Date.now()) {
                    return {
                        success: true,
                        result: date
                    };
                } else {
                    return {
                        success: false,
                        result: undefined
                    };
                }
            }
            return {
                success: true,
                result: date
            };
        }
    }
    // Boolean validation
    if (additionalArgs.isBoolean) {
        const yesRegex = /^(yes|y|yeah|ok|true)$/i;
        const noRegex = /^(no|n|nope|nah|false)$/i;
        if (yesRegex.test(input)) {
            return {
                success: true,
                result: true
            }
        } else if (noRegex.test(input)) {
            return {
                success: true,
                result: false
            }
        }
        return {
            success: false,
            result: undefined
        }
    }
    // Input is a string, send the user input
    return {
        success: true,
        result: input
    };
}

async function askQuestion(question: string, errorMessage: string, additionalArgs: ValidationArgs = {isNumber: false, isDate: false, defaultValue: undefined, minNum: 0, maxNum: 100, futureOnly: false}): Promise<any> {
    let validatedInput: any = undefined;

    while (true) {
        const userInput: string = (await rl.question(question)).trim();
        validatedInput = validateInput(userInput, additionalArgs);

        if (validatedInput.success) {
            return validatedInput.result;
        } else {
            console.log(errorMessage);
            continue;
        }
    }
}

function getHutFromId(hutId: number): Hut|null {
    for (const hut of huts) {
        if (hut.id === hutId) {
            return hut
        }
    }
    return null;
}

function getBookingFromId(bookings: Array<Booking>, bookingId: number): Booking|undefined {
    for (const booking of bookings) {
        if (booking.id === bookingId) {
            return booking;
        }
    }
}

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

function checkConflict(bookings: Array<Booking>, startDay: Date, stayLength: number, partySize: number, hutId: number): boolean {
    const hut: Hut|null = getHutFromId(hutId);
    if (hut === null) {
        return true;
    }

    const endDay: Date = new Date(startDay.getTime() + (stayLength * 86400000));
    for (let i: number = startDay.getTime(); i < endDay.getTime(); i = i + 86400000) {
        const occupied = getOccupiedSpaces(bookings, hutId, new Date(i))
        if (hut.capacity < occupied + partySize) {
            return true;
        }
    }
    return false;
}

function bookingToString(booking: Booking): string {
    const heading: string = `${`=`.repeat(10)} Booking #${booking.id} ${`=`.repeat(10)}`
    const lines = []
    if (booking.cancelled) {
        lines.push("CANCELLED")
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

const huts: Array<Hut> = [
    {
        id: 1,
        name: "Mintaro Hut",
        location: "Milford Track",
        capacity: 40
    }
];

const bookingsFileName: string = "stored_bookings.json";
const waitlistFileName: string = "waitlist.json";

async function updateBookings(fileName: string, bookings: Array<Booking>): Promise<void> {
    try {
        await fs.writeFile(fileName, JSON.stringify(bookings, null, 2), "utf8");
        console.log("Successfully saved!");
    } catch (error) {
        console.log("Something went wrong when trying to save.");
    }
    
}

async function getStoredBookings(fileName: string): Promise<Array<Booking>> {
    const bookingsArray: Array<Booking> = []
    await fs.readFile(fileName, "utf8").then((value) => {
        const storedJson: Array<{id: number, tramperName: string, hut: Hut, arrivalDate: Date, nights: number, partySize: number, cancelled: boolean}> = JSON.parse(value);
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
        return bookingsArray;
    }).catch((error) => {
        if (error.code === "ENOENT") {
            fs.writeFile(fileName, "[]", { flag: 'wx' });
            return [];
        }
        console.log(`Something went wrong while trying to load booking information: ${error}`)
        process.exit();
    })
    return bookingsArray;
}

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
            case 1:
                const tramperName: string = await askQuestion("What is the name of the tramper? ", "You must enter in a name that isn't blank");
                const hutId: number = await askQuestion("What hut is the tramper requesting? Hut ", "Please enter a valid hut", {isNumber: true, minNum: 1, maxNum: huts.length});
                const hut: Hut|null = getHutFromId(hutId)
                if (hut === null) {
                    console.log(`Hut ${hutId} is an invalid id`);
                    break;
                }
                const partySize: number = await askQuestion("What is the size of the party? (leave blank if only 1) ", "Please enter a valid number", {isNumber: true, minNum: 1, defaultValue: 1});
                const arrivalDate: Date = await askQuestion("What day is the tramper arriving? (DD/MM/YYYY) ", "Please enter a valid future day following the format", {isDate: true, futureOnly: true});
                const stayLength: number = await askQuestion("How many days will you be staying? ", "You must enter in a valid number of 1 or above", {isNumber: true, minNum: 1});
                const conflict: boolean = checkConflict(bookings, arrivalDate, stayLength, partySize, hutId);
                if (conflict) {
                    console.log(`There is not enough capacity for Hut ${hutId} across those days.`);
                    break;
                }
                const booking: Booking = {
                    id: bookings.length + 1,
                    tramperName: tramperName,
                    hut: hut,
                    arrivalDate: arrivalDate,
                    nights: stayLength,
                    partySize: partySize,
                    cancelled: false
                };
                bookings.push(booking);
                await updateBookings(bookingsFileName, bookings);
                console.log(`\n${bookingToString(booking)}\n`);
                break;
            case 2:
                const day: null|Date = await askQuestion("What day would you like to view bookings for? (leave blank for all bookings) (DD/MM/YYY) ", "Please enter in a valid date", {isDate: true, futureOnly: false, defaultValue: null});
                const viewingHutId: number = await askQuestion("What Hut ID would you like to view bookings for? (leave blank for all huts)", "Please enter a valid hut Id", {isNumber: true, minNum: 1, maxNum: huts.length, defaultValue: -1});
                const bookingsInHut: Array<Booking> = bookings.filter((bookingInfo) => {
                    if (viewingHutId === -1) {
                        return true;
                    }
                    if (getHutFromId(viewingHutId) === bookingInfo.hut) {
                        return true;
                    }
                    return false;
                })
                if (day === null) {
                    bookingsInHut.forEach(element => {
                        console.log(`\n${bookingToString(element)}\n`);
                    });
                    break;
                } else {
                    const availableBookings: Array<Booking> = bookingsInHut.filter((bookingInfo) => {
                        const startDay: Date = bookingInfo.arrivalDate;
                        const endDay: Date = new Date(startDay.getTime() + (bookingInfo.nights * 86400000));
                        return startDay <= day && endDay > day;
                    })
                    availableBookings.forEach(element => {
                        console.log(`\n${bookingToString(element)}\n`);
                    });
                    break;
                }
            case 3:
                while (true) {
                    const bookingId: number = await askQuestion("What booking would you like to cancel? Booking #", "Please enter a valid booking Id", {isNumber: true, minNum: 1, maxNum: bookings.length});
                    const booking: Booking|undefined = getBookingFromId(bookings, bookingId);
                    if (booking === undefined) {
                        continue;
                    }
                    if (booking.arrivalDate < new Date(Date.now())) {
                        console.log("It is too late to cancel this booking");
                        break;
                    }
                    booking.cancelled = true;
                    // Is there a booking in the waitlist
                    while (waitlist[0] !== undefined) {
                        if (!checkConflict(bookings, waitlist[0].arrivalDate, waitlist[0].nights, waitlist[0].partySize, waitlist[0].hut.id)) {
                            const newBooking: Booking = waitlist.shift()!
                            bookings.push(newBooking);
                        } else {
                            break;
                        }
                    }
                    await updateBookings(bookingsFileName, bookings);
                    break;
                }
                break;
            case 4:
                exit = true;
                break;
            default:
                console.log("Please provide an input of 1, 2, 3 or 4");
                break;
        }
    }
}

async function start() {
    const bookings: Array<Booking> = await getStoredBookings(bookingsFileName);
    const waitlist: Array<Booking> = await getStoredBookings(waitlistFileName);
    await main(bookings, waitlist);
    rl.close();
}

start();