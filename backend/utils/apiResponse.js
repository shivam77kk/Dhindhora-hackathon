export const apiSuccess = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

export const apiError = (message = 'Something went wrong', statusCode = 500) => ({
  success: false,
  message,
  statusCode,
});
