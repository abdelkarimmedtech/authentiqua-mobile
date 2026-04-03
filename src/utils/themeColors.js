export const themeColors = {
  light: {
    bg: '#FFFFFF',
    headerBg: '#F5F5F5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    muted: '#666666',
    cardBg: '#F5F5F5',
    optionBg: '#EFEFEF',
    border: '#E0E0E0',
    icon: '#666666',
    inputBg: '#EFEFEF',
    inputBorder: '#E0E0E0',
    divider: '#E0E0E0'
  },
  dark: {
    bg: '#071027',
    headerBg: '#0F1B2E',
    text: '#E6EEF8',
    textSecondary: '#9AA7C0',
    muted: '#9AA7C0',
    cardBg: '#0A1F3A',
    optionBg: '#0A1F3A',
    border: '#0E2748',
    icon: '#5B7A9A',
    inputBg: '#0A1F3A',
    inputBorder: '#0E2748',
    divider: '#0E2748'
  }
};

export const getThemeColors = (theme) => themeColors[theme] || themeColors.dark;