import type { NextFunction, Request, Response } from "@tinyhttp/app";
import axios, { type AxiosInstance, type AxiosRequestHeaders } from "axios";
import { getEncodeHeader } from "./utils";

type FixedData = {
	query?: Record<string, any>;
	body?: Record<string, any>;
};

const SERVER_ERROR = {
	code: 50000,
	msg: "请求失败",
	message: "请求失败",
	data: null,
};

export function createProxy(instance: AxiosInstance) {
	return (
		req: Request,
		res: Response,
		next?: NextFunction,
		fixedData?: FixedData,
	) => {
		const query = Object.assign(fixedData?.query ?? {}, req.query ?? {});
		const body = Object.assign(fixedData?.body ?? {}, req.body ?? {});

		instance({
			url: req.path,
			method: req.method,
			params: query,
			data: body,
		})
			.then((resp) => res.json(resp.data))
			.catch(() => res.status(500).json(SERVER_ERROR));
	};
}

export const bliveRequest = axios.create({
	baseURL: "https://api.live.bilibili.com",
});

export const bliOpenRequest = axios.create({
	baseURL: "https://live-open.biliapi.com",
});

bliOpenRequest.interceptors.request.use((config) => {
	const headers = getEncodeHeader(
		process.env.APP_KEY,
		process.env.APP_SECRET,
		config.data,
	);

	config.headers = Object.assign(config.headers, headers);

	return config;
});

export const bliveApiProxy = createProxy(bliveRequest);
export const bliOpenApiProxy = createProxy(bliOpenRequest);
