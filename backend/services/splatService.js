import logger from '../utils/logger.js';

export const processSplatUpload = async (images) => {
  logger.info('3D Gaussian Splat processing requested');
  logger.info('Luma AI / local processing would happen here');

  return {
    status: 'demo',
    splatUrl: '/splats/demo.splat',
    message: 'Using demo splat asset. Connect Luma AI API for production.',
  };
};
