const crypto = require('crypto');

// === CREDENTIALS ===
const apiKey = "842f08ec-a9ba-4d00-8177-19908702e507";
const apiSecret = "/kiC/8E6YWlb+Rszt24NZfXL/jaWakd9jFvrSaL4eUJlUSePnrsXzHqi2AuD2XRd0JA52Yl1EyxaHM/CIcrpkA==";
const groupId = "5jb85ffp7t011kc4pyulhgnku";

// === INPUTS FROM TRIGGER ===
const orgName = inputData.orgName;
const countryCode = inputData.countryCode || "USA";
const recordId = inputData.recordId;

// === VALIDATION ===
if (!orgName) {
  output = {
    success: false,
    error: "Missing required field: orgName",
    recordId: recordId || "unknown"
  };
  return;
}

// === BUILD BODY ===
const body = JSON.stringify({
  caseId: "",
  groupId: groupId,
  entityType: "ORGANISATION",
  providerTypes: ["WATCHLIST"],
  caseScreeningState: { WATCHLIST: "INITIAL" },
  name: orgName,
  secondaryFields: [
    { typeId: "SFCT_6", value: countryCode }
  ]
});

// === HMAC SIGNATURE ===
const host = "api.risk.lseg.com";
const gatewayUrl = "/screening/v3/";
const date = new Date().toUTCString();
const contentLength = Buffer.byteLength(body, 'utf8');

const dataToSign = `(request-target): post ${gatewayUrl}cases
host: ${host}
date: ${date}
content-type: application/json
content-length: ${contentLength}
${body}`;

const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(dataToSign)
  .digest('base64');

const authorization = `Signature keyId="${apiKey}",algorithm="hmac-sha256",headers="(request-target) host date content-type content-length",signature="${signature}"`;

// === MAKE REQUEST ===
try {
  const response = await fetch(`https://${host}${gatewayUrl}cases`, {
    method: 'POST',
    headers: {
      'Authorization': authorization,
      'Date': date,
      'Content-Type': 'application/json',
      'Content-Length': String(contentLength)
    },
    body: body
  });

  const data = await response.json();

  // Check for API error
  if (!response.ok) {
    output = {
      success: false,
      error: data.message || `API Error: ${response.status}`,
      recordId: recordId
    };
    return;
  }

  // === PARSE & FILTER RESULTS ===
  const results = data.results || [];

  const strongMatches = results.filter(r => 
    r.matchStrength === "EXACT" || 
    r.matchStrength === "STRONG" || 
    r.matchScore >= 90
  );

  const topHit = strongMatches[0] || null;

  // Buscar OFAC number
  let ofacNumber = "—";
  if (topHit && topHit.identifications) {
    const ofacId = topHit.identifications.find(id => id.type === "US-OSDN");
    if (ofacId) ofacNumber = ofacId.value;
  }

  // Strong matches summary
  let strongMatchesSummary = "—";
  if (strongMatches.length > 0) {
    strongMatchesSummary = strongMatches.slice(0, 5).map((r, i) => {
      const name = r.names?.[0]?.details?.[0]?.value || "Unknown";
      const score = r.matchScore || 0;
      const cats = r.sourceCategories?.join(", ") || "N/A";
      return `${i+1}. ${name} (${score}%) - ${cats}`;
    }).join(" | ");
  }

  // === SUCCESS OUTPUT ===
  output = {
    success: true,
    error: "",
    recordId: recordId,
    
    orgName: data.name || orgName,
    caseId: data.caseSystemId || "—",
    screenedAt: data.modificationDate || new Date().toISOString(),
    
    status: strongMatches.length > 0 ? "🚨 ALERT" : "✅ Clear",
    totalMatches: results.length,
    strongMatchCount: strongMatches.length,
    
    topHitName: topHit?.names?.[0]?.details?.[0]?.value || "—",
    topHitScore: topHit?.matchScore || 0,
    topHitStrength: topHit?.matchStrength || "—",
    topHitCountry: topHit?.locations?.[0]?.country?.name || "—",
    topHitCategories: topHit?.sourceCategories?.join(", ") || "—",
    ofacNumber: ofacNumber,
    strongMatchesSummary: strongMatchesSummary
  };

} catch (err) {
  output = {
    success: false,
    error: `Request failed: ${err.message}`,
    recordId: recordId
  };
}
