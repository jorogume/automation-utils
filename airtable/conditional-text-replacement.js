// Conditional Text Replacement Script
// Returns different text based on whether a search term is found in the input text
// Common use case: Handle "Other" option in dropdown fields with custom text input

// Input Configuration:
let searchTerm = inputConfig.searchTerm;        // Text to search for (e.g., "Other")
let textToSearch = inputConfig.textToSearch;    // Text where we'll search (e.g., selected option)
let textIfFound = inputConfig.textIfFound;      // Text to return if found (e.g., custom text field)
let textIfNotFound = inputConfig.textIfNotFound; // Text to return if not found (e.g., original selection)

// Perform search and return appropriate text
let result = textToSearch.includes(searchTerm) ? textIfFound : textIfNotFound;

// Output
output.set('result', result);
