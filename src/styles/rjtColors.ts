/**
 * RJT Consultoria - Design System
 * Paleta de cores corporativa
 */

export const RJT_COLORS = {
  // Cores Primárias
  primary: {
    darkNavy: '#001F3F',      // Azul Marinho (headers, backgrounds principais)
    cyan: '#00A8E8',          // Azul Ciano (accents, botões, highlights)
    lightBlue: '#B8E6F5',     // Azul Claro (backgrounds secundários, hover)
  },
  
  // Cores Neutras
  neutral: {
    white: '#FFFFFF',
    darkGray: '#2C3E50',      // Texto secundário
    mediumGray: '#5A6C7D',
    lightGray: '#F4F7FB',
    veryLightGray: '#F8FAFC',
  },
  
  // Cores de Status
  status: {
    success: '#10B981',       // Verde
    warning: '#F59E0B',       // Âmbar
    error: '#EF4444',         // Vermelho
    info: '#3B82F6',          // Azul
  },
  
  // Gradientes
  gradients: {
    headerGradient: 'linear-gradient(135deg, #001F3F 0%, #003D7A 100%)',
    backgroundGradient: 'linear-gradient(180deg, #F8FAFC 0%, #F4F7FB 42%, #EEF3F8 100%)',
    accentGradient: 'linear-gradient(135deg, #00A8E8 0%, #0088C4 100%)',
  },
};

// Tailwind color mappings
export const tailwindColorMap = {
  'rjt-primary-dark': '#001F3F',
  'rjt-primary-cyan': '#00A8E8',
  'rjt-primary-light': '#B8E6F5',
  'rjt-neutral-dark': '#2C3E50',
  'rjt-neutral-medium': '#5A6C7D',
  'rjt-neutral-light': '#F4F7FB',
};
