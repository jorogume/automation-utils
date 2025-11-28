// Define inputs
let inputConfig = input.config();

// Access input values
let searchTerm = inputConfig.searchTerm;
let textToSearch = inputConfig.textToSearch;
let textIfFound = inputConfig.textIfFound;
let textIfNotFound = inputConfig.textIfNotFound;

// Convert both to lowercase for case-insensitive comparison
let result = textToSearch.toLowerCase().includes(searchTerm.toLowerCase()) 
  ? textIfFound 
  : textIfNotFound;

// Output
output.set('result', result);
