/* eslint-disable no-case-declarations */
// ! I DONT LIKE THIS, BUT I'M NOT REALLY WANTING TO DO OPTION HANDLING OUTSIDE THE SWITCH BECAUSE MOST OPTIONS WILL NOT BE USED
import { CacheType, SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, ModalActionRowComponentBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Options, PythonShell } from "python-shell";
import { createButton, submitError } from "../functions";
import { getStoryData, selectStory } from "../database/stories";
import { getAllStories } from "../novalAi";
import { StoryMetadata } from "@ibaraki-douji/novelai";

// ! I personally dont like using these variables, because it's a lot of unneeded usage, personally.
// current page offset, + and - 6 for next and previous
let currentPage = 0;
// Total Story count, for max page size and next button disable
let TotalStories = 0;
// The Current amount of stories you have gone through, to be compared to Total to disable next button
let PageStories = 0;
// Last pages story amount, to make sure PageStories is correct
// let LastPage = 0;

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
		const filters = i.options.getString("filters")?.split(", ");
		await i.deferReply({ ephemeral: true, fetchReply: true });
		

		switch (i.options.getSubcommand()) {
		case "list":
			let stories = await getAllStories(i.user.id, filters);
			
			const cs = await getStoryData(i.user.id, i.guild?.id as string);
			const listMsg = await i.editReply({
				embeds: [new EmbedBuilder({
					title: "Stories",
					description: `**Page**: 1/${Math.ceil(stories.length/6)}\n**Filters**: ${filters}\n**Current Story**: ${cs.name}\nID: ${cs.id}`, 
					fields: stories.slice(currentPage, currentPage+5).map((story, v) => {
						return { name: `${v+1}:\n${story.title}`, value: story.remoteStoryId, inline: true };
					}),
					footer: { text: "Time: 1 minute and 30 seconds" }
				})],
				components: await createStoryPageComponents(stories)
			});

			const listCollector = listMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 90 * 1000 });
			listCollector.on("collect", async ic => {
				await ic.deferUpdate();
				switch (ic.customId) {
				// TODO: Fix and make uncluttered.
				default:
					await selectListStory(stories, parseInt(ic.customId.split('-')[1])-1, i);
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
								return { name: `${v+1}:\n${story.title}`, value: story.remoteStoryId, inline: true };
							}),
							footer: { text: "Time: 1 minute and 30 seconds" }
						}),],
						components: await createStoryPageComponents(stories)
					});
					return listCollector.resetTimer({ time: 90 * 1000 });
				case "prev":
					currentPage = currentPage - 6;
					i.editReply({
						embeds: [new EmbedBuilder({
							title: "Stories",
							description: `**Page**: ${(currentPage/6) + 1}/${Math.ceil(TotalStories/6)}\n**Filters**: ${filters}\n**Current Story**: ${cs.name}\nID: ${cs.id}`, 
							fields: stories.map((story, v) => {
								return { name: `${v+1}:\n${story.title}`, value: story.remoteStoryId, inline: true };
							}),
							footer: { text: "Time: 1 minute and 30 seconds" }
						}),],
						components: await createStoryPageComponents(stories)
					});
					return listCollector.resetTimer({ time: 90 * 1000 });
				case "next":
					currentPage = currentPage + 6;
					i.editReply({
						embeds: [new EmbedBuilder({
							title: "Stories",
							description: `**Page**: ${(currentPage/6) + 1}/${Math.ceil(TotalStories/6)}\n**Filters**: ${filters}\n**Current Story**: ${cs.name}\nID: ${cs.id}`, 
							fields: stories.map((story, v) => {
								return { name: `${v+1}:\n${story.title}`, value: story.remoteStoryId, inline: true };
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
			// ? Edit, would create a new row of button components and number each line in the embed.
			// * (^) Use Modal TextInput, the default text being the line you select.
			// ? Edit Memory Settings button
			// * (^) Modal TextInput, with the default text being the current Memory
			const viewMsg = await i.editReply({ embeds: [new EmbedBuilder({
				title: `Current Story: ${currentStory.name}`,
				description: `ID: ${currentStory.id}`,
				fields: storyContent.map((v, idx) =>{
					return {
						name: `Interaction ${idx+1}:`, value: `${v}`
					};
				})
			})], components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					createButton("type", "Action", ButtonStyle.Primary),
					createButton("edit", "Edit", ButtonStyle.Secondary),
					createButton("cancel", "Cancel", ButtonStyle.Danger)
				)
			]});

			// TODO: Look into making this collector end, when it times out, or is canceled by the user.
			// TODO: Also look into the modal itself, so if the user cancels the model, they can still use this collector, however, if they submit, it closes this collector.
			const viewCollector = viewMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 40 * 1000 });
			viewCollector.on("collect", async ic => {
				switch (ic.customId) {
				case "type":
					const modal = new ModalBuilder({
						custom_id: "viewActionModal",
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
					i.editReply({ components: []});
					return ic.showModal(modal);
				case "edit":
					const editModal = new ModalBuilder({
						custom_id: "viewEditModal",
						title: "Edit",
						components: storyContent.map((value, index) => {
							return new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(new TextInputBuilder({ custom_id: `i-${index+1}`, label: `Interaction ${index+1}`, value: value, style: TextInputStyle.Paragraph }));
						})
						
					});
					i.editReply({ components: []});
					await ic.showModal(editModal);
					return viewCollector.stop();

				case "cancel":
					i.editReply({ content: "Canceled", embeds: [new EmbedBuilder({
						title: `**CANCELED**\nCurrent Story: ${currentStory.name}`,
						description: `ID: ${currentStory.id}`,
						fields: storyContent.map((v, idx) =>{
							return {
								name: `Interaction ${idx+1}:`, value: `${v}`
							};
						})
					})], components: []});
					return viewCollector.stop();
				}
			});
		}
	}
};

// ? Make a delete button for the specific story?
async function selectListStory(stories: StoryMetadata[], index: number, i: ChatInputCommandInteraction<CacheType>) {
	let story = stories[index]

	selection = { name: story.title as string, id: story.remoteStoryId as string, preview: story.textPreview };
	i.editReply({
		embeds: [new EmbedBuilder({
			title: `Select: ${story.title}`,
			description: `ID: ${story.remoteStoryId}`,
			fields: [{
				name: "Tags:", value: story.tags?.length as number > 0 ? story.tags.join(", ") : "None"
			},{
				name: "Text Preview:", value: story.textPreview as string
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

async function createStoryPageComponents(stories: StoryMetadata[]) {
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