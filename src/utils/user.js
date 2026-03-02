export function emailToDisplayName(email) {
  if (!email || typeof email !== 'string') return 'User';
  const local = email.split('@')[0] || '';
  const cleaned = local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return 'User';
  return cleaned
    .split(' ')
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getUserDisplayName(user) {
  const fullName =
    user?.profile?.fullName ||
    user?.displayName ||
    user?.profile?.name ||
    null;
  if (fullName && typeof fullName === 'string' && fullName.trim()) return fullName.trim();
  return emailToDisplayName(user?.email);
}

export function getUserRole(user) {
  return user?.profile?.role || user?.role || null;
}

export function isOnboardingComplete(user) {
  return !!user?.profile?.onboardingComplete;
}

