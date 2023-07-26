import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction, Client } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("List all current commands."),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		console.log(i, c);
	}
};