import { UserError } from 'fastmcp';

const MESSAGES = {
	invalidApiResponse: 'The API response did not match the expected format.',
};

export const message = (type: keyof typeof MESSAGES) => {
	return `Error: ${MESSAGES[type]}`;
};

export const throwApiInvalidResponseError = (error: unknown) => {
	const msg = message('invalidApiResponse');
	throw new UserError(`${msg}: ${String(error)}`);
};
