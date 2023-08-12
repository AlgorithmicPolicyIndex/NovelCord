import { APIEmbedField, ButtonStyle, CacheType, ChannelType, ChatInputCommandInteraction, Client, ComponentType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getSettings, settings, settingsExist } from "../database/server";
import { createButton, submitError } from "../functions";

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
		const settingsExistinDB = await settingsExist(i.guild?.id as string);
		// Add more settings, as it comes

		if (NovelChannel?.type != ChannelType.GuildText || ModChannel?.type != ChannelType.GuildText) {
			return i.reply({
				content: "Either the Mod Channel or Novel Channel is not a text channel. Please retry with a Text Channel.",
				ephemeral: true
			});
		}

		// ! If settings do not exist, get required channels and create settings
		if (!settingsExistinDB) {
			if (!NovelChannel && !ModChannel) {
				return i.reply({
					content: "Please add a Novel Channel and Mod Channel to create settings.",
					ephemeral: true
				});
			}
			await settings(i.guild?.id as string, { NovelChannel: NovelChannel.id, ModChannel: ModChannel.id }).then(() => {
				return i.reply({
					embeds: [new EmbedBuilder({
						title: "Settings",
						description: "Creating Settings",
						fields: [{
							name: "Novel Channel",
							value: `${NovelChannel}`
						},{
							name: "Mod Channel",
							value: `${ModChannel}`
						}]
					})],
					ephemeral: true
				});
			}).catch((err: string) => {
				i.reply("There was an error creating the new settings entry");
				return submitError(err, c);
			});
		}
		const settingsData = await getSettings(i.guild?.id as string);
		// ! If for whatever reason, the settings already exist, check if the DB has those channels set.
		if (!settingsData.NovelChannel || !settingsData.ModChannel) {
			return i.reply({
				embeds: [new EmbedBuilder({
					title: "Settings",
					description: "Missing Required Channels",
					fields: [{
						name: "Novel Channel",
						// TODO: Change this so it compares to a real channel in the server.
						// TODO: To prevent editing of the DB and replying a channel that doesn't exist.
						value: settingsData.NovelChannel ? settingsData.NovelChannel : "No channel set."
					},{
						name: "Mod Channel",
						value: settingsData.ModChannel ? settingsData.ModChannel : "No channel set."
					}],
					footer: { text: "Channels are not marked as required, to provide ease of use, so you dont have to \"reset\" the channel when you update the settings, however you can update them if you wish, but just passing them in. Otherwise, leave it blank." }
				})], ephemeral: true
			});
		}
		
		const message = await i.reply({
			embeds: [new EmbedBuilder({
				title: "Settings",
				description: "Updating Settings\n\n**Are you sure?**",
			})],
			components: [
				createButton("agree", "Yes", ButtonStyle.Success),
				createButton("disagree", "No", ButtonStyle.Danger)
			], ephemeral: true, fetchReply: true
		});
		// TODO: make confirmation collector
		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30 * 1000 });
		collector.on("collect", async ic => {
			if (ic.customId == "agree") {
				// ! Not the best code for what I want, but it seems to work.
				const options = { NovelChannel: NovelChannel.id, ModChannel: ModChannel.id };
				for (const option in options) {
					if (option == undefined || option == null) {
						delete options[option];
					}
				}

				await settings(i.guild?.id as string, options).then(async () => {
					const fields: APIEmbedField[] = [];
					// ! Not the best way to do it, I know. I can map it directly in the fields on the builder, but I dont remember how to do that. I'll look into it.
					await getSettings(i.guild?.id as string).then(settingsoptions => {
						for (const set in settingsoptions) {
							fields.push({ name: set, value: settingsoptions[set] });
						}
					});
					i.editReply({
						embeds: [new EmbedBuilder({
							title: "Settings",
							description: "Creating Settings",
							fields: fields
						})],
						components: []
					});
					return collector.stop();
				}).catch((err: string) => {
					return submitError(err, c);
				});
			} else if (ic.customId == "disagree") {
				i.editReply({
					embeds: [new EmbedBuilder({
						title: "Settings",
						description: "Canceled."
					})],
					components: []
				});
				return collector.stop();
			}
		});
	}
};