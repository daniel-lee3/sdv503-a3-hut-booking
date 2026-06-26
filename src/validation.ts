// Data structure for Validation, (Primarily for DX)
export interface ValidationArgs {
    isNumber?: boolean,
    isDate?: boolean,
    isBoolean?: boolean,
    futureOnly?: boolean,
    defaultValue?: any,
    minNum?: number,
    maxNum?: number
}

// Main function for all input validation
export function validateInput(input: string, additionalArgs: ValidationArgs) {
    // string validation and default values
    if (input === "") {
        if (additionalArgs.defaultValue === undefined) {
            // Returns failure if input was blank with no defaultValue
            return {
                success: false,
                result: undefined
            }
        }
        // Returns success with the defaultValue if input was blank
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
            // Is number outside the range
            if (numberInput < (additionalArgs.minNum || -Infinity) || numberInput > (additionalArgs.maxNum || Infinity)) {
                return {
                    success: false,
                    result: undefined
                }
            }
            // Is number a decimal
            if (numberInput % 1 !== 0) {
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
        // Turns human-readable date format (DD/MM/YYYY) into YYYY-MM-DD so it is understood by JS Date constructor
        const dayInput = input.split("/").reverse().join("-");
        const date = new Date(dayInput);
        // Returns failure if date given was in an invalid format
        if (isNaN(date.getTime())) {
            return {
                success: false,
                result: undefined
            };
        } else {
            // Checks if validation asks for ONLY future dates
            if (additionalArgs.futureOnly) {
                // Returns success if date given was in the future
                if (date.getTime() > Date.now()) {
                    return {
                        success: true,
                        result: date
                    };
                } else {
                    // Returns failure if date given was in the past
                    return {
                        success: false,
                        result: undefined
                    };
                }
            }
            // Returns success if user input was a valid date
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
        // Checks for input of yes
        if (yesRegex.test(input)) {
            return {
                success: true,
                result: true
            }
        // Checks for input of no
        } else if (noRegex.test(input)) {
            return {
                success: true,
                result: false
            }
        }
        // User did not enter in a response of yes or no
        return {
            success: false,
            result: undefined
        }
    }
    // Input is a string, validate string
    const stringRegex = /^[a-zA-Z\s]+$/
    if (stringRegex.test(input)) {
        return {
            success: true,
            result: input
        };
    } else {
        return {
            success: false,
            result: undefined
        }
    }
}