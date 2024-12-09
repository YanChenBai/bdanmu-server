require("dotenv").config();

/**
 * @type {import('pm2').StartOptions[]}
 */
const apps = [
	{
		name: "BdanmuServer",
		script: "src/server.ts",
		interpreter: "bun",
		env: process.env,
	},
];

module.exports = {
	apps,
};
