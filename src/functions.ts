import { Client, Collection, ChannelType } from "discord.js";
import path = require("path");
import * as fs from "fs";
import { config } from "dotenv";
config({path: "./secrets/.env"});

export function defineCommands(c: Client) {
	c.commands = new Collection();
	const cmdPath = path.join(__dirname, "commands");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith(".js"));
	for (const file of cmdFiles) {
		const filePath = path.join(cmdPath, file);
		const command = require(filePath);
		c.commands.set(command.data.name, command);
	}
}

export async function submitError(err: any, c: Client) {
	const server		= c.guilds.cache.get(process.env.server as string);
	const errorChannel	= server?.channels.cache.get(process.env.channel as string);
	if (errorChannel?.type === ChannelType.GuildText) {
		return await errorChannel.send(`<@${process.env.author as string}>\n\`\`\`fix\n${err}\n\`\`\``);
	} else {
		console.log("Unable to get Error Channel.");
		return console.error(err);
	}
}