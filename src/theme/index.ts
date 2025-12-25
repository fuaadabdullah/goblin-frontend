// Theme system configuration and utilities

// Design tokens
export const tokens = {
  colors: {
    primary: {
      1: 'hsl(210 40% 96.1%)',
      2: 'hsl(210 40% 92.2%)',
      3: 'hsl(210 40% 88.2%)',
      4: 'hsl(210 40% 84.3%)',
      5: 'hsl(210 40% 80.4%)',
      6: 'hsl(210 40% 76.5%)',
      7: 'hsl(210 40% 72.5%)',
      8: 'hsl(210 40% 68.6%)',
      9: 'hsl(210 40% 64.7%)',
      10: 'hsl(210 40% 60.8%)',
      11: 'hsl(210 40% 56.9%)',
      12: 'hsl(210 40% 53%)',
    },
    accent: {
      1: 'hsl(210 40% 96.1%)',
      2: 'hsl(210 40% 92.2%)',
      3: 'hsl(210 40% 88.2%)',
      4: 'hsl(210 40% 84.3%)',
      5: 'hsl(210 40% 80.4%)',
      6: 'hsl(210 40% 76.5%)',
      7: 'hsl(210 40% 72.5%)',
      8: 'hsl(210 40% 68.6%)',
      9: 'hsl(210 40% 64.7%)',
      10: 'hsl(210 40% 60.8%)',
      11: 'hsl(210 40% 56.9%)',
      12: 'hsl(210 40% 53%)',
    },
    background: 'hsl(0 0% 100%)',
    surface: 'hsl(0 0% 100%)',
    text: 'hsl(222.2 84% 4.9%)',
    muted: 'hsl(210 40% 98%)',
    border: 'hsl(214.3 31.8% 91.4%)',
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
  },
  radii: {
    1: '4px',
    2: '6px',
    3: '8px',
    4: '12px',
  },
  shadows: {
    1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    2: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    3: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
};

// Theme presets
export const themePresets = {
  default: {
    accentColor: 'blue',
    grayColor: 'gray',
    panelBackground: 'translucent',
    scaling: '100%',
  },
  nocturne: {
    accentColor: 'violet',
    grayColor: 'mauve',
    panelBackground: 'solid',
    scaling: '100%',
  },
  ember: {
    accentColor: 'amber',
    grayColor: 'bronze',
    panelBackground: 'translucent',
    scaling: '100%',
  },
};

// High contrast mode styles
export const highContrastStyles = {
  colors: {
    background: 'hsl(0 0% 100%)',
    surface: 'hsl(0 0% 100%)',
    text: 'hsl(222.2 84% 4.9%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    focus: 'hsl(210 40% 53%)',
  },
  shadows: {
    focus: '0 0 0 2px hsl(210 40% 53%)',
  },
};


// Theme utilities
export const applyThemePreset = (preset: keyof typeof themePresets) => {
  const theme = themePresets[preset];
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
};

export const enableHighContrast = (enabled: boolean) => {
  if (enabled) {
    document.documentElement.classList.add('high-contrast');
    Object.entries(highContrastStyles.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  } else {
    document.documentElement.classList.remove('high-contrast');
  }
};

export const getHighContrastPreference = () => {
  return document.documentElement.classList.contains('high-contrast');
};

// Initialize theme system
export const initializeTheme = () => {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme-preset') || 'default';
  applyThemePreset(savedTheme as keyof typeof themePresets);
  
  // Check for high contrast preference
  const highContrast = localStorage.getItem('high-contrast') === 'true';
  enableHighContrast(highContrast);
};
