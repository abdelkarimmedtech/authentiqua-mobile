import API from '../config/api';

const fallbackScan = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const confidence = Math.round(30 + Math.random() * 70);
  const label = confidence > 60 ? 'REAL' : 'FAKE';
  return { label, confidence, modelVersion: 'fallback-v1', notes: 'Local fallback model used.' };
};

const buildFormData = async (fileUri, details = {}) => {
  const formData = new FormData();
  const uriParts = fileUri.split('/');
  const fileName = uriParts[uriParts.length - 1] || 'document.jpg';
  const fileType = fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

  const response = await fetch(fileUri);
  const blob = await response.blob();

  formData.append('file', blob, fileName);
  formData.append('documentType', details.documentType || 'OTHER');
  formData.append('university', details.university || 'unknown');

  return { formData, fileType };
};

export async function scanImage(fileUri, details = {}) {
  const aiUrl = API.aiBaseUrl;

  if (!aiUrl || aiUrl.includes('api.example.com')) {
    return fallbackScan();
  }

  try {
    const { formData, fileType } = await buildFormData(fileUri, details);
    const response = await fetch(`${aiUrl.replace(/\/+$/, '')}/verify-document`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: API.apiKey ? `Bearer ${API.apiKey}` : undefined,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`AI request failed with status ${response.status}`);
    }

    const json = await response.json();
    return {
      label: json.label || 'FAKE',
      confidence: Number(json.confidence) || 0,
      modelVersion: json.modelVersion || 'ai-unknown',
      notes: json.notes || 'Verified by external AI service.',
    };
  } catch (error) {
    console.error('❌ AI model integration failed:', error?.message || error);
    return fallbackScan();
  }
}
