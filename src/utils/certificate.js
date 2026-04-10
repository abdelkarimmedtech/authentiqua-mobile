import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';

const CERTIFICATES_DIR = `${FileSystem.documentDirectory}certificates/`;

const safe = (value) => String(value ?? '').replace(/[<>&"]/g, (ch) => {
  if (ch === '<') return '&lt;';
  if (ch === '>') return '&gt;';
  if (ch === '&') return '&amp;';
  return '&quot;';
});

export const getVerificationLink = (verificationId) =>
  `https://authentiqua.app/verify/${encodeURIComponent(verificationId || 'unknown')}`;

const buildCertificateHtml = ({ verificationId, status, confidence, university }) => `
  <html>
    <body style="font-family: -apple-system, Segoe UI, Roboto, Arial; padding: 28px; color: #10223D;">
      <h1 style="margin: 0 0 6px 0; color: #0E6CFF;">Authentiqua Certificate</h1>
      <p style="margin: 0 0 20px 0; color: #4F6688;">Digital Verification Summary</p>
      <div style="border: 1px solid #D8E2F2; border-radius: 12px; padding: 16px;">
        <p><b>Verification ID:</b> ${safe(verificationId)}</p>
        <p><b>Status:</b> ${safe(status)}</p>
        <p><b>Confidence:</b> ${safe(confidence)}%</p>
        <p><b>University:</b> ${safe(university || 'N/A')}</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #4F6688;">
        Verify online: ${safe(getVerificationLink(verificationId))}
      </p>
    </body>
  </html>
`;

export async function generateCertificatePdf(params) {
  const html = buildCertificateHtml(params);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function saveCertificateToLocalStorage(params) {
  if (!FileSystem.documentDirectory) {
    throw new Error('Local document directory is unavailable on this device.');
  }
  await FileSystem.makeDirectoryAsync(CERTIFICATES_DIR, { intermediates: true });
  const sourceUri = await generateCertificatePdf(params);
  const fileName = `certificate-${params.verificationId || 'verification'}.pdf`;
  const destinationUri = `${CERTIFICATES_DIR}${fileName}`;
  const existing = await FileSystem.getInfoAsync(destinationUri);
  if (existing.exists) {
    await FileSystem.deleteAsync(destinationUri, { idempotent: true });
  }
  await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });
  return destinationUri;
}
