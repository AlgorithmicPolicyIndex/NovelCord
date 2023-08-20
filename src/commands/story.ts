/* eslint-disable no-case-declarations */
// ! I DONT LIKE THIS, BUT I'M NOT REALLY WANTING TO DO OPTION HANDLING OUTSIDE THE SWITCH BECAUSE MOST OPTIONS WILL NOT BE USED
import { CacheType, SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, ModalActionRowComponentBuilder, TextInputBuilder, TextInputStyle, Events } from "discord.js";
import { Options, PythonShell } from "python-shell";
import { createButton, submitError } from "../functions";
import { getStoryData, selectStory } from "../database/stories";

// ! I personally dont like using these variables, because it's a lot of unneeded usage, personally.
// current page offset, + and - 6 for next and previous
let currentPage = 0;
// Total Story count, for max page size and next button disable
let TotalStories = 0;
// The Current amount of stories you have gone through, to be compared to Total to disable next button
let PageStories = 0;
// Last pages story amount, to make sure PageStories is correct
let LastPage = 0;

let selection: {name?: string, id?: string, preview?: string} = {};

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
						.setDescription("View stories based on filters | Format: filter1, filter2")	
				)
		).addSubcommand(sc =>
			sc.setName("view")
				.setDescription("View the last interaction with your currently selected story.")
		),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		// ! Python-Shell is more than likely not the best way to handle this, but it's what I'm using
		// ! I refer to print as my return value, in some cases, I use print multiple times, but that is then removed after I get the results array.
		// ! As such, I print the total stories then the stories right after [10, {...}, {...}], then strip 10 out of the array for [{...}, ...]
		const options: Options = {
			mode: "text",
			scriptPath: "python"
		};
		const filters = i.options.getString("filters");
		await i.deferReply({ ephemeral: true, fetchReply: true });
		

		switch (i.options.getSubcommand()) {
		case "list":
			// ! I hate this code, but I have to deal with it.
			let stories: {name: string, id: string}[] = [];
			// ! Will refactor this. I wanted to use filters ? filters : "", but that is inserting "" as a arg, which is not what I want.
			if (!filters) {
				options.args = ["list", i.user.id, "0"];
			} else {
				options.args = ["list", i.user.id, "0", filters];
			}
			await PythonShell.run("handler.py", options).then(results => {
				TotalStories = results.splice(0, 1)[0];
				PageStories = 0;
				for (const story of results) {
					stories.push(JSON.parse(story));
					PageStories++;
				}
			}).catch(e => {
				i.editReply({ content: "There was an error getting the stories.", embeds: [], components: []});
				return submitError(e, c, "Story.ts; List; Python err:");
			});

			const cs = await getStoryData(i.user.id, i.guild?.id as string);
			const listMsg = await i.editReply({
				embeds: [new EmbedBuilder({
					title: "Stories",
					description: `**Page**: 1/${Math.ceil(TotalStories/6)}\n**Filters**: ${filters}\n**Current Story**: ${cs.name}\nID: ${cs.id}`, 
					fields: stories.map((story, v) => {
						return { name: `${v+1}:\n${story.name}`, value: story.id, inline: true };
					}),
					footer: { text: "Time: 1 minute and 30 seconds" }
				})],
				components: await createStoryPageComponents(stories)
			});

			const listCollector = listMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 90 * 1000 });
			listCollector.on("collect", async ic => {
				await ic.deferUpdate();
				switch (ic.customId) {
				// ! There probably is a better way of doing this, but for now, like most new things for this prototype testing, it works for now.
				case "s-1":
					await selectListStory(stories, 0, options, i, c);
					return listCollector.resetTimer({ time: 90 * 1000 });
				case "s-2":
					await selectListStory(stories, 1, options, i, c);
					return listCollector.resetTimer({ time: 90 * 1000 });
				case "s-3":
					await selectListStory(stories, 2, options, i, c);
					return listCollector.resetTimer({ time: 90 * 1000 });
				case "s-4":
					await selectListStory(stories, 3, options, i, c);
					return listCollector.resetTimer({ time: 90 * 1000 });
				case "s-5":
					await selectListStory(stories, 4, options, i, c);
					return listCollector.resetTimer({ time: 90 * 1000 });
				case "s-6":
					await selectListStory(stories, 5, options, i, c);
					return listCollector.resetTimer({ time: 90 * 1000 });

				case "cancel":
					i.editReply({ content: "Canceled", embeds: [], components: []});
					return listCollector.stop();
				case "select":
					await selectStory(i.user.id, i.guild?.id as string, selection as {name: string, id: string});
					i.editReply({ embeds: [new EmbedBuilder({
						title: `Selected Story: ${selection.name}`,
						description: `ID: ${selection.id}`,
						fields: [{ name: "Text Preview", value: `${selection.preview}` }],
						footer: { text: "Timer: STOPPED" }
					})], components: []});
					return listCollector.stop();
				case "back":
					i.editReply({
						embeds: [new EmbedBuilder({
							title: "Stories",
							description: `**Page**: ${(currentPage/6) + 1}/${Math.ceil(TotalStories/6)}\n**Filters**: ${filters}\n**Current Story**: ${cs.name}\nID: ${cs.id}`, 
							fields: stories.map((story, v) => {
								return { name: `${v+1}:\n${story.name}`, value: story.id, inline: true };
							}),
							footer: { text: "Time: 1 minute and 30 seconds" }
						}),],
						components: await createStoryPageComponents(stories)
					});
					return listCollector.resetTimer({ time: 90 * 1000 });
				case "prev":
					currentPage = currentPage - 6;
					options.args = ["list", i.user.id, currentPage.toString()];
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
							description: `**Page**: ${(currentPage/6) + 1}/${Math.ceil(TotalStories/6)}\n**Filters**: ${filters}\n**Current Story**: ${cs.name}\nID: ${cs.id}`, 
							fields: stories.map((story, v) => {
								return { name: `${v+1}:\n${story.name}`, value: story.id, inline: true };
							}),
							footer: { text: "Time: 1 minute and 30 seconds" }
						}),],
						components: await createStoryPageComponents(stories)
					});
					return listCollector.resetTimer({ time: 90 * 1000 });
				case "next":
					currentPage = currentPage + 6;
					options.args = ["list", i.user.id, currentPage.toString()];
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
							description: `**Page**: ${(currentPage/6) + 1}/${Math.ceil(TotalStories/6)}\n**Filters**: ${filters}\n**Current Story**: ${cs.name}\nID: ${cs.id}`, 
							fields: stories.map((story, v) => {
								return { name: `${v+1}:\n${story.name}`, value: story.id, inline: true };
							}),
							footer: { text: "Time: 1 minute and 30 seconds" }
						}),],
						components: await createStoryPageComponents(stories)
					});
					return listCollector.resetTimer({ time: 90 * 1000 });
				}
			});
			return;
		case "view":
			const currentStory = await getStoryData(i.user.id, i.guild?.id as string);
			const storyContent: string[] = [];
			options.args = ["view", currentStory.id];
			await PythonShell.run("handler.py", options).then((results) => {
				results.map(i => {
					storyContent.push(i);
				});
			}).catch(e => {
				i.editReply("There was an error getting the story.");
				return submitError(e, c, "Story.ts; View; Python err:\nThis could be due to editor v2. Please make sure to use v1");
			});

			// TODO: Create interaction components to control the story.
			// * (^) Delete, edit (settings), type, edit?
			// ? Edit, would create a new row of button components and number each line in the embed. so you can specify which line to edit. Tedious, but works.
			// ? Use dropdown boxes for edit settings? New thing to me
			// * (^) Use a dropdown box to determine the setting you want to change? Then using a Modal, like below, to handle the value input?
			// ? Isn't there like a text box menu? I could use that for typing.
			// * (^) this requires the use of Modals, I will need to mess around with those. Otherwise this will be a separate command.
			const viewMsg = await i.editReply({ embeds: [new EmbedBuilder({
				title: `Current Story: ${currentStory.name}`,
				description: `ID: ${currentStory.id}`,
				fields: [{
					name: "Last 5 interactions:", value: `${storyContent.join("\n\n")}`
				}],
			})], components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					createButton("type", "Action", ButtonStyle.Primary),
					createButton("cancel", "Cancel", ButtonStyle.Danger)
				)
			]});

			const viewCollector = viewMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 40 * 1000 });
			viewCollector.on("collect", async ic => {
				switch (ic.customId) {
				case "type":
					const modal = new ModalBuilder({
						custom_id: "actionmodel",
						title: "Action",
						components: [
							new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
								new TextInputBuilder({
									custom_id: "textinput",
									label: "What would you like to do?",
									style: TextInputStyle.Paragraph,
									placeholder: "Ex: 'You run to the nearest clinic' or 'You yell \"HELLO!\"'"
								})
							)
						]
					});
					await ic.showModal(modal);
					
					// ! I hate this, Will need to move to index file. I will create a handler to all Modals.
					// ! This was purely for testing. I also wasn't expecting it to get this bad.
					// ! This code is gross as all hell.
					// I spelled it model, I know.
					c.on(Events.InteractionCreate, async modelI => {
						if (!modelI.isModalSubmit()) return;
						
						const text = modelI.fields.getTextInputValue("textinput");
						
						// Remove First interaction
						storyContent.shift();
						const viewModel = await modelI.reply({ embeds: [new EmbedBuilder({
							title: "Action",
							description: text,
							fields: [
								{ name: "Content:", value: storyContent.join("\n\n") },
								{ name: "Your Action:", value: text },
								// Will need to deferReply for this
								{ name: "Generation:", value: "**Not added**" }
							]
						})], components: [
							new ActionRowBuilder<ButtonBuilder>().addComponents(
								createButton("cancel", "Cancel", ButtonStyle.Danger)
							)
						], ephemeral: true });
						
						const viewModalCollector = viewModel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 40 * 1000 });
						viewModalCollector.on("collect", mic => {
							if (mic.customId == "cancel") {
								modelI.editReply({ content: "Canceled", embeds: [new EmbedBuilder({
									title: "**CANCELED**\nAction",
									description: text,
									fields: [
										{ name: "Content:", value: storyContent.join("\n\n") },
										{ name: "Your Action:", value: text },
										// Will need to deferReply for this
										{ name: "Generation:", value: "**Not added**" }
									]
								})], components: []});
								viewModalCollector.stop();
								return viewCollector.stop();
							}
						});
					});
					break;
					
				case "cancel":
					i.editReply({ content: "Canceled", embeds: [new EmbedBuilder({
						title: `**CANCELED**\nCurrent Story: ${currentStory.name}`,
						description: `ID: ${currentStory.id}`,
						fields: [{
							name: "Last 5 interactions:", value: `${storyContent.join("\n\n")}`
						}]
					})], components: []});
					return viewCollector.stop();
				}
			});
		}
	}
};

// ? Make a delete button for the specific story?
async function selectListStory(stories: { id: string; }[], index: number, options: Options, i: ChatInputCommandInteraction<CacheType>, c: Client) {
	let story: {name?: string, id?: string, description?: string, tags?: string} = {};
	options.args = ["select", stories[index].id];
	await PythonShell.run("handler.py", options).then((results) => {
		story = JSON.parse(results[0]);
	}).catch(e => {
		i.editReply({ content: "There was an error getting the stories.", embeds: [], components: []});
		return submitError(e, c, "Story.ts; List/Select; Python err:");
	});
	selection = { name: story.name as string, id: story.id as string, preview: story.description };
	i.editReply({
		embeds: [new EmbedBuilder({
			title: `Select: ${story.name}`,
			description: `ID: ${story.id}`,
			fields: [{
				name: "Tags:", value: story.tags?.length as number > 0 ? story.tags as string : "None"
			},{
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
	// Move 5th story to first row? and make a create story button?
	buttons2.unshift(createButton("prev", "Previous", ButtonStyle.Secondary).setDisabled(currentPage === 0 ? true : false));
	buttons2.push(createButton("next", "Next", ButtonStyle.Secondary).setDisabled(PageStories == TotalStories ? true : false));
	buttons2.push(createButton("cancel", "Cancel", ButtonStyle.Danger));
	if (stories.length === 0) {
		return [];
	} else {
		return [new ActionRowBuilder<ButtonBuilder>().addComponents(
			buttons1
		), new ActionRowBuilder<ButtonBuilder>().addComponents(
			buttons2
		)];
	}
}