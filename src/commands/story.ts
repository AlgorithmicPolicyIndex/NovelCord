/* eslint-disable no-case-declarations */
// ! I DONT LIKE THIS, BUT I'M NOT REALLY WANTING TO DO OPTION HANDLING OUTSIDE THE SWITCH BECAUSE MOST OPTIONS WILL NOT BE USED
import { CacheType, SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { Options, PythonShell } from "python-shell";
import { submitError } from "../functions";

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
			const stories: {name: string, id: string}[] = [];
			options.args = ["list"];
			await PythonShell.run("handler.py", options).then(results => {
				for (const story of results) {
					stories.push(JSON.parse(story));
				}
			}).catch(e => {
				i.reply("There was an error");
				return submitError(e, c);
			});

			// TODO: Make collector to handle pages and selection of stories
			// options.args = ["list", (offset for pages, by 8)]
			i.reply({ embeds: [new EmbedBuilder({
				title: "Stories",
				description: "Filters: (add in code filters functionality)", 
				fields: stories.map(story => {
					return { name: story.name, value: story.id, inline: true };
				})
			})], ephemeral: true });
			return;
		}
	}
};