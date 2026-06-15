import readline = require("node:readline/promises");
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

async function validateInput(input: string, isNumber: boolean, isDate: boolean, defaultValue: any) {
    // string validation and default values
    if (input === "") {
        if (defaultValue === undefined) {
            return {
                success: false,
                result: undefined
            }
        }
        return {
            success: true,
            result: defaultValue
        }
    }
    // Number validation
    if (isNumber) {
        const numberInput = Number(input);
        if (isNaN(numberInput)) {
            return {
                success: false,
                result: undefined
            }
        } else {
            return {
                success: true,
                result: numberInput
            }
        }
    }
}

async function askQuestion(question: string, errorMessage: string, isNumber: boolean = false, isDate: boolean = false, defaultValue?: any) {
    let validInput = false;

    const userInput = (await rl.question(question)).trim();
    return userInput;
}

const bookings: Array<Booking> = [];