// Test script - outputs array for Repeat action

const surveyors = [
  {
    subject: "Inspección de terreno - Lote A",
    body: "Se requiere levantamiento topográfico del lote A, sector norte."
  },
  {
    subject: "Revisión de linderos - Propiedad García",
    body: "Verificar colindancias con propiedades adyacentes según plano catastral."
  },
  {
    subject: "Estudio de nivelación - Proyecto Centro",
    body: "Determinar curvas de nivel para diseño de drenaje pluvial."
  }
];

// Transform with consistent structure (even though hardcoded, good practice)
const results = surveyors.map(item => ({
  subject: item.subject ?? null,
  body: item.body ?? null
}));

// Standard output structure
output.set("ok", true);
output.set("count", results.length);
output.set("surveyors", results);
