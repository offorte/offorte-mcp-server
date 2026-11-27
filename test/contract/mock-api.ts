import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

export interface RecordedRequest {
	method: string;
	path: string;
	query: Record<string, string>;
	body: unknown;
	authorization: string | undefined;
}

export interface MockAnswer {
	status?: number;
	body?: unknown;
	delayMs?: number;
}

export interface MockApi {
	origin: string;
	apiHost: string;
	requests: RecordedRequest[];
	/** Answers for the next requests, in order. A request without a queued answer gets 200 with {}. */
	queue(answers: MockAnswer[]): void;
	/** Builds the answer from the request. Wins over queued answers. */
	respond: ((request: RecordedRequest) => MockAnswer) | undefined;
	beforeAnswer: ((request: RecordedRequest) => Promise<void>) | undefined;
	/** Requests whose client went away before the answer was sent */
	aborted: RecordedRequest[];
	reset(): void;
	close(): Promise<void>;
}

const API_PREFIX = '/api/v2/';

function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		req.on('data', (chunk: Buffer) => chunks.push(chunk));
		req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
		req.on('error', reject);
	});
}

function parseBody(text: string): unknown {
	if (text === '') {
		return undefined;
	}
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

export async function startMockApi(): Promise<MockApi> {
	let answers: MockAnswer[] = [];

	const api: MockApi = {
		origin: '',
		apiHost: '',
		requests: [],
		aborted: [],
		beforeAnswer: undefined,
		respond: undefined,
		queue(next) {
			answers = [...next];
		},
		reset() {
			answers = [];
			api.requests = [];
			api.aborted = [];
			api.beforeAnswer = undefined;
			api.respond = undefined;
		},
		close() {
			return new Promise((resolve) => {
				server.closeAllConnections();
				server.close(() => resolve());
			});
		},
	};

	const server: Server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
		const url = new URL(req.url ?? '/', 'http://mock');
		const recorded: RecordedRequest = {
			method: req.method ?? 'GET',
			path: url.pathname,
			query: Object.fromEntries(url.searchParams),
			body: parseBody(await readBody(req)),
			authorization: req.headers.authorization,
		};
		api.requests.push(recorded);

		let clientGone = false;
		res.on('close', () => {
			if (!res.writableFinished) {
				clientGone = true;
				api.aborted.push(recorded);
			}
		});

		const answer = api.respond?.(recorded) ?? answers.shift() ?? { status: 200, body: {} };

		if (api.beforeAnswer) {
			await api.beforeAnswer(recorded);
		}
		if (answer.delayMs) {
			await new Promise((resolve) => setTimeout(resolve, answer.delayMs));
		}
		if (clientGone) {
			return;
		}

		res.writeHead(answer.status ?? 200, { 'Content-Type': 'application/json' });
		res.end(answer.body === undefined ? '' : JSON.stringify(answer.body));
	});

	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	const { port } = server.address() as AddressInfo;
	api.origin = `http://127.0.0.1:${port}`;
	api.apiHost = `${api.origin}${API_PREFIX}`;

	return api;
}
