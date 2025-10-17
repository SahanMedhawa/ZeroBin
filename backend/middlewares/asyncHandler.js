// Middleware to handle asynchronous route handlers and catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Preserve status code if already set, otherwise default to 500
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({ message: error.message });
  });
};

export default asyncHandler;
