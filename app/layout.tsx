"use client";

import React, { useEffect } from 'react';
import type { Metadata } from 'next'
import './globals.css'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { ThemeProvider } from '../src/theme/components/ThemeProvider';
import { TooltipProvider } from '../src/components/ui/Tooltip';
import { initializeTheme } from '../src/theme/index';
import { applyThemePreset, enableHighContrast, getHighContrastPreference } from '../src/theme/index';

function AppProviders({ children }: { children: React.ReactNode }) {
  // Initialize theme system on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <TooltipProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </TooltipProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AppProviders>
            {children}
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}
