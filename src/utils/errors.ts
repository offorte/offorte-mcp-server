import { UserError } from 'fastmcp';
import { logError } from './logging.js';

const MESSAGES = {
	invalidApiResponse: 'The API response did not match the expected format.',
};

export const message = (type: keyof typeof MESSAGES) => {
	return `Error: ${MESSAGES[type]}`;
};

export const throwApiInvalidResponseError = (error: unknown) => {
	const msg = message('invalidApiResponse');
	logError(msg, JSON.stringify(error));
	throw new UserError(msg);
};
