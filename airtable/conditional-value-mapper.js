Voy a agregar este script a mi biblioteca de scripts para airtable en GitHub:
“””/**

- Conditional Value Mapper for Airtable Automations
- 
- Returns a specified value if input matches the target value, otherwise returns default value.
- Handles both single strings and arrays with a single string element (common with lookup fields).
- Comparison is case-insensitive and trims whitespace.
- 
- @param {string|string[]} inputValue - The value to check (string or array with single string)
- @param {string} targetValue - The value to match against (e.g., “Yes”)
- @param {string} returnValue - The value to return if match is found (e.g., “HLOC”)
- @param {string} defaultValue - The value to return if no match (defaults to empty string)
- @returns {string} The return value if matched, otherwise default value
  */

// ==================== CONFIGURATION ====================

let inputValue = input.config(‘inputValue’);
let targetValue = input.config(‘targetValue’);
let returnValue = input.config(‘returnValue’);
let defaultValue = input.config(‘defaultValue’) || ‘’;

// ==================== HELPER FUNCTIONS ====================

/**

- Normalizes input to a single trimmed string value
- Handles both direct string values and arrays with single element
- 
- @param {string|string[]} value - Input value to normalize
- @returns {string|null} Normalized string or null if invalid
  */
  function normalizeInput(value) {
  if (Array.isArray(value)) {
  if (value.length === 0) {
  return null;
  }
  return String(value[0]).trim();
  }
  
  if (typeof value === ‘string’) {
  return value.trim();
  }
  
  if (value === null || value === undefined) {
  return null;
  }
  
  return String(value).trim();
  }

/**

- Compares two strings case-insensitively
- 
- @param {string|null} a - First string
- @param {string} b - Second string
- @returns {boolean} True if strings match (case-insensitive)
  */
  function caseInsensitiveMatch(a, b) {
  if (a === null || b === null) {
  return false;
  }
  return a.toLowerCase() === b.toLowerCase();
  }

// ==================== MAIN LOGIC ====================

const normalizedValue = normalizeInput(inputValue);
const normalizedTarget = targetValue?.trim() || ‘’;

const outputValue = caseInsensitiveMatch(normalizedValue, normalizedTarget)
? returnValue
: defaultValue;

output.set(‘mappedValue’, outputValue);”””
Siguiera un nombre y una descripción