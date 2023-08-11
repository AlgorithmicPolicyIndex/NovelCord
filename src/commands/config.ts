import { CacheType, ChannelType, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getSettings } from "../database/server";
import { submitError } from "../functions";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server-config")
		.setDescription("Set server related settings")
		.addChannelOption(o => 
			o.setName("mod-channel")
				.setDescription("Select the mod channel for this server.")
				.setRequired(false)
		)
		.addChannelOption(o => 
			o.setName("novel-channel")
				.setDescription("Select the channel NovelCord is used.")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		const ModChannel = i.options.getChannel("mod-channel"); // * local mod channel
		const NovelChannel = i.options.getChannel("novel-channel");
		// Add more settings, as it comes

		if (NovelChannel?.type != ChannelType.GuildText || ModChannel?.type != ChannelType.GuildText) {
			return i.reply({
				content: "Either the Mod Channel or Novel Channel is not a text channel. Please retry with a Text Channel.",
				ephemeral: true
			});
		}

		const settings = await getSettings(i.guild?.id as string);
		// TODO: Move All options into a var, see await settings for obvious reason why.

		if (!settings) {
			// ! I personally don't like this, as it's not what I want.
			// ! I personally want to create a bare bones version, but this will do for now.
			await settings(i.guild?.id as string, { NovelChannel: NovelChannel.id, ModChannel: ModChannel.id }).then(() => {
				return i.reply("something something, I want a embed to show all options set.");
			}).catch((e) => {
				return submitError(e, c);
			});
		}

		if (!settings.NovelChannel || !settings.ModChannel) {
			return i.reply({
				embeds: [new EmbedBuilder({
					title: "Settings",
					description: "Missing Required Channels",
					fields: [{
						name: "Novel Channel",
						value: settings.NovelChannel ? settings.NovelChannel : "No channel set."
					},{
						name: "Mod Channel",
						value: settings.ModChannel ? settings.ModChannel : "No channel set."
					}],
					footer: { text: "Channels are not marked as required, to provide ease of use, so you dont have to \"reset\" the channel when you update the settings, however you can update them if you wish, but just passing them in. Otherwise, leave it blank." }
				})]
			});
		}
		

		// ! I want the `await settings` here, as it is to override 

		// TODO: make confirmation collector
		// TODO: Embed when finished that lists all current settings
	}
};