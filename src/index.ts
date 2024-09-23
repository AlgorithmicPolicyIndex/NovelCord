import { ActivityType, Client, Events, GatewayIntentBits, PermissionFlagsBits } from "discord.js";
import { compareDBToRoles, defineCommands, submitError } from "./functions";
import { config } from "dotenv";
import { main } from "./ModalEvent";
import path = require("path");
config({ path: path.join(__dirname, "..", "secrets", ".env") });

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds
	]
});

defineCommands(client);

client.on(Events.ClientReady, c => {
	console.log(`Logged in as ${c.user.tag}`);
	c.user.setPresence({
		status: "dnd",
		activities: [{
			name: "Stories be Generated!",
			type: ActivityType.Watching
		}]
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isModalSubmit()) {
		return main(interaction, client);
	}
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) return;

	// * Create Role; if it doesn't exist.
	const guild = client.guilds?.cache.get(interaction.guild?.id as string);
	const role = guild?.roles.cache.find(r => r.name == "NovelUser");
	if (!role) {
		guild?.roles.create({
			name: "NovelUser",
			color: "#FFEFBB",
			permissions: [PermissionFlagsBits.SendMessages]
		}).catch((err) => {
			submitError(err, client);
			return interaction.reply("There was an error creating the NovelUser role. Please wait or notify the bot hoster");
		});
	}
	// * If user is in JSON DB but doesn't have the role, add before running command.
	await compareDBToRoles(interaction, client);

	await command.execute(interaction, client).catch(async (err: string) => {
		console.error(err);
		await submitError(err, client);
		return;
	});
});

client.login(process.env.Token);