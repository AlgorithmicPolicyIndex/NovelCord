import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, Client, ChatInputCommandInteraction, ComponentType, EmbedBuilder, GuildMember, Role, SlashCommandBuilder } from "discord.js";
import { Agreement } from "../database/usragmt";
import { submitError } from "../functions";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("user-agreement")
		.setDescription("Agree to the NovelCord warning.")
		.setDMPermission(false),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		const userInGuild = i.guild?.members.cache.get(i.user.id) as GuildMember;
		const roleInGuild = i.guild?.roles.cache.find(r => r.name === "NovelUser") as Role;

		if (userInGuild.roles.cache.find((r) => r.name === "NovelUser")) {
			i.reply("You already have the NovelUser role.");
			return;
		}

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

		const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 1000 * 30 });
		collector.on("collect", async ic => {
			if (ic.customId == "agree") {
				await Agreement(ic.user.id, i.guild?.id as string).then(async () => {
					await userInGuild.roles.add(roleInGuild).catch((err: string) => {
						submitError(err, c);
						return i.editReply("There was an error adding your role. Please wait or notify the Bot Hoster");
					});
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