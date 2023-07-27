import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server-config")
		.setDescription("Set server related settings")
		.addChannelOption(o => 
			o.setName("mod-novel")
				.setDescription("The channel of which bot interactions are sent")
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
};