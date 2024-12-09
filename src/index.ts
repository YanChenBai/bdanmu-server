import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { logger } from "@tinyhttp/logger";
import axios from "axios";
import { json } from "milliparsec";
import { createProxy, getEncodeHeader } from "./utils";

export interface ServerOptions {
	accessKeyID: string;
	accessKeySecret: string;
	appID: string;
	apiAccessToken: string;
}

export function createServer(options: ServerOptions) {
	const app = new App();

	const bliOpenRequest = axios.create({
		baseURL: "https://live-open.biliapi.com",
	});

	bliOpenRequest.interceptors.request.use((config) => {
		const headers = getEncodeHeader(
			options.accessKeyID,
			options.accessKeySecret,
			config.data,
		);

		config.headers = Object.assign(config.headers, headers);

		return config;
	});

	const bliOpenApiProxy = createProxy(bliOpenRequest);

	app.use(json());
	app.use(logger());
	app.use(
		cors({
			methods: ["GET", "POST"],
			allowedHeaders: ["Content-Type", "Authorization"], // 允许的头部
		}),
	);

	app.use("/v2/app", (req, res, next) => {
		if (
			req.method !== "OPTIONS" &&
			req.path.startsWith("/v2/app/") &&
			req.headers.authorization !== options.apiAccessToken
		) {
			return void res.status(401).end();
		}

		next?.();
	});

	app.get("/", (_, res) => res.send("ok."));

	const commonParams = {
		body: {
			app_id: Number(options.appID),
		},
	};

	app.get("/v2/app/health", (_, res) => res.send("ok."));

	const switchRoute = ["/v2/app/start", "/v2/app/end"];

	switchRoute.map((path) =>
		app.post(path, (...args) => bliOpenApiProxy(...args, commonParams)),
	);

	const heartbeatRoute = ["/v2/app/heartbeat", "/v2/app/batchHeartbeat"];

	heartbeatRoute.map((path) => app.post(path, bliOpenApiProxy));

	return app;
}
