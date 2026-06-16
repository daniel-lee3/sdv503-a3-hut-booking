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

interface ValidationArgs {
    isNumber?: boolean,
    isDate?: boolean,
    defaultValue?: any,
    minNum?: number,
    maxNum?: number
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function validateInput(input: string, additionalArgs: ValidationArgs) {
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
        const dayInput = input.split("-").reverse().join("-");
        const date = new Date(dayInput);
        if (isNaN(date.getTime())) {
            return {
                success: false,
                result: undefined
            };
        } else {
            return {
                success: true,
                result: date
            };
        }
    }
    // Input is a string, send the user input
    return {
        success: true,
        result: input
    };
}

async function askQuestion(question: string, errorMessage: string, additionalArgs: ValidationArgs = {isNumber: false, isDate: false, defaultValue: undefined, minNum: 0, maxNum: 100}): Promise<any> {
    let validatedInput: any = undefined;

    while (true) {
        const userInput: string = (await rl.question(question)).trim();
        validatedInput = await validateInput(userInput, additionalArgs);

        if (validatedInput.success) {
            return validatedInput.result;
        } else {
            console.log(errorMessage);
            continue;
        }
    }
}

const bookings: Array<Booking> = [];

async function main() {
    let exit = false;
    while (!exit) {
        const task: number = await askQuestion(`What would you like to do?
        1. Add new booking
        2. View bookings
        3. Quit
    `, "Please provide an input of 1, 2 or 3", {isNumber: true, minNum: 1, maxNum: 3});
        
        switch(task) {
            case 1:
                const tramperName = await askQuestion("What is the name of the tramper? ", "You must enter in a name that isn't blank");
                break;
            case 2:
                break;
            case 3:
                exit = true;
                break;
            default:
                console.log("Please provide an input of 1, 2 or 3");
                break;
        }
    }
}

main().then(() => {
    rl.close()
})