import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "@tinyhttp/app";
import type { AxiosInstance } from "axios";

/**
 * 鉴权加密
 */
export function getEncodeHeader(
	appKey: string,
	appSecret: string,
	params = {},
) {
	const timestamp = Number.parseInt(`${Date.now() / 1000}`);
	const nonce = Number.parseInt(`${Math.random() * 100000}`) + timestamp;
	const header = {
		"x-bili-accesskeyid": appKey,
		"x-bili-content-md5": getMd5Content(JSON.stringify(params)),
		"x-bili-signature-method": "HMAC-SHA256",
		"x-bili-signature-nonce": `${nonce}`,
		"x-bili-signature-version": "1.0",
		"x-bili-timestamp": timestamp,
	};
	const data: Array<string | number> = [];

	for (const key in header) {
		data.push(`${key}:${header[key as keyof typeof header]}`);
	}

	const signature = crypto
		.createHmac("sha256", appSecret)
		.update(data.join("\n"))
		.digest("hex");

	return {
		Accept: "application/json",
		"Content-Type": "application/json",
		...header,
		Authorization: signature,
	};
}

/**
 * MD5加密
 * @param {*} str
 * @returns
 */
export function getMd5Content(str: string) {
	return crypto.createHash("md5").update(str).digest("hex");
}

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
		_next?: NextFunction,
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
