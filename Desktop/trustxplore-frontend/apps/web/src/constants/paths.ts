const paths = {
  INDEX: '/',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  AUTH_ERROR: '/auth/error',
  SETTINGS: '/settings',
  APP: {
    INDEX: '/app',
  },
} as const;

export default paths;
