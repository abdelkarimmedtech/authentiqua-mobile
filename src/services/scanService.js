// Mock scan service that simulates image analysis and returns label + confidence

export async function scanImage(fileUri) {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 1200));

  // Fake confidence: random between 30 and 99
  const confidence = Math.round(30 + Math.random() * 70);
  const label = confidence > 60 ? 'REAL' : 'FAKE';

  return { label, confidence };
}
