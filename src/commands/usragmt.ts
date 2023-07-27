import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Agreement } from "../database/usragmt";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("user-agreement")
		.setDescription("Agree to the NovelCord warning."),
	async execute(i: ChatInputCommandInteraction<CacheType>) {

		const embed = new EmbedBuilder({
			title: "NovelCord Agreement",
			description: "By selecting Agree, you agree to:",
			fields: [{
				name: "Moderation",
				value: "All interactions with the bot, will be viewed by the Moderators of the server"
			},{
				name: "Content",
				value: "That the NovelAi will generate content that may not be suitable for you or others."
			},{
				name: "NovelAi Itself",
				value: "This bot is not affiliated with NovelAi. As such, anything can happen. The person hosting this bot, is using their personal account or a dedicated account for the bot. Their rules will be further set, if any."
			}],
			author: {name: "KayleePhoto"}
		});

		const createButton: any = (id: string, label: string, style: ButtonStyle) => {
			return new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style)
			);
		};

		const msg = await i.reply({
			embeds: [embed],
			components: [
				createButton("agree", "Agree", ButtonStyle.Success),
				createButton("disagree", "Disagree", ButtonStyle.Danger)
			],
			ephemeral: true, fetchReply: true
		});

		const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 1000 * 10});
		collector.on("collect", async ic => {
			if (ic.customId == "agree") {
				/** 
				 * TODO: Make check for user in DB, but dont have role.
				 ** (^) in case of user rejoining server
				 * TODO: Add role to user before stopping collector.
				*/
				await Agreement(ic.user.id).then(async () => {
					await i.editReply({
						embeds: [
							new EmbedBuilder({
								title: "Thank you for agreeing to NovelCord Agreement.",
								description: "You should be able to see the NovelCord Commands now, with the dedicated role \"NovelUser\"."
							})
						],
						components: []
					});
					return collector.stop();
				});
			} else if (ic.customId == "disagree") {
				await i.editReply({
					embeds: [
						new EmbedBuilder({
							title: "Thank you for taking the time to read this.",
							description: "If you ever want to change your mind, you can run this command again."
						})
					],
					components: []
				});
				return collector.stop();
			}
		});
	}
};