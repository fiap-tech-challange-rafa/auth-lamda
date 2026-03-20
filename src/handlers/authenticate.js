const logger = require('../utils/logger');

const authenticate = async (event) => {
  const payload = typeof event?.body === 'string' ? JSON.parse(event.body) : (event?.body || event || {});
  const { cpf, clientId } = payload;

  logger.info(`Authenticate request received for clientId=${clientId || 'N/A'}`);

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
      logger.warn(`Invalid CPF format for value=${cpf}`);
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
    if (!client || Number(client.id) !== Number(clientId)) {
      logger.warn(`Client not found or ID mismatch for cpf=${cpf} and clientId=${clientId}`);
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
      logger.warn(`Client is not active. clientId=${client.id}`);
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

    logger.info(`Authentication successful. clientId=${client.id}`);

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
    logger.error(`Authentication error: ${error.message}`);
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

