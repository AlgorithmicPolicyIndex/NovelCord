import { PermissionFlagsBits, ChatInputCommandInteraction, Client, SlashCommandBuilder, CacheType } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server-config")
		.setDescription("Set server related settings")
		.addChannelOption(o => 
			o.setName("novel-channel")
				.setDescription("Select the channel NovelCord is used.")
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		// Don't worry about mod channel, it is stored inside the Bot's .env file as channel
		
	}
};