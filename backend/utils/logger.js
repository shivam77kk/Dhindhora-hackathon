const logger = {
  info: (...args) => console.log('ℹ️', ...args),
  warn: (...args) => console.warn('⚠️', ...args),
  error: (...args) => console.error('❌', ...args),
  success: (...args) => console.log('✅', ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') console.log('🔍', ...args);
  },
};

export default logger;
