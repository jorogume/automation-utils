/********************************************************************
 * Script: formatDateAndTimeForOutput.js
 *
 * WHAT IT DOES
 * - Receives a single input called "date" from an Airtable automation.
 * - Handles different input shapes:
 *      • Date object
 *      • String (ISO, Airtable style, etc.)
 *      • Number timestamp (ms since epoch)
 *      • Single item arrays from lookups, like ["2025-03-01T14:30:00.000Z"]
 *      • Empty values and empty arrays
 * - Normalizes the input into a JavaScript Date.
 * - Outputs four strings:
 *      • friendlyDate   -> example: "October 5, 2025"
 *      • usDate         -> example: "10/05/2025"
 *      • isoDate        -> example: "2025-10-05"
 *      • time           -> example: "14:30" (24 hour format, local time)
 * - When there is no usable date, all outputs are empty strings.
 *
 * WHEN IT IS USEFUL
 * - When you want to reuse a single date field in different formats
 *   for emails, PDFs, messages, or logs.
 * - When your date comes from lookup fields that sometimes return
 *   a single item array instead of a plain value.
 * - When you need a clean separation between date and time outputs.
 *
 * HOW TO USE IT IN AN AIRTABLE AUTOMATION
 * 1. Add a "Run a script" action.
 * 2. Add an input variable:
 *      • Name: date
 *      • Value: map it to your date or date-time field
 *        (can be a direct field or a lookup).
 * 3. Paste this script.
 * 4. The script will output:
 *      • friendlyDate
 *      • usDate
 *      • isoDate
 *      • time
 * 5. In later steps (email, update record, etc.) you can use:
 *      {{friendlyDate}}, {{usDate}}, {{isoDate}}, {{time}}.
 *
 * NOTES
 * - Time output is in 24 hour format based on the scripting
 *   environment local time.
 * - This script formats only one date value. If you have multiple,
 *   pass and handle them in separate script steps or extend this one.
 ********************************************************************/

/********************************************************************
 * CONFIGURATION
 ********************************************************************/
const CONFIG = {
    inputKeys: {
        date: "date"   // Name of the script input variable for the date
    }
};

/********************************************************************
 * INPUT LOADING
 ********************************************************************/
const inputConfig = input.config();
const rawDate = inputConfig[CONFIG.inputKeys.date];

/********************************************************************
 * HELPER: Normalize date input
 * Handles:
 *  - Date objects
 *  - Strings
 *  - Numbers (timestamp)
 *  - Single item arrays and empty arrays
 *  - Null and undefined
 ********************************************************************/
function normalizeDateInput(value) {
    // Arrays from lookups, like ["2025-03-01T14:30:00.000Z"]
    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        const firstNonNull = value.find(v => v !== null && v !== undefined);
        if (firstNonNull === undefined) return null;
        return normalizeDateInput(firstNonNull);
    }

    // Null or undefined
    if (value === null || value === undefined) {
        return null;
    }

    // Already a Date
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    // Timestamp number
    if (typeof value === "number") {
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }

    // String
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "") return null;
        const parsed = new Date(trimmed);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Any other type is unsupported
    return null;
}

/********************************************************************
 * MAIN LOGIC
 ********************************************************************/
const dateObj = normalizeDateInput(rawDate);

let friendlyDate = "";
let usDate = "";
let isoDate = "";
let time = "";

if (dateObj !== null) {
    // Friendly date, example: "October 5, 2025"
    const friendlyFormatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    friendlyDate = friendlyFormatter.format(dateObj);

    // Manual parts so we have full control
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    // US format: MM/DD/YYYY
    usDate = `${month}/${day}/${year}`;

    // ISO format: YYYY-MM-DD
    isoDate = `${year}-${month}-${day}`;

    // Time: 24 hour format HH:MM
    time = `${hours}:${minutes}`;
}

/********************************************************************
 * OUTPUT
 ********************************************************************/
output.set("friendlyDate", friendlyDate);
output.set("usDate", usDate);
output.set("isoDate", isoDate);
output.set("time", time);
