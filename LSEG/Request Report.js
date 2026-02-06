const crypto = require('crypto');

// === 1. TUS CREDENCIALES ===
const apiKey = "842f08ec-a9ba-4d00-8177-19908702e507";
const apiSecret = "/kiC/8E6YWlb+Rszt24NZfXL/jaWakd9jFvrSaL4eUJlUSePnrsXzHqi2AuD2XRd0JA52Yl1EyxaHM/CIcrpkA==";
const host = "api.risk.lseg.com";

// === 2. DATOS HARDCODED (Fuente: Tu JSON Raw del caso "gazpro") ===
// IMPORTANTE: En el query 'caseId', debemos usar el valor del campo 'caseId' (el que termina en 'n')
const caseIdValue = "5jb8b2o5vvl91kewd0thkvvjn"; 
const creationDate = "2026-02-05"; // Fecha de nacimiento (sin hora)
const groupId = "5jb85ffp7t011kc4pyulhgnku";
const orgName = "DEBUG_TEST";

// === HELPER: Auth ===
function generateAuth(method, endpoint, body = null) {
  const gatewayUrl = "/screening/v3/"; 
  const date = new Date().toUTCString();
  let dataToSign, headers;
  
  if (body) {
    const contentLength = Buffer.byteLength(body, 'utf8');
    dataToSign = `(request-target): ${method} ${gatewayUrl}${endpoint}\nhost: ${host}\ndate: ${date}\ncontent-type: application/json\ncontent-length: ${contentLength}\n${body}`;
    headers = `(request-target) host date content-type content-length`;
  } else {
    dataToSign = `(request-target): ${method} ${gatewayUrl}${endpoint}\nhost: ${host}\ndate: ${date}`;
    headers = `(request-target) host date`;
  }
  
  const signature = crypto.createHmac('sha256', apiSecret).update(dataToSign).digest('base64');
  return {
    authorization: `Signature keyId="${apiKey}",algorithm="hmac-sha256",headers="${headers}",signature="${signature}"`,
    date: date,
    contentLength: body ? String(Buffer.byteLength(body, 'utf8')) : null
  };
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

try {
  console.log("🚀 INICIANDO SCRIPT DE DEBUG TOTAL");

  // === PASO 1: SOLICITAR REPORTE ===
  const reportBody = JSON.stringify({
    query: `caseId==${caseIdValue}`, // <--- Ahora sí: Atributo caseId con valor caseId
    filter: `groupId==${groupId};creationDate==${creationDate}`, 
    reportType: "CASE_DOSSIER",
    reportName: `Dossier_${orgName}_DEBUG`,
    reportFilter: "(includeUnresolvedMatches==true;includePositiveMatches==true;includeFalseMatches==true;includePossibleMatches==true;providerType==WATCHLIST),(includeAudit==true)"
  });

  console.log(`\n📨 [REQUEST] Enviando Payload:`);
  console.log(reportBody);

  const reqAuth = generateAuth("post", "reports", reportBody);
  
  const initResponse = await fetch(`https://${host}/screening/v3/reports`, {
    method: 'POST',
    headers: {
      'Authorization': reqAuth.authorization,
      'Date': reqAuth.date,
      'Content-Type': 'application/json',
      'Content-Length': reqAuth.contentLength
    },
    body: reportBody
  });

  const initRawText = await initResponse.text();
  console.log(`\n📬 [RESPONSE] Status: ${initResponse.status}`);
  console.log(`📥 [RESPONSE BODY]: ${initRawText}`);

  if (!initResponse.ok) {
      throw new Error(`❌ Error al pedir reporte: ${initRawText}`);
  }

  const initData = JSON.parse(initRawText);
  const reportId = initData.reportId;
  console.log(`\n✅ REPORTE CREADO EXITOSAMENTE. ID: ${reportId}`);
  console.log("⏳ Iniciando espera (Polling)...");

  // === PASO 2: POLLING (ESPERAR STATUS) ===
  let finalStatus = "UNKNOWN";
  
  // Intentamos 10 veces
  for (let i = 0; i < 10; i++) {
    await delay(2000); 
    
    const statusEndpoint = `reports/${reportId}/status`;
    const statusAuth = generateAuth("get", statusEndpoint);
    
    const statusRes = await fetch(`https://${host}/screening/v3/${statusEndpoint}`, {
       headers: { 'Authorization': statusAuth.authorization, 'Date': statusAuth.date }
    });
    
    const statusRaw = await statusRes.text();
    console.log(`\n🔄 [POLLING #${i+1}] Status Raw: ${statusRaw}`);

    if (statusRes.ok) {
        const statusJson = JSON.parse(statusRaw);
        // A veces es 'status', a veces 'progressStatus', leemos ambos por si acaso
        finalStatus = statusJson.progressStatus || statusJson.status;
        
        if (finalStatus === "COMPLETED") {
            console.log("\n🎉 ¡REPORTE COMPLETADO!");
            output = { success: true, status: "COMPLETED", reportId: reportId, logs: "Revisar consola" };
            return; 
        }
        
        if (finalStatus === "FAILED") {
            console.log("\n💀 REPORTE FALLIDO. BUSCANDO CAUSA RAÍZ...");
            
            // === PASO 3: INVESTIGAR ERROR (Endpoint correcto del Postman) ===
            const errorEndpoint = `reports/${reportId}/errors`; // Endpoint oficial V3
            const errAuth = generateAuth("get", errorEndpoint);
            
            const errRes = await fetch(`https://${host}/screening/v3/${errorEndpoint}`, {
                 headers: { 'Authorization': errAuth.authorization, 'Date': errAuth.date }
            });
            
            const errRaw = await errRes.text();
            console.log(`\n🕵️‍♂️ [ERROR DETAILS]: ${errRaw}`);
            
            output = { success: false, error: "Reporte falló", detail: errRaw };
            return;
        }
    }
  }

  output = { success: false, error: "Timeout: Se acabó el tiempo y sigue procesando." };

} catch (err) {
  console.log(`\n💥 EXCEPCIÓN FATAL: ${err.message}`);
  output = { success: false, error: err.message };
}
