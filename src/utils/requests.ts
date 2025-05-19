import axios, { AxiosRequestConfig, Method } from 'axios';
import { config } from '../config/offorte.js';
import { logInfo, logError } from './logging.js';
import { UserError } from 'fastmcp';

interface RequestOptions {
	url: string;
	method?: Method;
	data?: unknown;
	params?: Record<string, unknown>;
	headers?: Record<string, string>;
}

function buildUrl(url: string): string {
	if (/^https?:\/\//i.test(url)) {
		return url;
	}
	return `${config.apiUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

export async function request({ url, method = 'GET', data, params, headers = {} }: RequestOptions) {
	const conf: AxiosRequestConfig = {
		url: buildUrl(url),
		method,
		data,
		params,
		headers: {
			Authorization: config.apiKey,
			Accept: 'application/json',
			...headers,
		},
	};
	logInfo('Request', { method, url: conf.url, data, params, headers: conf.headers });
	try {
		const response = await axios(conf);
		logInfo('Response', { method, url: conf.url, status: response.status, data: response.data });
		return response.data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			logError('AxiosError', {
				method,
				url: conf.url,
				status: err.response?.status,
				statusText: err.response?.statusText,
				data: err.response?.data,
				message: err.message,
				code: err.code,
			});
			throw new UserError(`Request failed: ${err.message}`, {
				method,
				url: conf.url,
				status: err.response?.status,
				statusText: err.response?.statusText,
				data: err.response?.data,
				code: err.code,
			});
		}
		logError('Unknown error', err);
		throw err;
	}
}

export function get(url: string, options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {}) {
	return request({ url, method: 'GET', ...options });
}

export function post(url: string, data?: unknown, options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {}) {
	return request({ url, method: 'POST', data, ...options });
}

export function put(url: string, data?: unknown, options: Omit<RequestOptions, 'url' | 'method' | 'data'> = {}) {
	return request({ url, method: 'PUT', data, ...options });
}
