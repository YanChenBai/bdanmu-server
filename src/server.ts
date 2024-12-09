import { createServer } from ".";

const port = Number(process.env.PORT || 3000);

const app = createServer({
	accessKeyID: process.env.ACCESS_KEY_ID ?? "",
	accessKeySecret: process.env.ACCESS_KEY_SECRET ?? "",
	appID: process.env.APP_ID ?? "",
	apiAccessToken: process.env.APP_KEY ?? "",
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
