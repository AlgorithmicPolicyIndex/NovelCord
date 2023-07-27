import { Client, Collection, ChannelType, ChatInputCommandInteraction, CacheType, GuildMember, Role } from "discord.js";
import path = require("path");
import * as fs from "fs";
import { config } from "dotenv";
import { agreementExists } from "./database/usragmt";
config({path: `$${__dirname}/secrets/.env` });

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
	// TODO: Make optional?
	const server = c.guilds.cache.get(process.env.server as string);
	const errorChannel = server?.channels.cache.get(process.env.channel as string);
	if (errorChannel?.type === ChannelType.GuildText) {
		// ! Remove <@${process.env.author as string}> to remove ping from errors. ! //
		return await errorChannel.send(`<@${process.env.author as string}>\n\`\`\`fix\n${err}\n\`\`\``);
	} else {
		console.log("Unable to get Error Channel.");
		return console.error(err);
	}
}

// TODO: Function to send to specified channel inside server settings DB (Moderation)

// TODO: Function for Index.ts that checks if user is in JSON DB then compares to their roles, if they do not have the role, it auto adds it.
// * (^) Allows them to use NovelCord right away if they rejoined the server.
export async function compareDBToRoles(i: ChatInputCommandInteraction<CacheType>, c: Client) {
	const userInGuild = i.guild?.members.cache.get(i.user.id) as GuildMember;
	const novelRole = userInGuild.roles.cache.find(r => r.name === "NovelUser");
	if (await agreementExists(i.user.id) && !novelRole) {
		const roleInGuild = i.guild?.roles.cache.find(r => r.name === "NovelUser");
		await userInGuild.roles.add(roleInGuild as Role).catch(async (err) => {
			await submitError(err, c);
			return i.editReply({content: "There was an error"});
		});
	}
}