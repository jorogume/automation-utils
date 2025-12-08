/********************************************************************
 * AIRTABLE CURRENCY FORMATTER
 * ===========================
 * 
 * Formats a numeric value as a currency string (e.g., 1234.5 → "1,234.50")
 * using Canadian English locale formatting (en-CA).
 * 
 * USE CASE:
 * ---------
 * Use in Airtable Automations when you need to display currency values
 * in documents, emails, or other outputs that require formatted strings
 * instead of raw numbers.
 * 
 * INPUTS:
 * -------
 * | Name       | Type             | Required | Description                          |
 * |------------|------------------|----------|--------------------------------------|
 * | amount     | Number/String    | Yes      | The value to format. Handles numbers,|
 * |            |                  |          | strings, and single-item lookup arrays|
 * | outputName | String           | No       | Custom name for the output variable. |
 * |            |                  |          | Defaults to "formattedValue"         |
 * 
 * OUTPUTS:
 * --------
 * | Name             | Type   | Description                              |
 * |------------------|--------|------------------------------------------|
 * | [outputName]     | String | Formatted currency string (e.g. "1,234.50")|
 * |                  |        | or empty string if input is invalid      |
 * 
 * EXAMPLES:
 * ---------
 * Input:  amount = 1234.5,   outputName = "totalPrice"
 * Output: totalPrice = "1,234.50"
 * 
 * Input:  amount = ["99.99"], outputName = "itemCost"  
 * Output: itemCost = "99.99"
 * 
 * Input:  amount = null
 * Output: formattedValue = ""
 * 
 ********************************************************************/



/********************************************************************
 * CONFIGURATION
 ********************************************************************/
const CONFIG = {
    inputKeys: {
        amount: "amount",         // Name of the script input variable for Amount
        outputName: "outputName"  // Name of the output variable (dynamic)
    }
};

/********************************************************************
 * INPUT LOADING
 ********************************************************************/
const inputConfig = input.config();
const rawAmount = inputConfig[CONFIG.inputKeys.amount];
const outputName = inputConfig[CONFIG.inputKeys.outputName] || "formattedValue"; // Fallback default

/********************************************************************
 * HELPER: Normalize amount input
 * Handles:
 *  - Numbers
 *  - Strings
 *  - Single item arrays from lookups, like ["123.45"]
 *  - Empty values (null, undefined, [], [""])
 ********************************************************************/
function normalizeAmount(value) {
    // Handle arrays like ["123.45"] or [123.45]
    if (Array.isArray(value)) {
        if (value.length === 0) return null; // Empty lookup
        // Take the first non-null item, if any
        const firstNonNull = value.find(v => v !== null && v !== undefined);
        if (firstNonNull === undefined) return null;
        return normalizeAmount(firstNonNull); // Reuse same logic
    }

    // Null or undefined means "no value"
    if (value === null || value === undefined) {
        return null;
    }

    // Strings: trim and parse
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "") return null;
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? null : parsed;
    }

    // Numbers: use as is
    if (typeof value === "number") {
        return value;
    }

    // Any other type is not supported, treat as no value
    return null;
}

/********************************************************************
 * HELPER: Currency Formatter
 ********************************************************************/
const currencyFormatter = new Intl.NumberFormat("en-CA", { 
    style: "decimal", 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
});

/********************************************************************
 * MAIN LOGIC
 ********************************************************************/
const amount = normalizeAmount(rawAmount);

let formattedValue;

// If no usable number, return empty string so it is easy to handle in later steps
if (amount === null) {
    formattedValue = "";
} else {
    formattedValue = currencyFormatter.format(amount);
}

/********************************************************************
 * OUTPUT
 ********************************************************************/
output.set(outputName, formattedValue);
