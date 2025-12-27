# automation-utils

A collection of reusable JavaScript utilities for Airtable Automations. These scripts handle common automation tasks like data validation, formatting, conditional logic, and field mapping.

## Table of Contents

- [Overview](#overview)
- [Tools](#tools)
  - [Email Validation](#email-validation)
  - [Conditional Text Replacement](#conditional-text-replacement)
  - [Conditional Value Mapper](#conditional-value-mapper)
  - [Find First Non-Empty Value](#find-first-non-empty-value)
  - [Currency Formatter](#currency-formatter)
  - [Date and Time Formatter](#date-and-time-formatter)
  - [List Fields By Table ID](#list-fields-by-table-id)
  - [Generate Log Text From Field IDs](#generate-log-text-from-field-ids)
- [Usage](#usage)
- [Contributing](#contributing)

## Overview

This repository contains production-ready scripts designed for Airtable's "Run a script" automation action. Each script:

- Handles edge cases (null values, arrays, type coercion)
- Supports lookup field arrays (common in Airtable)
- Provides clear, documented inputs and outputs
- Uses consistent coding patterns for maintainability

## Tools

### Email Validation

**File:** `airtable/validateEmailWithFallback.js`

Validates email addresses and provides fallback handling for invalid emails.

**Inputs:**
- `emailToValidate` (string) - Email address to validate
- `fallbackEmail` (string) - Email to use if validation fails
- `fallbackMessage` (string, optional) - Custom message for fallback notifications

**Outputs:**
- `valid` (boolean) - Whether the email is valid
- `email` (string) - The validated email or fallback email
- `message` (string) - Notification message if fallback was used

**Use Case:** Email sending automations where you need to ensure valid recipient addresses and handle missing/invalid emails gracefully.

---

### Conditional Text Replacement

**File:** `airtable/If-String-Then-Else-conditional-text-replacement.js`

Searches for a term within text and returns different values based on whether the term is found.

**Inputs:**
- `searchTerm` (string|array) - Term to search for
- `textToSearch` (string|array) - Text to search within
- `textIfFound` (string) - Value to return if term is found
- `textIfNotFound` (string) - Value to return if term is not found

**Outputs:**
- `result` (string) - The appropriate text based on search result

**Features:**
- Case-insensitive matching
- Handles both strings and single-item arrays (from lookup fields)
- Trims whitespace automatically

**Use Case:** Dynamic content generation, conditional field population based on text content.

---

### Conditional Value Mapper

**File:** `airtable/conditional-value-mapper.js`

Returns a specified value if input matches a target value, otherwise returns a default.

**Inputs:**
- `inputValue` (string|array) - Value to check
- `targetValue` (string) - Value to match against
- `returnValue` (string) - Value to return if matched
- `defaultValue` (string, optional) - Value to return if not matched (defaults to empty string)

**Outputs:**
- `mappedValue` (string) - The mapped result

**Features:**
- Case-insensitive comparison
- Handles lookup field arrays
- Trims whitespace

**Use Case:** Field mapping, conditional value assignment (e.g., "Yes" → "HLOC", otherwise → "").

---

### Find First Non-Empty Value

**File:** `airtable/airtable-automation-find-first-non-empty-dynamic.js`

Dynamically accepts multiple input variables and returns the first non-empty value, implementing a "coalesce" pattern.

**Inputs:**
- Dynamic inputs named with priority convention (e.g., `input01`, `input02`, `input03`, etc.)

**Outputs:**
- `First` (string) - The first non-empty value found
- `Raw` (string) - CSV string of all input values (for debugging)
- `Success` (string) - "yes" if script completed successfully
- `Errors` (string) - Any error messages

**Features:**
- No code changes needed to add more inputs
- Automatic priority sorting by input name
- Handles arrays, nulls, and various data types

**Use Case:** Populating a field from multiple potential sources with priority order (e.g., Personal Email → Work Email → Generic Email).

---

### Currency Formatter

**File:** `airtable/formatCurrencyForOutput.js`

Formats numeric values as currency strings using Canadian English locale (en-CA).

**Inputs:**
- `amount` (number|string|array) - The value to format
- `outputName` (string, optional) - Custom output variable name (defaults to "formattedValue")

**Outputs:**
- `[outputName]` (string) - Formatted currency (e.g., "1,234.50")

**Features:**
- Handles numbers, strings, and lookup arrays
- Always shows 2 decimal places
- Returns empty string for invalid inputs

**Use Case:** Formatting currency values for emails, documents, or display purposes.

**Example:**
```
Input:  amount = 1234.5, outputName = "totalPrice"
Output: totalPrice = "1,234.50"
```

---

### Date and Time Formatter

**File:** `airtable/formatDateAndTimeForOutput.js`

Converts date values into multiple formatted string outputs.

**Inputs:**
- `date` (Date|string|number|array) - Date value to format

**Outputs:**
- `friendlyDate` (string) - Example: "October 5, 2025"
- `usDate` (string) - Example: "10/05/2025"
- `isoDate` (string) - Example: "2025-10-05"
- `time` (string) - Example: "14:30" (24-hour format)

**Features:**
- Handles Date objects, ISO strings, timestamps, and lookup arrays
- All outputs are empty strings if date is invalid
- Time uses 24-hour format in local timezone

**Use Case:** Reusing a single date field in different formats for emails, PDFs, or messages.

---

### List Fields By Table ID

**File:** `airtable/listFieldsByTableId.js`

Generates a TSV (tab-separated values) list of all fields in a table for easy import into spreadsheets.

**Inputs:**
- `tableId` (string) - The ID of the table to list fields from

**Outputs:**
- `fieldsTsv` (string) - TSV formatted field list
- `fieldsJson` (array) - Structured field data
- Console output - TSV data for copy/paste

**Output Columns:**
- fieldId
- fieldName
- type
- isPrimary (TRUE/FALSE)
- description

**Use Case:** Documentation, field mapping reference, auditing table structure.

---

### Generate Log Text From Field IDs

**File:** `airtable/logFromFieldIds.js`

Creates a formatted text summary of specific fields in a record using field IDs (not names), making it resilient to field renames.

**Inputs:**
- `tableId` (string) - Table ID
- `recordId` (string) - Record ID to log
- `fieldIdsCsv` (string) - Comma-separated list of field IDs (e.g., "fld1AAAAAA, fld2BBBBBB")

**Outputs:**
- `logText` (string) - Multiline formatted summary

**Output Format:**
```
Field Name: Field Value
Another Field: Another Value
```

**Features:**
- Uses field IDs, so field renames don't break the script
- Supports lookup, select, linked records, and rollup values
- Clean formatting via Airtable's built-in formatter

**Use Case:** Audit logging, creating record snapshots, generating summaries for notifications.

---

## Usage

### General Steps for Using These Scripts

1. In your Airtable base, create an automation
2. Add the "Run a script" action
3. Copy the desired script into the script editor
4. Add input variables as specified in each script's documentation
5. Map the input variables to fields or values from your automation trigger
6. Use the output variables in subsequent automation steps

### Input Handling

All scripts handle common Airtable data patterns:
- **Direct values**: `"hello"`, `123`, `true`
- **Lookup arrays**: `["single value"]` - common with lookup fields
- **Empty values**: `null`, `undefined`, `""`, `[]`
- **Type coercion**: Automatic string/number conversion where appropriate

### Best Practices

- Use field IDs instead of field names when possible for rename-resilience
- Test scripts with empty/null values to verify fallback behavior
- Use descriptive output variable names for clarity in later automation steps
- Keep input configurations at the top of scripts for easy customization

## Contributing

When adding new scripts:

1. Include comprehensive header documentation
2. Handle common edge cases (nulls, arrays, type coercion)
3. Use consistent naming conventions
4. Provide clear examples in comments
5. Follow the established code structure pattern

## License

These scripts are provided as-is for use in Airtable automations.
