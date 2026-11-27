/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, Method } from 'axios';
import type { z } from 'zod';
import { UserError } from './errors.js';

export interface OfforteCredentials {
	accountName: string;
	apiKey: string;
}

export interface OfforteApiOptions extends OfforteCredentials {
	apiHost: string;
	timeoutMs: number;
	signal?: AbortSignal;
}

interface RequestOptions {
	url: string;
	method?: Method;
	data?: unknown;
	params?: Record<string, unknown>;
	headers?: Record<string, string>;
}

type ReadOptions = Omit<RequestOptions, 'url' | 'method' | 'data'>;

export interface OfforteApi {
	request(options: RequestOptions): Promise<any>;
	get(url: string, options?: ReadOptions): Promise<any>;
	post(url: string, data?: unknown, options?: ReadOptions): Promise<any>;
	put(url: string, data?: unknown, options?: ReadOptions): Promise<any>;
	patch(url: string, data?: unknown, options?: ReadOptions): Promise<any>;
	/**
	 * Reads a record after a successful write. A failed read must not look like a failed write, or the agent repeats the write.
	 * `saved` names what was saved, for example "The proposal change".
	 */
	getAfterWrite<T extends z.ZodType>(url: string, schema: T, saved: string): Promise<z.output<T>>;
}

const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// The gateway only accepts `Bearer <key>`. Keep a key that already has the prefix as it is.
function authorizationHeader(apiKey: string): string {
	const key = apiKey.trim();
	return /^bearer\s/i.test(key) ? key : `Bearer ${key}`;
}

/**
 * An Offorte API client for one set of credentials. Create one per request, so a call can never use the account of another request.
 */
export function createOfforteApi({ apiHost, accountName, apiKey, timeoutMs, signal }: OfforteApiOptions): OfforteApi {
	// The account name is always exactly one path segment
	const apiUrl = `${apiHost}${encodeURIComponent(accountName)}`;

	function buildUrl(url: string): string {
		if (/^https?:\/\//i.test(url)) {
			return url;
		}
		return `${apiUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
	}

	function failureMessage(err: unknown, method: Method, timedOut: boolean): string {
		if (timedOut) {
			const writeNotice = READ_METHODS.includes(method.toUpperCase())
				? ''
				: ' The change may have been saved. Check the current state before you repeat this call.';
			return `Request failed: The Offorte API did not answer within ${timeoutMs / 1000} seconds.${writeNotice}`;
		}

		const isAxiosError = axios.isAxiosError(err);
		// The Offorte public API never sends 429. The gateway sends it before the call runs, so nothing was saved
		if (isAxiosError && err.response?.status === 429) {
			return 'Request failed: The Offorte API got too many requests (status 429). Wait a few seconds before the next call, and run tool calls one after the other, not at the same time.';
		}
		const errorsString = isAxiosError && err.response?.data?.errors ? ` | Errors: ${JSON.stringify(err.response.data.errors)}` : '';
		return `Request failed: ${(err as any)['message'] || 'Unknown error'}${errorsString}`;
	}

	async function request({ url, method = 'GET', data, params, headers = {} }: RequestOptions) {
		// Not AbortSignal.timeout(): its timer would stay alive for the full timeout after the call ends
		const timeout = new AbortController();
		const timer = setTimeout(() => timeout.abort(), timeoutMs);
		const conf: AxiosRequestConfig = {
			url: buildUrl(url),
			method,
			data,
			params,
			headers: {
				Authorization: authorizationHeader(apiKey),
				Accept: 'application/json',
				...headers,
			},
			signal: signal ? AbortSignal.any([signal, timeout.signal]) : timeout.signal,
		};
		try {
			const response = await axios(conf);
			return response.data;
		} catch (err: unknown) {
			const isAxiosError = axios.isAxiosError(err);
			const timedOut = timeout.signal.aborted && !signal?.aborted;

			throw new UserError(
				failureMessage(err, method, timedOut),
				isAxiosError
					? {
							method,
							url: conf.url,
							status: err.response?.status,
							statusText: err.response?.statusText,
							data: err.response?.data,
							code: err.code,
							errors: err.response?.data?.errors,
						}
					: { err },
			);
		} finally {
			clearTimeout(timer);
		}
	}

	const get = (url: string, options: ReadOptions = {}) => request({ url, method: 'GET', ...options });

	return {
		request,
		get,
		post: (url, data, options = {}) => request({ url, method: 'POST', data, ...options }),
		put: (url, data, options = {}) => request({ url, method: 'PUT', data, ...options }),
		patch: (url, data, options = {}) => request({ url, method: 'PATCH', data, ...options }),
		async getAfterWrite(url, schema, saved) {
			const notice = `${saved} was saved. Do not repeat it.`;
			const result = await get(url).catch((error: Error) => {
				throw new UserError(`${notice} Reading it back failed: ${error.message}`);
			});
			const parsed = schema.safeParse(result);

			if (!parsed.success) {
				throw new UserError(`${notice} The read-back did not match the expected format: ${String(parsed.error)}`);
			}

			return parsed.data;
		},
	};
}
