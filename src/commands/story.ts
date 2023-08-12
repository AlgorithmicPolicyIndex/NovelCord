import { CacheType, SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";
import { Options, PythonShell } from "python-shell";

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
			// TODO: Exit out of commands and src, to enter python
			scriptPath: "python",
			args: ["value1", "value2", "value3"]
		};

		switch (i.options.getSubcommand()) {
		case "list":
			PythonShell.run("handler.py", options);
			return;
		}
	}
};