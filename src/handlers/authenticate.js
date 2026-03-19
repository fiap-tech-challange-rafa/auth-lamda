const logger = require('pino')();

const authenticate = async (event) => {
  const { cpf, clientId } = event.body ? JSON.parse(event.body) : event;

  logger.info({ cpf, clientId }, 'Authenticate request received');

  // Validate input
  if (!cpf || !clientId) {
    logger.warn('Missing CPF or clientId');
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: 'CPF and clientId are required',
      }),
    };
  }

  try {
    // Import services
    const { validateCPF } = require('../services/cpfService');
    const { getClientByCPF, isClientActive } = require('../services/clientService');
    const { generateToken } = require('../services/tokenService');

    // Step 1: Validate CPF format
    if (!validateCPF(cpf)) {
      logger.warn({ cpf }, 'Invalid CPF format');
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Invalid CPF format',
        }),
      };
    }

    // Step 2: Check if client exists in database
    const client = await getClientByCPF(cpf);
    if (!client || client.id !== parseInt(clientId, 10)) {
      logger.warn({ cpf, clientId }, 'Client not found or ID mismatch');
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          message: 'Client not found',
        }),
      };
    }

    // Step 3: Check if client is active
    const isActive = await isClientActive(client.id);
    if (!isActive) {
      logger.warn({ clientId: client.id }, 'Client is not active');
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          message: 'Client is not active',
        }),
      };
    }

    // Step 4: Generate JWT token
    const tokenData = generateToken(client);

    logger.info({ clientId: client.id }, 'Authentication successful');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        token: tokenData.token,
        expiresIn: tokenData.expiresIn,
        type: tokenData.type,
        clientId: client.id,
      }),
    };
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Authentication error');
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
    };
  }
};

module.exports = { lambdaHandler: authenticate };
