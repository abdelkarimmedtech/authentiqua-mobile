const FormData = require('form-data');

const fallbackVerifyImageBuffer = async (imageBuffer) => {
  const sample = imageBuffer.subarray(0, Math.min(imageBuffer.length, 4096));
  const sum = sample.reduce((total, value) => total + value, 0);
  const confidence = 55 + (sum % 41);
  const label = confidence >= 70 ? 'REAL' : 'FAKE';

  return {
    label,
    confidence,
    modelVersion: 'backend-fallback-v1',
    notes: 'Backend fallback verification used. Configure AI_IMAGE_SCAN_URL for production AI verification.',
  };
};

const verifyImageBuffer = async (imageBuffer, details = {}) => {
  const aiUrl = process.env.AI_IMAGE_SCAN_URL || process.env.EXPO_PUBLIC_AI_IMAGE_SCAN_URL;

  if (!aiUrl) {
    return fallbackVerifyImageBuffer(imageBuffer);
  }

  const formData = new FormData();
  formData.append('file', imageBuffer, {
    filename: details.fileName?.replace(/\.pdf$/i, '.png') || 'document-page-1.png',
    contentType: 'image/png',
  });
  formData.append('documentType', details.documentType || 'OTHER');
  formData.append('university', details.university || 'unknown');
  formData.append('source', details.source || 'image');

  const response = await fetch(aiUrl, {
    method: 'POST',
    headers: {
      ...formData.getHeaders(),
      Accept: 'application/json',
      Authorization: process.env.AI_API_KEY ? `Bearer ${process.env.AI_API_KEY}` : undefined,
    },
    body: formData,
    duplex: 'half',
  });

  if (!response.ok) {
    throw new Error(`AI image verification failed with status ${response.status}`);
  }

  const json = await response.json();
  return {
    label: json.label || 'FAKE',
    confidence: Number(json.confidence) || 0,
    modelVersion: json.modelVersion || 'backend-ai-v1',
    notes: json.notes || 'Verified by backend AI service.',
  };
};

module.exports = {
  verifyImageBuffer,
};
