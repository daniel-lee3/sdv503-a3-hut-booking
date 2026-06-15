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
    
    // Date validation
    if (isDate) {
        const dayInput = input.split("-").reverse().join("-");
        const date = new Date(dayInput);
        if (isNaN(date.getTime())) {
            return {
                success: false,
                result: undefined
            }
        } else {
            return {
                success: true,
                result: date
            }
        }
    }
    // Input is a string, send the user input
    return input
}

async function askQuestion(question: string, errorMessage: string, isNumber: boolean = false, isDate: boolean = false, defaultValue?: any) {
    let validatedInput: any = undefined;

    while (true) {
        const userInput: string = (await rl.question(question)).trim();
        validatedInput = await validateInput(userInput, isNumber, isDate, defaultValue);

        if (validatedInput.success) {
            return validatedInput.result;
        } else {
            console.log(errorMessage);
            continue;
        }
    }
}

const bookings: Array<Booking> = [];