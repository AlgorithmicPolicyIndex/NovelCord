import { CacheType, ChannelType, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

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
		const NovelChannel = i.options.getChannel("novel-channel");
		// Add more settings, as it comes

		if (NovelChannel?.type == ChannelType.GuildText) {
			return i.reply({
				content: "This selection is not a text channel. Please retry with a Text Channel.",
				ephemeral: true
			});
		}

	}
};