/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, Method } from 'axios';
import { config } from '../config/offorte.js';
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
	try {
		const response = await axios(conf);
		return response.data;
	} catch (err: unknown) {
		const isAxiosError = axios.isAxiosError(err);

		const errorsString = isAxiosError && err.response?.data?.errors ? ` | Errors: ${JSON.stringify(err.response.data.errors)}` : '';
		throw new UserError(
			`Request failed: ${(err as any)['message'] || 'Unknown error'}${errorsString}`,
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
