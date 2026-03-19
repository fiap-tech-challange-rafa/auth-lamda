const logger = require('../utils/logger');

const validateCPF = (cpf) => {
  // Remove non-numeric characters
  cpf = cpf.replace(/\D/g, '');

  // Check if it has 11 digits
  if (cpf.length !== 11) {
    logger.warn(`Invalid CPF format: ${cpf}`);
    return false;
  }

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cpf)) {
    logger.warn(`CPF with all same digits: ${cpf}`);
    return false;
  }

  // Validate first digit
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
  }

  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cpf.substring(9, 10), 10)) {
    logger.warn(`Invalid CPF first digit: ${cpf}`);
    return false;
  }

  // Validate second digit
  sum = 0;

  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
  }

  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cpf.substring(10, 11), 10)) {
    logger.warn(`Invalid CPF second digit: ${cpf}`);
    return false;
  }

  logger.info(`Valid CPF: ${cpf}`);
  return true;
};

module.exports = { validateCPF };
