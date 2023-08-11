import { Client, Collection, ChannelType, ChatInputCommandInteraction, CacheType, GuildMember, Role, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import path = require("path");
import * as fs from "fs";
import { config } from "dotenv";
import { agreementExists } from "./database/usragmt";
config({ path: `$${__dirname}/secrets/.env` });

export async function defineCommands(c: Client) {
	c.commands = new Collection();
	const cmdPath = path.join(__dirname, "commands");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith(".js"));

	for (const file of cmdFiles) {
		const filePath = path.join(cmdPath, file);
		const command = await import(filePath);
		c.commands.set(command.data.name, command);
	}
}

export async function submitError(err: string, c: Client) {
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

export function createButton(id: string, label: string, style: ButtonStyle) {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style)
	);
}

// TODO: Function to send to specified channel inside server settings DB (Moderation) (server and global)
// * (^) Server: if bot is invited to more than one server, each server will have a specified channel for interactions
// * (^) Global: ALL interactions go to the main channel, labeled in the .env.
// ! The bot hoster is given permission to control wether or not someone can use the bot, as it uses their NovelAi account.
// ! If the server doesn't ban a user, but the bot hoster does, the user is perma banned from using that instance of the bot, regardless of server.

// * Function for Index.ts that checks if user is in JSON DB then compares to their roles, if they do not have the role, it auto adds it.
// * (^) Allows them to use NovelCord right away if they rejoined the server.
export async function compareDBToRoles(i: ChatInputCommandInteraction<CacheType>, c: Client) {
	const userInGuild = i.guild?.members.cache.get(i.user.id) as GuildMember;
	const novelRole = userInGuild.roles.cache.find(r => r.name === "NovelUser");
	if (await agreementExists(i.user.id, i.guild?.id as string) && !novelRole) {
		const roleInGuild = i.guild?.roles.cache.find(r => r.name === "NovelUser");
		await userInGuild.roles.add(roleInGuild as Role).catch(async (err) => {
			await submitError(err, c);
			return i.editReply({ content: "There was an error" });
		});
	}
}