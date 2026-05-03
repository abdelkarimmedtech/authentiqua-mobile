import API from '../config/api';

const aiBaseUrl = API.aiBaseUrl || API.baseUrl;

export async function verifyDocument(file) {
  const url = `${aiBaseUrl.replace(/\/+$|\s+/g, '')}/verify-document`;

  const formData = new FormData();

  // React Native style file append (uri, name, type)
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'document.pdf',
    type: file.type || 'application/pdf',
  });

  const headers = {
    Accept: 'application/json',
  };

  if (API.apiKey) {
    headers.Authorization = `Bearer ${API.apiKey}`;
  }

  console.log('[authentiqaApi] POST', url, 'file', file?.name || file?.uri);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  console.log('[authentiqaApi] response status', response.status);

  const data = await response.json().catch((err) => {
    console.warn('[authentiqaApi] failed to parse json', err);
    return {};
  });

  console.log('[authentiqaApi] response json', data);

  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Verification failed');
  }

  return data;
}
