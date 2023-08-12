import { ButtonStyle, CacheType, Client, ChatInputCommandInteraction, ComponentType, EmbedBuilder, GuildMember, Role, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { Agreement } from "../database/usragmt";
import { submitError, createButton } from "../functions";

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
			await Agreement(i.user.id as string, i.guild?.id as string);
			return;
		}

		// ? Feel free to add another embed for rules, if you want to specify that directly. Or create a command, up to you.
		// ? If you create a new embed, make sure to add it to the msg var in `embeds: [embed, your_embed]`
		const embed = new EmbedBuilder({
			title: "NovelCord Agreement",
			description: "By selecting Agree, you agree to:",
			fields: [{
				name: "Moderation",
				value: "All interactions with the bot, will be viewed by the Moderators of the server and the owner of this bot instance.\nThis means, if you are banned by the owner, you cannot use this instance of the bot, regardless of the server you are in. `ie. Global vs. Local banning`"
			},{
				name: "Content",
				value: "That the NovelAi will generate content that may not be suitable for you or others."
			},{
				name: "NovelAi Itself",
				value: "This bot is not affiliated with NovelAi. As such, anything can happen. The person hosting this bot, is using their personal account or a dedicated account for the bot. Their rules will be further set, if any."
			}],
			author: { name: "KayleePhoto" }
		});

		const msg = await i.reply({
			embeds: [embed],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					createButton("agree", "Agree", ButtonStyle.Success),
					createButton("disagree", "Disagree", ButtonStyle.Danger)
				)
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
								description: "You should be able to see the NovelCord Commands now, with the dedicated role \"NovelUser\".",
								author: { name: "Kaylee" }
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
							description: "If you ever want to change your mind, you can run this command again.",
							author: { name: "Kaylee" }
						})
					],
					components: []
				});
				return collector.stop();
			}
		});
	}
};