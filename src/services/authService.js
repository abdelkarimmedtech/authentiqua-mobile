// Mock auth service - replace with real API integration in production

export const signIn = async (email, password) => {
  await delay(800);
  if (!email || !password) return { message: 'Invalid credentials' };
  // simple fake token
  return { token: `token-${email.split('@')[0]}-${Date.now()}` };
};

export const signUp = async (email, password) => {
  await delay(1000);
  if (!email || !password) return { message: 'Missing fields' };
  return { token: `token-${email.split('@')[0]}-${Date.now()}` };
};

export const signOut = async () => {
  await delay(200);
  return { ok: true };
};

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
