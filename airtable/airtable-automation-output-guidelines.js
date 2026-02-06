/*
Airtable Automation Script Output Structure - Critical Guidelines

CRITICAL RULES (Non-Negotiable)

1. Use Nullish Coalescing (??), NOT Logical OR (||)

// WRONG - Creates inconsistent types
const obj = {
  value: data.value || 0,        // Empty string becomes 0
  name: data.name || "default"   // False becomes "default"
};

// CORRECT - Explicit null handling
const obj = {
  value: data.value ?? 0,        // Only null/undefined become 0
  name: data.name ?? "default"   // Only null/undefined get default
};

Why: || treats false, 0, "" as falsy. ?? only treats null/undefined as nullish.

2. Every Object Must Have Identical Keys

// WRONG - Conditional keys
const results = items.map(item => {
  const obj = { id: item.id ?? null };
  if (item.optional) {
    obj.optional = item.optional;  // Only sometimes present!
  }
  return obj;
});

// CORRECT - Always present, explicitly null
const results = items.map(item => ({
  id: item.id ?? null,
  optional: item.optional ?? null  // Always present
}));

Why: Airtable inspects the first object to build its schema. Missing keys in later objects cause failures.

3. Explicit Null for Missing Values (Never undefined)

// WRONG - Allows undefined
const results = apiData.map(item => ({
  id: item.id,           // Could be undefined!
  name: item.name        // Could be undefined!
}));

// CORRECT - Explicit null handling
const results = apiData.map(item => ({
  id: item.id ?? null,
  name: item.name ?? null
}));

Why: Airtable treats undefined as "missing key," not "null value." This breaks schema consistency.

4. Consistent Data Types Per Field

// WRONG - Mixed types
const results = items.map(item => ({
  count: item.count || "none",     // Number OR string!
  active: item.active || "false"   // Boolean OR string!
}));

// CORRECT - Single type per field
const results = items.map(item => ({
  count: item.count ?? 0,          // Always number
  active: item.active ?? false     // Always boolean
}));

Example type defaults:
  - Numbers: ?? 0 or ?? null
  - Strings: ?? "" or ?? null
  - Booleans: ?? false or ?? true
  - Dates: ?? "" or ?? null
  - Arrays: ?? [] (but never mix with null)

5. Pre-Allocate Arrays When Preserving Order

// WRONG - Sparse array with gaps
const results = [];
items.forEach((item, i) => {
  if (item.valid) {
    results[i] = transform(item);
  }
  // results[i] is undefined for invalid items!
});

// CORRECT - Pre-filled with null placeholders
const results = new Array(items.length).fill(null);
items.forEach((item, i) => {
  results[i] = item.valid
    ? transform(item)
    : { id: item.id, value: null, error: "INVALID" };
});

Why: Airtable can't iterate over undefined slots. Every index must contain an object with consistent structure.

COMPLETE OUTPUT TEMPLATE

Use this pattern for every Airtable automation script output:

// Transform API/external data into consistent structure
const results = rawData.map(item => ({
  // Required ID field (must always exist)
  recordId: item.id ?? null,

  // Nullable fields - explicitly set to null
  field1: item.field1 ?? null,
  field2: item.field2 ?? null,

  // String fields with empty string default
  description: item.description ?? "",
  notes: item.notes ?? "",

  // Number fields with 0 or null default
  count: item.count ?? 0,
  value: item.value ?? null,

  // Boolean fields with explicit default
  isActive: item.isActive ?? false,
  isValid: item.isValid ?? true,

  // Status/condition field for error tracking
  status: item.error ? "ERROR" : "SUCCESS",
  condition: item.condition ?? "UNKNOWN"
}));

// Output structure
output.set("ok", true);                    // Success flag
output.set("count", results.length);       // Count for validation
output.set("results", results);            // The array for Repeat

VALIDATION CHECKLIST

Before outputting an array for Airtable Repeat, verify:

  [ ] All objects have identical keys
  [ ] No undefined values (use ?? null everywhere)
  [ ] Each field has consistent type across all objects
  [ ] Used ?? instead of || for defaults
  [ ] Empty cases return empty array [], not null
  [ ] Errors set ok: false with descriptive error field

PROMPT TEMPLATE FOR LLMs

When asking an LLM to write Airtable automation scripts, include this:

"Write an Airtable automation script that outputs an array for use in a Repeat action.

CRITICAL OUTPUT REQUIREMENTS:
1. Use ?? (nullish coalescing), NEVER || (logical OR)
2. Every object in the array must have IDENTICAL keys
3. Use explicit null for missing values, never undefined
4. Each field must have consistent data type across all objects
5. Pre-allocate arrays with .fill(null) if preserving order

OUTPUT STRUCTURE:
output.set('ok', true/false);
output.set('count', results.length);
output.set('results', results);  // Array of objects with identical structure

EXAMPLE OBJECT STRUCTURE:
{
  recordId: value ?? null,
  field1: value ?? null,
  field2: value ?? '',
  field3: value ?? 0,
  field4: value ?? false,
  status: 'SUCCESS' | 'ERROR'
}"

COMMON MISTAKES TO AVOID

Mistake 1: Optional Chaining Without Nullish Coalescing

// WRONG - Returns undefined
const value = obj?.nested?.value;

// CORRECT - Returns null
const value = obj?.nested?.value ?? null;

Mistake 2: Conditional Object Construction

// WRONG - Different objects have different keys
const obj = { id: item.id };
if (item.extra) obj.extra = item.extra;

// CORRECT - All objects have same keys
const obj = {
  id: item.id ?? null,
  extra: item.extra ?? null
};

Mistake 3: Mixing Empty Values

// WRONG - Sometimes null, sometimes undefined, sometimes ""
const results = items.map(i => ({
  value: i.value || null || undefined || ""
}));

// CORRECT - Pick ONE empty value type per field
const results = items.map(i => ({
  value: i.value ?? null  // Always null when missing
}));

WORKING EXAMPLE (Full Script)

const cfg = input.config();

// Fetch data from API
const response = await fetch(cfg.apiUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ teamId: cfg.teamId })
});

const rawData = await response.json();

// Transform with consistent structure
const results = (rawData.items ?? []).map(item => ({
  // Always use ?? for null coalescing
  id: item.id ?? null,
  name: item.name ?? null,
  description: item.description ?? "",
  count: item.count ?? 0,
  isActive: item.isActive ?? false,
  createdAt: item.createdAt ?? "",
  status: item.error ? "ERROR" : "SUCCESS"
}));

// Standard output structure
output.set("ok", true);
output.set("count", results.length);
output.set("results", results);



/*
6. Force Type Coercion Explicitly

Airtable requires explicit type casting to ensure consistent schemas.

// WRONG - Implicit types can cause schema detection failures
const results = items.map(item => ({
  id: item.id ?? null,           // Could be string, number, or null
  count: item.count ?? 0,        // Could be string "0" or number 0
  active: item.active ?? false   // Could be string "false" or boolean
}));

// CORRECT - Explicit type coercion
const results = items.map(item => ({
  id: String(item.id ?? ""),           // Always string
  count: Number(item.count ?? 0),      // Always number
  active: Boolean(item.active)         // Always boolean
}));

Type Coercion Rules:
  - Strings: String(value ?? "") - Use empty string, not null
  - Numbers: Number(value ?? 0) - Use 0 or valid number default
  - Booleans: Boolean(value) - Coerces properly, or use ?? false
  - Dates: String(value ?? "") - Convert to ISO string or empty
  - Never use null for strings - always use ""

7. Pre-Process Complex Transformations

Extract complex operations BEFORE the return object to ensure type consistency.

// WRONG - Complex operations inside object literal
const results = items.map(item => ({
  categories: item.tags?.join(', ') ?? null,  // Could be string OR null
  primary: item.names?.find(n => n.main)?.value ?? ""  // Messy
}));

// CORRECT - Pre-process outside object
const results = items.map(item => {
  // Pre-calculate with explicit types
  const categories = Array.isArray(item.tags) 
    ? item.tags.join(', ') 
    : "";
  const primary = item.names?.find(n => n.main)?.value ?? "";
  
  return {
    categories: String(categories),  // Always string
    primary: String(primary)         // Always string
  };
});

UPDATED OUTPUT TEMPLATE

const results = rawData.map(item => {
  // Pre-process complex values
  const computed = item.array?.join(', ') ?? "";
  const nested = item.obj?.nested?.value ?? "";
  
  return {
    // Strings - ALWAYS use String() + ""
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    computed: String(computed),
    
    // Numbers - ALWAYS use Number() + 0
    count: Number(item.count ?? 0),
    value: Number(item.value ?? 0),
    
    // Booleans - ALWAYS use Boolean() or ?? false
    isActive: Boolean(item.isActive),
    isValid: item.isValid ?? false,
    
    // Status fields
    status: item.error ? "ERROR" : "SUCCESS"
  };
});

output.set('results', results);
```

**Resumen para el prompt template:**
```
"ADDITIONAL TYPE REQUIREMENTS:
1. Wrap ALL values with explicit type constructors:
   - String(value ?? "")
   - Number(value ?? 0)
   - Boolean(value)
2. Use empty string "" for missing text, NEVER null
3. Pre-process array joins and nested finds BEFORE the return object
4. Example: const name = item.names?.find(n => n.type === 'PRIMARY')?.value ?? "";
            return { name: String(name) };"
