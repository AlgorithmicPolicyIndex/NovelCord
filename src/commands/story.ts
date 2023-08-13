/* eslint-disable no-case-declarations */
// ! I DONT LIKE THIS, BUT I'M NOT REALLY WANTING TO DO OPTION HANDLING OUTSIDE THE SWITCH BECAUSE MOST OPTIONS WILL NOT BE USED
import { CacheType, SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { Options, PythonShell } from "python-shell";
import { createButton, submitError } from "../functions";

let currentPage = 0;
let TotalStories = 0;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("story")
		.setDescription("Interact with a NovelAi Story.")
		.setDMPermission(false)
		.addSubcommand(sc =>
			sc.setName("list")
				.setDescription("List all viewable stories.")
				.addStringOption(o =>
					o.setName("filters")
						.setDescription("View stories based on filters")	
				)
		),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		// ! Python-Shell is more than likely not the best way to handle this, but it's what I'm using
		// ! I refer to print as my return value. When I call `return print` it is expected to close and return straight to Typescript with no other results.
		const options: Options = {
			mode: "text",
			scriptPath: "python"
		};

		switch (i.options.getSubcommand()) {
		case "list":
			// ! I hate this code, but I have to deal with it.
			let stories: {name: string, id: string}[] = [];
			options.args = ["list"];
			await PythonShell.run("handler.py", options).then(results => {
				TotalStories = results.splice(0, 1)[0];
				for (const story of results) {
					stories.push(JSON.parse(story));
				}
			}).catch(e => {
				i.reply("There was an error getting the stories.");
				return submitError(e, c, "Story.ts; List; Python err:");
			});

			// TODO: Make collector to handle pages and selection of stories
			// options.args = ["list", (offset)] // Starts at 0-7, +8 for next page 9-15
			const msg = await i.reply({
				embeds: [new EmbedBuilder({
					title: "Stories",
					// Edit Page when changing pages
					description: `**Page**: 1/${Math.floor(TotalStories/6)}\n**Filters**: (add in code filters functionality)\n**Current Story**: (insert name and id)`, 
					fields: stories.map((story, v) => {
						return { name: `${v+1}:\n${story.name}`, value: story.id, inline: true };
					}),
					footer: { text: "Time: 1 minute and 30 seconds" }
				})],
				components: await createStoryPageComponents(stories),
				ephemeral: true, fetchReply: true
			});

			const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 90 * 1000 });
			collector.on("collect", async ic => {
				ic.deferUpdate();
				switch (ic.customId) {
				// ! There probably is a better way of doing this, but for now, like most new things for this prototype testing, it works for now.
				//#region 
				case "s-1":
					break;
				case "s-2":
					break;
				case "s-3":
					break;
				case "s-4":
					break;
				case "s-5":
					break;
				case "s-6":
					break;
				case "s-7":
					break;
				case "s-8":
					break;
					//#endregion

				case "prev":
					currentPage = currentPage - 6;
					options.args = ["list", currentPage.toString()];
					stories = [];
					await PythonShell.run("handler.py", options).then(results => {
						TotalStories = results.splice(0, 1)[0];
						for (const story of results) {
							stories.push(JSON.parse(story));
						}
					}).catch(e => {
						i.editReply("There was an error getting the stories.");
						return submitError(e, c, "Story.ts; List/Prev; Python err:");
					});
					i.editReply({
						embeds: [new EmbedBuilder({
							title: "Stories",
							description: `**Page**: ${(currentPage/6) + 1}/${Math.floor(TotalStories/6)}\n**Filters**: (add in code filters functionality)\n**Current Story**: (insert name and id)`, 
							fields: stories.map((story, v) => {
								return { name: `${v+1}:\n${story.name}`, value: story.id, inline: true };
							}),
							footer: { text: "Time: 1 minute and 30 seconds" }
						}),],
						components: await createStoryPageComponents(stories)
					});
					return collector.resetTimer({ time: 90 * 1000 });
				case "next":
					currentPage = currentPage + 6;
					options.args = ["list", currentPage.toString()];
					stories = [];
					await PythonShell.run("handler.py", options).then(results => {
						TotalStories = results.splice(0, 1)[0];
						for (const story of results) {
							stories.push(JSON.parse(story));
						}
					}).catch(e => {
						i.editReply("There was an error getting the stories.");
						return submitError(e, c, "Story.ts; List/Next; Python err:");
					});
					i.editReply({
						embeds: [new EmbedBuilder({
							title: "Stories",
							description: `**Page**: ${(currentPage/6) + 1}/${Math.floor(TotalStories/6)}\n**Filters**: (add in code filters functionality)\n**Current Story**: (insert name and id)`, 
							fields: stories.map((story, v) => {
								return { name: `${v+1}:\n${story.name}`, value: story.id, inline: true };
							}),
							footer: { text: "Time: 1 minute and 30 seconds" }
						}),],
						components: await createStoryPageComponents(stories)
					});
					return collector.resetTimer({ time: 90 * 1000 });
				}
			});
			return;
		}
	}
};


async function createStoryPageComponents(stories: {name: string, id: string}[]) {
	const buttons1 = [];
	const buttons2 = [];
	for (const i in stories) {
		// ! There is 100% a better way, but PROTOTYPES. WEE, BAD CODE GO BRR
		// TODO: Edge case for when stories array is smaller than 6. so previous and next are always present.
		if (parseInt(i) < 4) {
			buttons1.push(createButton(`s-${parseInt(i)+1}`, `Story ${parseInt(i)+1}`, ButtonStyle.Primary));
		} else if (i === "4") { // Grab the 4th story
			buttons2.push(createButton("prev", "Previous", ButtonStyle.Secondary).setDisabled(currentPage === 0 ? true : false));
			buttons2.push(createButton(`s-${parseInt(i)+1}`, `Story ${parseInt(i)+1}`, ButtonStyle.Primary));
		} else if (i === "5") { // Grab the 5th story
			buttons2.push(createButton(`s-${parseInt(i)+1}`, `Story ${parseInt(i)+1}`, ButtonStyle.Primary));
			buttons2.push(createButton("next", "Next", ButtonStyle.Secondary).setDisabled(currentPage === TotalStories ? true : false));
		}
	}
	return [new ActionRowBuilder<ButtonBuilder>().addComponents(
		buttons1
	), new ActionRowBuilder<ButtonBuilder>().addComponents(
		buttons2
	)];
}