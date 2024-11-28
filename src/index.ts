import { App, type Request, type Response } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { logger } from "@tinyhttp/logger";
import { bliOpenApiProxy, bliveApiProxy } from "./requests";

const app = new App();

app.use(logger()).use(
	cors({
		origin: "*",
		methods: ["GET", "POST"],
	}),
);

app.get("/", (_, res) => res.send("ok."));

app.get("/room/v1/Danmu/getConf", (...args) =>
	bliveApiProxy(...args, {
		query: {
			platform: "pc",
			player: "web",
		},
	}),
);

app.get("/room/v1/Room/mobileRoomInit", bliveApiProxy);

app.post("/v2/app/start", bliOpenApiProxy);
app.post("/v2/app/end", bliOpenApiProxy);
app.post("/v2/app/heartbeat", bliOpenApiProxy);
app.post("/v2/app/batchHeartbeat", bliOpenApiProxy);

app.listen(3000, () => console.log("Listening on http://localhost:3000"));
