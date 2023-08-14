/* eslint-disable no-case-declarations */
// ! I DONT LIKE THIS, BUT I'M NOT REALLY WANTING TO DO OPTION HANDLING OUTSIDE THE SWITCH BECAUSE MOST OPTIONS WILL NOT BE USED
import { CacheType, SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { Options, PythonShell } from "python-shell";
import { createButton, submitError } from "../functions";

// ! I personally dont like using these variables, because it's a lot of unneeded usage, personally.
// current page offset, + and - 6 for next and previous
let currentPage = 0;
// Total Story count, for max page size and next button disable
let TotalStories = 0;
// The Current amount of stories you have gone through, to be compared to Total to disable next button
let PageStories = 0;
// Last pages story amount, to make sure PageStories is correct
let LastPage = 0;

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
					PageStories++;
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
					description: `**Page**: 1/${Math.round(TotalStories/6)}\n**Filters**: (add in code filters functionality)\n**Current Story**: (insert name and id)`, 
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
				// TODO: New idea for stories
				// TODO: Write function to make custom IDs completely dynamic, for use of Story IDs, to make pass through significantly easier and less reliant on other methods, like arrays
				// * For now, I actually think I dont need this. As I can call from the Stories array and directly pull from the list. stories[0] for story 1, stories[1] for 2, so on...
				case "s-1":
					await selectStory(stories, 0, options, i, c);
					return collector.resetTimer({ time: 90 * 1000 });
				case "s-2":
					await selectStory(stories, 1, options, i, c);
					return collector.resetTimer({ time: 90 * 1000 });
				case "s-3":
					await selectStory(stories, 2, options, i, c);
					return collector.resetTimer({ time: 90 * 1000 });
				case "s-4":
					await selectStory(stories, 3, options, i, c);
					return collector.resetTimer({ time: 90 * 1000 });
				case "s-5":
					await selectStory(stories, 4, options, i, c);
					return collector.resetTimer({ time: 90 * 1000 });
				case "s-6":
					await selectStory(stories, 5, options, i, c);
					return collector.resetTimer({ time: 90 * 1000 });

				case "select":
					break;
				case "back":
					i.editReply({
						embeds: [new EmbedBuilder({
							title: "Stories",
							description: `**Page**: ${(currentPage/6) + 1}/${Math.round(TotalStories/6)}\n**Filters**: (add in code filters functionality)\n**Current Story**: (insert name and id)`, 
							fields: stories.map((story, v) => {
								return { name: `${v+1}:\n${story.name}`, value: story.id, inline: true };
							}),
							footer: { text: "Time: 1 minute and 30 seconds" }
						}),],
						components: await createStoryPageComponents(stories)
					});
					return collector.resetTimer({ time: 90 * 1000 });
				case "prev":
					currentPage = currentPage - 6;
					options.args = ["list", currentPage.toString()];
					stories = [];
					await PythonShell.run("handler.py", options).then(results => {
						TotalStories = results.splice(0, 1)[0];
						for (const story of results) {
							stories.push(JSON.parse(story));
						}
						PageStories = PageStories - LastPage;	
						LastPage = stories.length;
					}).catch(e => {
						i.editReply("There was an error getting the stories.");
						return submitError(e, c, "Story.ts; List/Prev; Python err:");
					});
					i.editReply({
						embeds: [new EmbedBuilder({
							title: "Stories",
							description: `**Page**: ${(currentPage/6) + 1}/${Math.round(TotalStories/6)}\n**Filters**: (add in code filters functionality)\n**Current Story**: (insert name and id)`, 
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
							PageStories++;
						}
						LastPage = stories.length;
					}).catch(e => {
						i.editReply("There was an error getting the stories.");
						return submitError(e, c, "Story.ts; List/Next; Python err:");
					});
					i.editReply({
						embeds: [new EmbedBuilder({
							title: "Stories",
							description: `**Page**: ${(currentPage/6) + 1}/${Math.round(TotalStories/6)}\n**Filters**: (add in code filters functionality)\n**Current Story**: (insert name and id)`, 
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

async function selectStory(stories: { id: string; }[], index: number, options: Options, i: ChatInputCommandInteraction<CacheType>, c: Client) {
	let story: {name?: string, id?: string, description?: string} = {};
	options.args = ["select", stories[index].id];
	await PythonShell.run("handler.py", options).then((results) => {
		story = JSON.parse(results[0]);
	}).catch(e => {
		i.reply("There was an error getting the stories.");
		return submitError(e, c, "Story.ts; List/Select; Python err:");
	});
	i.editReply({
		embeds: [new EmbedBuilder({
			title: `Select: ${story.name}`,
			description: `ID: ${story.id}`,
			fields: [{
				name: "Text Preview:", value: story.description as string
			}],
			footer: { text: "Timer: 1 minute and 30 seconds" }
		})],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				createButton("select", "Select this story", ButtonStyle.Primary),
				createButton("back", "Do not select", ButtonStyle.Secondary)
			)
		]
	});
}

async function createStoryPageComponents(stories: {name: string, id: string}[]) {
	const buttons1 = [];
	const buttons2 = [];
	for (const i in stories) {
		if (parseInt(i) < 4) {
			buttons1.push(createButton(`s-${parseInt(i)+1}`, `Story ${parseInt(i)+1}`, ButtonStyle.Primary));
		} else if (i === "4") { // Grab the 5th story
			buttons2.push(createButton(`s-${parseInt(i)+1}`, `Story ${parseInt(i)+1}`, ButtonStyle.Primary));
		} else if (i === "5") { // Grab the 6th story
			buttons2.push(createButton(`s-${parseInt(i)+1}`, `Story ${parseInt(i)+1}`, ButtonStyle.Primary));
		}
	}
	buttons2.unshift(createButton("prev", "Previous", ButtonStyle.Secondary).setDisabled(currentPage === 0 ? true : false));
	buttons2.push(createButton("next", "Next", ButtonStyle.Secondary).setDisabled(PageStories == TotalStories ? true : false));
	return [new ActionRowBuilder<ButtonBuilder>().addComponents(
		buttons1
	), new ActionRowBuilder<ButtonBuilder>().addComponents(
		buttons2
	)];
}