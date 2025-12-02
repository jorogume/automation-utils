/*
 * ======================================================================================
 * SCRIPT: Dynamic "Coalesce" / Find First Non-Empty Value
 * ======================================================================================
 * * SYNOPSIS:
 * This script accepts any number of input variables from the Airtable Automation 
 * configuration, prioritizes them based on their variable name, and outputs the 
 * value of the first one that is not empty.
 * * WHEN TO USE:
 * Use this when you need to populate a field but the data might come from 
 * multiple potential sources with a specific priority order.
 * * Example: You need a "Contact Email".
 * - Priority 1: "Personal Email" (if exists)
 * - Priority 2: "Work Email" (if Personal is blank)
 * - Priority 3: "Generic Info Email" (fallback)
 * * HOW IT WORKS (NO-CODE UPDATES):
 * You do NOT need to edit this code to add more inputs.
 * 1. In the Automation sidebar (left), add input variables.
 * 2. Name them using a numbering convention to set priority:
 * - input01
 * - input02
 * - input03
 * 3. The script automatically detects all inputs, sorts them by name, 
 * and checks them in order.
 * * OUTPUTS:
 * - "First": The single resulting value (or empty string).
 * - "Raw": A CSV string of all inputs (useful for debugging logs).
 * - "Success": "yes" if the script ran without crashing.
 * - "Errors": Any error messages generated.
 * ======================================================================================
 */

let errors = [];
let firstNonEmpty = "";
let rawValues = [];
let inputs = [];

try {
    // 1. DYNAMIC CONFIGURATION
    // We do not hardcode inputs (e.g., input.config().input1).
    // Instead, we grab the entire config object to allow the user 
    // to add 'input04', 'input05' in the UI without touching code.
    const config = input.config();
    
    // 2. SORT KEYS NATURALLY
    // We sort keys to ensure 'input02' is processed after 'input01'.
    // We use numeric sensitivity so 'input10' comes after 'input2'.
    const sortedKeys = Object.keys(config).sort((a, b) => 
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

    // 3. MAP VALUES
    inputs = sortedKeys.map(key => config[key]);

} catch (e) {
    errors.push(`Configuration Error: ${e.message}`);
}

/**
 * Normalizes input to a string value
 * Handles strings, arrays (lookup/rollup), nulls
 */
function normalize(value) {
    try {
        if (value === null || value === undefined) {
            return "";
        }
        if (Array.isArray(value)) {
            return value.length > 0 ? String(value[0]).trim() : "";
        }
        return String(value).trim();
    } catch (e) {
        errors.push(`Normalization error: ${e.message}`);
        return "";
    }
}

// ============================================================
// PROCESS INPUTS
// ============================================================

for (let i = 0; i < inputs.length; i++) {
    try {
        const normalized = normalize(inputs[i]);
        rawValues.push(normalized);
        
        // Grab the first value we find and lock it in
        if (!firstNonEmpty && normalized !== "") {
            firstNonEmpty = normalized;
        }
    } catch (e) {
        errors.push(`Error processing input index ${i}: ${e.message}`);
        rawValues.push("");
    }
}

// ============================================================
// OUTPUTS
// ============================================================

// 1. First: The winner (first non-empty value)
output.set("First", firstNonEmpty);

// 2. Raw: A safe CSV string for debugging
// We escape double quotes to avoid breaking the CSV format
const csvString = rawValues.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
output.set("Raw", csvString);

// 3. Success: "yes" if the script finished without crashing.
// You can use this in the next automation step condition.
output.set("Success", "yes");

// 4. Errors: Any distinct errors caught during processing
output.set("Errors", errors.join("; "));








