// public/js/theme-manager.js
class ThemeManager {
  constructor() {
    this.themes = {
      light: {
        name: 'Light',
        icon: '☀️',
        description: 'Clean and bright interface'
      },
      dark: {
        name: 'Dark',
        icon: '🌙',
        description: 'Easy on the eyes'
      },
      'high-contrast': {
        name: 'High Contrast',
        icon: '⚡',
        description: 'Maximum accessibility'
      },
      auto: {
        name: 'Auto',
        icon: '💻',
        description: 'Follow system preference'
      }
    };

    this.currentTheme = this.getStoredTheme() || 'dark';
    this.systemPreference = this.getSystemPreference();
    
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.createThemeSwitcher();
    this.setupEventListeners();
    this.watchSystemPreference();
  }

  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('preferred-theme');
    } catch (e) {
      console.warn('localStorage not available, using default theme');
      return null;
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem('preferred-theme', theme);
    } catch (e) {
      console.warn('Could not save theme preference');
    }
  }

  getEffectiveTheme(theme = this.currentTheme) {
    if (theme === 'auto') {
      return this.systemPreference;
    }
    return theme;
  }

  applyTheme(theme, skipTransition = false) {
    const effectiveTheme = this.getEffectiveTheme(theme);
    const body = document.body;
    
    // Add transition class if not skipping
    if (!skipTransition) {
      body.classList.add('theme-transition');
    }

    // Remove all theme classes
    body.removeAttribute('data-theme');
    
    // Apply new theme
    if (effectiveTheme !== 'light') {
      body.setAttribute('data-theme', effectiveTheme);
    }

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(effectiveTheme);

    // Remove transition class after animation
    if (!skipTransition) {
      setTimeout(() => {
        body.classList.remove('theme-transition');
      }, 300);
    }

    this.currentTheme = theme;
    this.setStoredTheme(theme);
    this.updateThemeSwitcher();
    
    // Dispatch custom event
    this.dispatchThemeChange(effectiveTheme);
  }

  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }

    const colors = {
      light: '#ffffff',
      dark: '#1a1a1a',
      'high-contrast': '#000000'
    };

    metaThemeColor.content = colors[theme] || colors.light;
  }

  createThemeSwitcher() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    switcher.innerHTML = this.getThemeSwitcherHTML();

    headerActions.insertBefore(switcher, headerActions.firstChild);
  }

  getThemeSwitcherHTML() {
    const currentThemeData = this.themes[this.currentTheme];
    
    return `
      <button class="theme-toggle" 
              aria-label="Switch theme" 
              aria-expanded="false"
              title="Current theme: ${currentThemeData.name}">
        <span class="theme-icon">${currentThemeData.icon}</span>
      </button>
      <div class="theme-dropdown" role="menu">
        ${Object.entries(this.themes).map(([key, theme]) => `
          <button class="theme-option ${key === this.currentTheme ? 'active' : ''}" 
                  data-theme="${key}"
                  role="menuitem"
                  title="${theme.description}">
            <span class="theme-option-icon">${theme.icon}</span>
            <span class="theme-option-text">${theme.name}</span>
            <span class="theme-preview ${key === 'auto' ? this.systemPreference : key}"></span>
            <span class="theme-option-check">✓</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  updateThemeSwitcher() {
    const switcher = document.querySelector('.theme-switcher');
    if (!switcher) return;

    const toggle = switcher.querySelector('.theme-toggle');
    const dropdown = switcher.querySelector('.theme-dropdown');
    
    if (toggle && dropdown) {
      const currentThemeData = this.themes[this.currentTheme];
      toggle.querySelector('.theme-icon').textContent = currentThemeData.icon;
      toggle.title = `Current theme: ${currentThemeData.name}`;

      // Update active state
      dropdown.querySelectorAll('.theme-option').forEach(option => {
        const isActive = option.dataset.theme === this.currentTheme;
        option.classList.toggle('active', isActive);
      });
    }
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('.theme-toggle');
      const option = e.target.closest('.theme-option');
      const switcher = e.target.closest('.theme-switcher');

      if (toggle) {
        this.toggleDropdown();
      } else if (option) {
        this.selectTheme(option.dataset.theme);
      } else if (!switcher) {
        this.closeDropdown();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const dropdown = document.querySelector('.theme-dropdown.show');
      if (!dropdown) return;

      const options = Array.from(dropdown.querySelectorAll('.theme-option'));
      const currentIndex = options.findIndex(opt => opt === document.activeElement);

      switch (e.key) {
        case 'Escape':
          this.closeDropdown();
          document.querySelector('.theme-toggle').focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % options.length;
          options[nextIndex].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + options.length) % options.length;
          options[prevIndex].focus();
          break;
        case 'Enter':
        case ' ':
          if (document.activeElement.classList.contains('theme-option')) {
            e.preventDefault();
            this.selectTheme(document.activeElement.dataset.theme);
          }
          break;
      }
    });
  }

  toggleDropdown() {
    const dropdown = document.querySelector('.theme-dropdown');
    const toggle = document.querySelector('.theme-toggle');
    
    if (!dropdown || !toggle) return;

    const isOpen = dropdown.classList.contains('show');
    
    if (isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    const dropdown = document.querySelector('.theme-dropdown');
    const toggle = document.querySelector('.theme-toggle');
    
    if (!dropdown || !toggle) return;

    dropdown.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
    
    // Focus first option
    const firstOption = dropdown.querySelector('.theme-option');
    if (firstOption) {
      setTimeout(() => firstOption.focus(), 100);
    }
  }

  closeDropdown() {
    const dropdown = document.querySelector('.theme-dropdown');
    const toggle = document.querySelector('.theme-toggle');
    
    if (!dropdown || !toggle) return;

    dropdown.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  }

  selectTheme(theme) {
    this.applyTheme(theme);
    this.closeDropdown();
    
    // Show notification
    if (window.showNotification) {
      const themeName = this.themes[theme].name;
      const effectiveTheme = this.getEffectiveTheme(theme);
      let message = `Switched to ${themeName} theme`;
      
      if (theme === 'auto') {
        message += ` (${effectiveTheme === 'dark' ? 'Dark' : 'Light'} mode detected)`;
      }
      
      showNotification(message, 'success');
    }
  }

  watchSystemPreference() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        this.systemPreference = e.matches ? 'dark' : 'light';
        
        // If user is on auto theme, apply the new system preference
        if (this.currentTheme === 'auto') {
          this.applyTheme('auto');
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
    }
  }

  dispatchThemeChange(effectiveTheme) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme: this.currentTheme,
        effectiveTheme: effectiveTheme
      }
    });
    
    document.dispatchEvent(event);
  }

  // Public API methods
  getTheme() {
    return this.currentTheme;
  }

  getEffectiveThemeForPublic() {
    return this.getEffectiveTheme();
  }

  setTheme(theme) {
    if (this.themes[theme]) {
      this.applyTheme(theme);
    }
  }

  getAvailableThemes() {
    return Object.keys(this.themes);
  }
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});

// Listen for theme changes to update other components
document.addEventListener('themechange', (e) => {
  console.log(`Theme changed to: ${e.detail.effectiveTheme}`);
  
 
});

// Utility function for components that need to react to theme changes
window.onThemeChange = (callback) => {
  document.addEventListener('themechange', callback);
};