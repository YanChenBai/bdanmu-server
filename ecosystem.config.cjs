require("dotenv").config();

/**
 * @type {import('pm2').StartOptions[]}
 */
const apps = [
	{
		name: "BdanmuServer",
		script: "src/index.ts",
		interpreter: "bun",
		env: process.env,
	},
];

module.exports = {
	apps,
};
