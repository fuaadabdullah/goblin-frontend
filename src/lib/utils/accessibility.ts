// Accessibility utilities and helpers

// ARIA utilities
export const aria = {
  // Live regions
  live: {
    polite: 'polite',
    assertive: 'assertive',
    off: 'off',
  },
  
  // Roles
  roles: {
    button: 'button',
    link: 'link',
    heading: 'heading',
    img: 'img',
    list: 'list',
    listitem: 'listitem',
    navigation: 'navigation',
    main: 'main',
    banner: 'banner',
    contentinfo: 'contentinfo',
    complementary: 'complementary',
    form: 'form',
    dialog: 'dialog',
    alert: 'alert',
    status: 'status',
    tooltip: 'tooltip',
    menu: 'menu',
    menuitem: 'menuitem',
    tablist: 'tablist',
    tab: 'tab',
    tabpanel: 'tabpanel',
  },
  
  // States and properties
  states: {
    expanded: 'aria-expanded',
    hidden: 'aria-hidden',
    disabled: 'aria-disabled',
    selected: 'aria-selected',
    checked: 'aria-checked',
    pressed: 'aria-pressed',
    busy: 'aria-busy',
    live: 'aria-live',
    relevant: 'aria-relevant',
    owns: 'aria-owns',
    controls: 'aria-controls',
    describedby: 'aria-describedby',
    labelledby: 'aria-labelledby',
    haspopup: 'aria-haspopup',
    level: 'aria-level',
    posinset: 'aria-posinset',
    setsize: 'aria-setsize',
    current: 'aria-current',
  },
};

// Focus management
export const focusManager = {
  // Store focus
  storeFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    sessionStorage.setItem('lastFocus', activeElement?.id || '');
  },
  
  // Restore focus
  restoreFocus(): void {
    const lastFocusId = sessionStorage.getItem('lastFocus');
    if (lastFocusId) {
      const element = document.getElementById(lastFocusId);
      if (element) {
        element.focus();
      }
    }
  },
  
  // Focus trap
  createFocusTrap(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },
  
  // Focus visible polyfill
  initFocusVisible(): void {
    document.addEventListener('keydown', () => {
      document.body.classList.add('js-focus-visible');
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('js-focus-visible');
    });
  },
};

// Screen reader utilities
export const screenReader = {
  // Announce message
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);
    
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  },
  
  // Hide from screen readers
  hideFromScreenReaders(element: HTMLElement): void {
    element.setAttribute('aria-hidden', 'true');
  },
  
  // Show to screen readers only
  screenReaderOnly(element: HTMLElement): void {
    element.style.position = 'absolute';
    element.style.left = '-10000px';
    element.style.width = '1px';
    element.style.height = '1px';
    element.style.overflow = 'hidden';
  },
};

// Keyboard navigation utilities
export const keyboard = {
  // Common key codes
  keys: {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    TAB: 9,
    ARROW_UP: 38,
    ARROW_DOWN: 40,
    ARROW_LEFT: 37,
    ARROW_RIGHT: 39,
    HOME: 36,
    END: 35,
  },
  
  // Is navigation key
  isNavigationKey(keyCode: number): boolean {
    return [
      this.keys.TAB,
      this.keys.ARROW_UP,
      this.keys.ARROW_DOWN,
      this.keys.ARROW_LEFT,
      this.keys.ARROW_RIGHT,
      this.keys.HOME,
      this.keys.END,
    ].includes(keyCode);
  },
  
  // Create keyboard handler
  createHandler(handlers: Record<string, (e: KeyboardEvent) => void>): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent) => {
      const handler = handlers[e.key];
      if (handler) {
        handler(e);
        e.preventDefault();
        e.stopPropagation();
      }
    };
  },
};

// Color contrast utilities
export const colorContrast = {
  // Calculate luminance
  getLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  
  // Calculate contrast ratio
  getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },
  
  // Check WCAG compliance
  isWcagCompliant(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    
    if (size === 'large') {
      return level === 'AA' ? ratio >= 3 : ratio >= 4.5;
    } else {
      return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
    }
  },
  
  // Hex to RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },
};

// Semantic HTML utilities
export const semantic = {
  // Create semantic heading
  createHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string, className?: string): HTMLElement {
    const heading = document.createElement(`h${level}`);
    heading.textContent = text;
    if (className) {
      heading.className = className;
    }
    return heading;
  },
  
  // Validate heading hierarchy
  validateHeadingHierarchy(container: HTMLElement): boolean {
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    
    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1), 10);
      
      if (level > lastLevel + 1) {
        console.warn(`Invalid heading hierarchy: ${heading.tagName} follows a heading of level ${lastLevel}`);
        return false;
      }
      
      lastLevel = level;
    }
    
    return true;
  },
};

// Motion preference utilities
export const motion = {
  // Check if user prefers reduced motion
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Create motion-safe animation
  createMotionSafeAnimation(callback: () => void): void {
    if (!this.prefersReducedMotion()) {
      callback();
    }
  },
  
  // Get motion-safe transition
  getMotionSafeTransition(property: string = 'all', duration: string = '300ms'): string {
    return this.prefersReducedMotion() ? 'none' : `${property} ${duration} ease-in-out`;
  },
};

// Text scaling utilities
export const textScaling = {
  // Check if text is scaled
  isTextScaled(): boolean {
    const testElement = document.createElement('div');
    testElement.style.fontSize = '100px';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const isScaled = computedStyle.fontSize !== '100px';
    
    document.body.removeChild(testElement);
    return isScaled;
  },
  
  // Get text scale factor
  getTextScaleFactor(): number {
    const testElement = document.createElement('div');
    testElement.style.fontSize = '100px';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const scaleFactor = parseFloat(computedStyle.fontSize) / 100;
    
    document.body.removeChild(testElement);
    return scaleFactor;
  },
};

// High contrast detection
export const highContrast = {
  // Check if high contrast mode is enabled
  isHighContrastMode(): boolean {
    // Check CSS media query
    const mq = window.matchMedia('(prefers-contrast: high)');
    if (mq.matches) return true;
    
    // Fallback: check computed styles
    const testElement = document.createElement('div');
    testElement.style.color = 'rgb(1,2,3)';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    document.body.appendChild(testElement);
    
    const computedColor = window.getComputedStyle(testElement).color;
    const isHighContrast = computedColor !== 'rgb(1, 2, 3)';
    
    document.body.removeChild(testElement);
    return isHighContrast;
  },
  
  // Detect contrast type
  getContrastType(): 'none' | 'low' | 'high' | 'max' | 'more' | 'less' {
    if (window.matchMedia('(prefers-contrast: high)').matches) return 'high';
    if (window.matchMedia('(prefers-contrast: more)').matches) return 'more';
    if (window.matchMedia('(prefers-contrast: less)').matches) return 'less';
    return 'none';
  },
};

// Accessibility testing utilities
export const a11yTest = {
  // Check color contrast
  testColorContrast(element: HTMLElement): { ratio: number; compliant: boolean } {
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;
    
    const ratio = colorContrast.getContrastRatio(color, backgroundColor);
    const compliant = colorContrast.isWcagCompliant(color, backgroundColor, 'AA', 'normal');
    
    return { ratio, compliant };
  },
  
  // Check focus order
  testFocusOrder(container: HTMLElement): boolean {
    const focusableElements = Array.from(
      container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];
    
    let lastTabIndex = -1;
    for (const element of focusableElements) {
      const tabIndex = parseInt(element.getAttribute('tabindex') || '0', 10);
      if (tabIndex < lastTabIndex && tabIndex > 0) {
        console.warn('Invalid tab order detected');
        return false;
      }
      lastTabIndex = tabIndex;
    }
    
    return true;
  },
  
  // Check ARIA attributes
  testAriaAttributes(element: HTMLElement): string[] {
    const issues: string[] = [];
    const role = element.getAttribute('role');
    
    // Check for required attributes based on role
    if (role === 'button' && !element.hasAttribute('aria-label')) {
      issues.push('Button missing aria-label');
    }
    
    if (role === 'dialog' && !element.hasAttribute('aria-labelledby')) {
      issues.push('Dialog missing aria-labelledby');
    }
    
    if (role === 'tablist') {
      const tabs = element.querySelectorAll('[role="tab"]');
      tabs.forEach((tab) => {
        if (!tab.hasAttribute('aria-controls')) {
          issues.push('Tab missing aria-controls');
        }
      });
    }
    
    return issues;
  },
};
