/**
 * ---------------------------------------------------------------
 *  Utility Script: List Fields From Table ID (TSV for Sheets)
 * ---------------------------------------------------------------
 *  Outputs directly to console:
 *      fieldId    fieldName    type    isPrimary    description
 *
 *  Copy/paste the console output into Google Sheets.
 *
 *  Inputs:
 *      tableId (string)
 * ---------------------------------------------------------------
 */

let { tableId } = input.config();

// Get table
let table = base.getTable(tableId);

// Primary field = first in fields[] in Automations
let primaryFieldId = table.fields[0].id;

// Build structured field list
let fields = table.fields.map(f => ({
    id: f.id,
    name: f.name,
    type: f.type,
    description: f.description || "",
    isPrimary: f.id === primaryFieldId
}));

// TSV header
let header = [
    "fieldId",
    "fieldName",
    "type",
    "isPrimary",
    "description"
].join("\t");

// TSV rows
let rows = fields.map(f => {
    let cleanDescription = f.description.replace(/\r?\n/g, " ");
    return [
        f.id,
        f.name,
        f.type,
        f.isPrimary ? "TRUE" : "FALSE",
        cleanDescription
    ].join("\t");
});

// Final TSV
let tsv = [header, ...rows].join("\n");

// Output to console (primary output)
console.log(tsv);

// Optional: also return to automation outputs
output.set("fieldsTsv", tsv);
output.set("fieldsJson", fields);
