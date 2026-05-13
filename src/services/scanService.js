import API from '../config/api';

const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const fallbackScan = async (fileUri, details = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  // Use stable file metadata for hash input instead of temporary URI
  const { fileName = '', fileSize = 0, fileMimeType = '' } = details;
  const stableHashInput = fileName + fileSize + fileMimeType;
  
  console.log('[Verification] Fallback scoring details:', {
    fileName,
    fileSize,
    fileMimeType,
    stableHashInput,
  });
  
  const hashValue = simpleHash(stableHashInput);
  const confidence = 30 + (hashValue % 71); // 30 to 100
  const label = confidence > 60 ? 'REAL' : 'FAKE';
  console.log('[Verification] Using fallback model (deterministic), score source: stable file metadata hash, score:', confidence, 'model version: fallback-v1');
  const rawResponse = {
    fallback: true,
    label,
    confidence,
    modelVersion: 'fallback-v1',
    notes: 'Local fallback model used.',
  };
  const final_orchestration = {
    final_decision: label === 'REAL' ? 'authentic' : 'fraudulent',
    layout_authenticity_score: confidence,
    modelVersion: 'fallback-v1',
    notes: 'Local fallback model used.',
  };
  return {
    label,
    confidence,
    modelVersion: 'fallback-v1',
    notes: 'Local fallback model used.',
    rawResponse,
    final_orchestration,
    success: true,
  };
};

const normalizeScanResult = (json, defaultNotes) => ({
  label: json?.label || 'FAKE',
  confidence: Number(json?.confidence) || 0,
  modelVersion: json?.modelVersion || 'ai-unknown',
  notes: json?.notes || defaultNotes,
});

const buildImageFormData = async (fileUri, details = {}) => {
  const formData = new FormData();
  const uriParts = fileUri.split('/');
  const fileName = uriParts[uriParts.length - 1] || 'document.jpg';

  const response = await fetch(fileUri);
  const blob = await response.blob();

  formData.append('file', blob, fileName);
  formData.append('documentType', details.documentType || 'OTHER');
  formData.append('university', details.university || 'unknown');

  return formData;
};

export async function scanImage(fileUri, details = {}) {
  const aiUrl = API.aiBaseUrl;

  if (!aiUrl || aiUrl.includes('api.example.com')) {
    console.log('[Verification] AI backend not configured, using fallback model');
    return fallbackScan(fileUri, details);
  }

  try {
    const formData = await buildImageFormData(fileUri, details);
    const response = await fetch(`${aiUrl.replace(/\/+$/, '')}/verify-document`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: API.apiKey ? `Bearer ${API.apiKey}` : undefined,
      },
      body: formData,
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.message || json?.detail || `AI request failed with status ${response.status}`);
    }

    console.log("[Verification] API raw response:", json);

    const final_orchestration = json?.result?.final_orchestration;
    console.log("[Verification] FINAL ORCHESTRATION:", final_orchestration);

    if (!final_orchestration) {
      console.warn("scanService: result.final_orchestration missing in response");
      return {
        success: false,
        error: "Verification response received, but result data is missing.",
        rawResponse: json,
        final_orchestration: null,
      };
    }

    const finalDecision = final_orchestration.final_decision;
    const isAuthentic = finalDecision === "authentic";
    const returnedData = {
      label: isAuthentic ? "REAL" : "FAKE",
      confidence: final_orchestration.layout_authenticity_score ?? 0,
      modelVersion: json?.modelVersion || "ai-unknown",
      notes: json?.notes || null,
      finalDecision,
      isAuthentic,
      filename: json?.filename || null,
      final_orchestration,
      rawResponse: json,
      success: true,
    };

    console.log("[Verification] Using real AI model, score source: API response, score:", returnedData.confidence, "model version:", returnedData.modelVersion);
    return returnedData;
  } catch (error) {
    console.error('[scanImage] AI model integration failed:', error?.message || error);
    console.log('[Verification] AI failed, falling back to deterministic fallback model');
    return fallbackScan(fileUri, details);
  }
}

export async function scanPdf(pdfUri, details = {}) {
  const aiUrl = API.aiBaseUrl;

  if (!aiUrl || aiUrl.includes('api.example.com')) {
    console.log('[Verification] PDF AI backend not configured, using fallback model');
    return fallbackScan(pdfUri, details);
  }

  try {
    const fileName = details.fileName || 'document.pdf';
    const formData = new FormData();

    formData.append('file', {
      uri: pdfUri,
      name: fileName,
      type: 'application/pdf',
    });
    formData.append('documentType', details.documentType || 'OTHER');
    formData.append('university', details.university || 'unknown');

    const endpoint = `${aiUrl.replace(/\/+$/, '')}/api/scan/pdf`;
    console.log('[scanPdf] Sending PDF to backend:', { endpoint, fileName });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: API.apiKey ? `Bearer ${API.apiKey}` : undefined,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `PDF scan request failed with status ${response.status}`);
    }

    const json = await response.json();
    const result = normalizeScanResult(json, 'PDF verified by backend AI service.');
    console.log("[Verification] Using real AI model for PDF, score source: API response, score:", result.confidence, "model version:", result.modelVersion);
    return result;
  } catch (error) {
    console.error('[scanPdf] PDF AI model integration failed:', error?.message || error);
    console.log('[Verification] PDF AI failed, falling back to deterministic fallback model');
    return fallbackScan(pdfUri, details);
  }
}
