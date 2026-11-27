const MESSAGES = {
	invalidApiResponse: 'The API response did not match the expected format.',
};

/**
 * An error whose message is meant for the agent. The tool result shows the message as it is, and `extras` as structured content.
 * Any other error gets the prefix "Tool '<name>' execution failed: ".
 */
export class UserError extends Error {
	constructor(
		message: string,
		readonly extras?: Record<string, unknown>,
	) {
		super(message);
		this.name = 'UserError';
	}
}

export const message = (type: keyof typeof MESSAGES) => {
	return `Error: ${MESSAGES[type]}`;
};

export const throwApiInvalidResponseError = (error: unknown) => {
	const msg = message('invalidApiResponse');
	throw new UserError(`${msg}: ${String(error)}`);
};
