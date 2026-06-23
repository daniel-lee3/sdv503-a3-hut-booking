export interface ValidationArgs {
    isNumber?: boolean;
    isDate?: boolean;
    isBoolean?: boolean;
    futureOnly?: boolean;
    defaultValue?: any;
    minNum?: number;
    maxNum?: number;
}
export declare function validateInput(input: string, additionalArgs: ValidationArgs): {
    success: boolean;
    result: any;
};
//# sourceMappingURL=validation.d.ts.map