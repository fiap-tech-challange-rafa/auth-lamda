const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const generateToken = (clientData) => {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRATION || 3600;

    const payload = {
      clientId: clientData.id,
      cpf: clientData.cpf,
      name: clientData.name,
      status: clientData.status,
    };

    const token = jwt.sign(payload, secret, {
      expiresIn,
      algorithm: 'HS256',
    });

    logger.info(`Token generated for client: ${clientData.id}`);

    return {
      token,
      expiresIn,
      type: 'Bearer',
    };
  } catch (error) {
    logger.error(`Error generating token: ${error.message}`);
    throw new Error('Failed to generate token');
  }
};

const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret);
    logger.info(`Token verified for client: ${decoded.clientId}`);
    return decoded;
  } catch (error) {
    logger.error(`Error verifying token: ${error.message}`);
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateToken, verifyToken };
