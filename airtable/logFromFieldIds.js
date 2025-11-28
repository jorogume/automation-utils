/**
 * ---------------------------------------------------------------
 *  Utility Script: Generate Log Text From Field IDs (Airtable)
 * ---------------------------------------------------------------
 *
 *  Purpose:
 *      Creates a multiline text summary of specific fields in a
 *      record, using:
 *          - The table ID
 *          - The record ID
 *          - A comma-separated list of field IDs
 *
 *      Output format (one line per field):
 *          Field Name: Field Value
 *
 *  Why this exists:
 *      - Dynamic tokens in Airtable automations are slow to build.
 *      - Field names often change, breaking hard-coded templates.
 *      - This script reads field *IDs*, so renames do not affect it.
 *
 *  Safe for:
 *      - Renamed fields
 *      - Tables with many fields
 *      - Lookup, select, linked record and rollup values
 *
 *  Inputs required (Automation → Run Script → Input Variables):
 *      tableId      (string)  Static. Example: "tblXXXXXXXXXXXXXX"
 *      recordId     (string)  Dynamic. From trigger record → Record ID.
 *      fieldIdsCsv  (string)  Static CSV list. Example: "fldAAA, fldBBB, fldCCC"
 *
 *  Output:
 *      logText      (string)  Use in later steps via {{logText}}
 *
 *  Typical use case:
 *      Button → Automation → Run Script → Create Log Record
 *
 *  Example CSV input:
 *      "fld1AAAAAA, fld2BBBBBB, fld3CCCCCC"
 *
 *  Notes:
 *      - Values are converted using Airtable’s built-in formatter
 *        (record.getCellValueAsString), so the output is clean.
 *      - You can uncomment the empty-value skip if needed.
 *
 * ---------------------------------------------------------------
 */

let { tableId, recordId, fieldIdsCsv } = input.config();

// Convert CSV to clean array of field IDs
let fieldIds = fieldIdsCsv
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);

let table = base.getTable(tableId);

let query = await table.selectRecordsAsync({ fields: fieldIds });
let record = query.getRecord(recordId);

if (!record) {
    throw new Error(`Record ${recordId} not found in table ${tableId}`);
}

let lines = [];

for (let fieldId of fieldIds) {
    let field = table.getField(fieldId);
    let valueString = record.getCellValueAsString(fieldId);

    // Optional: skip fields with no value
    // if (!valueString) continue;

    lines.push(`${field.name}: ${valueString}`);
}

let logText = lines.join('\n');

output.set("logText", logText);
