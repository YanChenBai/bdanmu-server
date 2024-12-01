import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { logger } from "@tinyhttp/logger";
import { json } from "milliparsec";
import { bliOpenApiProxy } from "./requests";

const app = new App();
app.use(json());
app.use(logger()).use(
	cors({
		// origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		allowedHeaders: ["Content-Type", "Authorization"], // 允许的头部
	}),
);

app.use("*", (req, res, next) => {
	if (
		req.method !== "OPTIONS" &&
		req.path.startsWith("/v2/app/") &&
		req.headers.authorization !== process.env.API_ACCESS_TOKEN
	) {
		return void res.status(401).end();
	}

	next?.();
});

app.get("/", (_, res) => res.send("ok."));

const commonParams = {
	body: {
		app_id: Number(process.env.APP_ID),
	},
};

["/v2/app/start", "/v2/app/end"].map((path) =>
	app.post(path, (...args) => bliOpenApiProxy(...args, commonParams)),
);

["/v2/app/heartbeat", "/v2/app/batchHeartbeat"].map((path) =>
	app.post(path, bliOpenApiProxy),
);

const port = Number(process.env.PORT || 3000);

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
