import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, Client, ComponentType, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { Options, PythonShell } from "python-shell";
import { createButton, submitError } from "./functions";
import { getStoryData } from "./database/stories";

export function main(i: ModalSubmitInteraction<CacheType>, c: Client) {
	switch (i.customId) {
	case "viewActionModal":
		return viewModal(i, c);
	}
}

const options: Options = {
	mode: "text",
	scriptPath: "python"
};

async function viewModal(i: ModalSubmitInteraction<CacheType>, c: Client) {
	i.deferReply({ ephemeral: true });
	const textInput = i.fields.getTextInputValue("textinput");
	const storyContent: string[] = [];
	const currentStory = await getStoryData(i.user.id, i.guild?.id as string);
	options.args = ["view", currentStory.id];
	await PythonShell.run("handler.py", options).then((results) => {
		results.map(i => {
			storyContent.push(i);
		});
	}).catch(e => {
		i.editReply("There was an error getting the story.");
		return submitError(e, c, "ModalEvent.ts; viewModal; Python err:\nThis could be due to editor v2. Please make sure to use v1");
	});
	currentStory.unshit();
	const embed = new EmbedBuilder({
		title: "Action",
		description: `Story ID: ${currentStory.id}`,
		fields: [{
			name: "Content:", value: storyContent.join("\n\n")
		},{
			name: "Your Action:", value: textInput
		},{
			name: "Generation:", value: "**Not added**"
		}]
	});
	const actionMsg = await i.editReply({
		embeds: [embed], components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				// TODO: Another Type Button and all other buttons from the original View message.
				// TODO: Button to edit your action and the response
				// TODO: UNDO/REDO BUTTON. CAN'T FORGET.
				createButton("cancel", "Cancel", ButtonStyle.Danger)
			)
		]
	});

	const viewModalCollector = actionMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 40 * 1000 });
	viewModalCollector.on("collect", vmi => {
		switch (vmi.customId) {
		case "cancel":
			i.editReply({
				embeds: [embed],
				components: []
			});
			return viewModalCollector.stop();
		}
	});
}