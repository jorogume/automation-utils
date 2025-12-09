/**
 * Text Search Mapper for Airtable Automations
 * 
 * Searches for a term within a text and returns a specified value based on whether
 * the term is found or not. Comparison is case-insensitive and trims whitespace.
 * Handles both single strings and arrays with a single string element (common with lookup fields).
 * 
 * @param {string|string[]} searchTerm - The term to search for
 * @param {string|string[]} textToSearch - The text to search within
 * @param {string} textIfFound - The value to return if term is found
 * @param {string} textIfNotFound - The value to return if term is not found
 * @returns {string} The appropriate text based on search result
 */

// ==================== CONFIGURATION ====================

// Get the entire configuration object first
const config = input.config();

// Access the properties from the config object
let searchTerm = config.searchTerm;
let textToSearch = config.textToSearch;
let textIfFound = config.textIfFound;
let textIfNotFound = config.textIfNotFound;

/**
 * Normalizes input to a single trimmed string value
 * Handles both direct string values and arrays with single element
 * 
 * @param {string|string[]} value - Input value to normalize
 * @returns {string|null} Normalized string or null if invalid
 */
function normalizeInput(value) {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return null;
        }
        return String(value[0]).trim();
    }
    
    if (typeof value === 'string') {
        return value.trim();
    }
    
    if (value === null || value === undefined) {
        return null;
    }
    
    return String(value).trim();
}

/**
 * Checks if a term exists within a text (case-insensitive)
 * 
 * @param {string|null} text - The text to search within
 * @param {string|null} term - The term to search for
 * @returns {boolean} True if term is found within text
 */
function containsTerm(text, term) {
    if (text === null || term === null) {
        return false;
    }
    return text.toLowerCase().includes(term.toLowerCase());
}

// ==================== MAIN LOGIC ====================

const normalizedText = normalizeInput(textToSearch);
const normalizedTerm = normalizeInput(searchTerm);

const result = containsTerm(normalizedText, normalizedTerm)
    ? textIfFound
    : textIfNotFound;

output.set('result', result);
