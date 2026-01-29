let config = input.config();
let tableId = config.tableId;
let recordId = config.recordId;

// Get the table
let table = base.getTable(tableId);

// Delete the record
await table.deleteRecordAsync(recordId);

console.log(`Record ${recordId} deleted from table ${tableId}`);
