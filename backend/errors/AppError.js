class AppError extends Error {
    
    constructor(msg, statusCode) {
	super(msg);
	
	this.statusCode = statusCode;
	this.error = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
	this.isOperational = true;
	
	Error.captureStackTrace(this, this.constructor);
    }
}

class GenericError extends AppError {
  constructor(message, details = null) {
    super(message, 404, "ERROR", details);
  }
}

module.exports = AppError;