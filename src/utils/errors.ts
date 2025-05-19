const MESSAGES = {
	invalidApiResponse: 'The API response did not match the expected format.',
};

export const message = (type: keyof typeof MESSAGES) => {
	return `Error: ${MESSAGES[type]}`;
};
