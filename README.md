# sdv503-a3-hut-booking
Assignment 3 Project

# Installation Requirement

You will need a [Node.js](https://nodejs.org/en/download) installation
You need typescript installed using the command
> npm install -g typescript

# Installation

Compile index.ts using the command
> npx tsc src/index.ts

You can run the script using
> node src/index.js

# Data Information

## Booking information

stored as an array in stored_bookings.json and waitlist.json

>{
>  "id": number,
>  "tramperName": number,
>  "hut": {
>    "id": number,
>    "name": string,
>    "location": string,
>    "capacity": number
>  },
>  "arrivalDate": Date as ISO 8601
>  "nights": number,
>  "partySize": number,
>  "cancelled": boolean
>}
