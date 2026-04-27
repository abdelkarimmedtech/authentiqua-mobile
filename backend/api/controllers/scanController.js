const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { verifyImageBuffer } = require('../services/verificationService');

const writeTempPdf = async (buffer, originalName) => {
  const safeName = originalName.replace(/[^a-z0-9._-]/gi, '_') || 'document.pdf';
  const tempPath = path.join(os.tmpdir(), `${Date.now()}_${safeName}`);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
};

const convertFirstPdfPageToImage = async (pdfPath) => {
  const { pdf } = await import('pdf-to-img');
  const document = await pdf(pdfPath, { scale: 2 });

  for await (const image of document) {
    if (Buffer.isBuffer(image)) {
      return image;
    }

    if (image instanceof Uint8Array) {
      return Buffer.from(image);
    }

    if (image?.data) {
      return Buffer.from(image.data);
    }

    throw new Error('PDF conversion produced an unsupported image format.');
  }

  throw new Error('PDF conversion returned no pages.');
};

const scanPdf = async (req, res) => {
  let tempPdfPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required.' });
    }

    const documentType = req.body.documentType || 'OTHER';
    const university = req.body.university || 'unknown';

    tempPdfPath = await writeTempPdf(req.file.buffer, req.file.originalname || 'document.pdf');
    const firstPageImage = await convertFirstPdfPageToImage(tempPdfPath);

    const result = await verifyImageBuffer(firstPageImage, {
      documentType,
      university,
      source: 'pdf-first-page',
      fileName: req.file.originalname || 'document.pdf',
    });

    return res.json({
      label: result.label || 'FAKE',
      confidence: Number(result.confidence) || 0,
      modelVersion: result.modelVersion || 'backend-pdf-v1',
      notes: result.notes || 'Verified from the first PDF page by backend AI service.',
    });
  } catch (error) {
    console.error('[scanPdf] PDF scan failed:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Failed to scan PDF.',
    });
  } finally {
    if (tempPdfPath) {
      await fs.unlink(tempPdfPath).catch(() => {});
    }
  }
};

module.exports = {
  scanPdf,
};
