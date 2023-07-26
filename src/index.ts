import { ActivityType, Client, Events, GatewayIntentBits } from "discord.js";
import { defineCommands, submitError } from "./functions";
import { config } from "dotenv";
config({ path: `${__dirname}/secrets/.env` });

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
			name: "Generating Stories!",
			type: ActivityType.Playing,
			url: "https://github.com/KayleePhoto/NovelCord"
		}]
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.command);
	if (!command) return;

	try {
		await command.execute(interaction, client);
	} catch (err) {
		console.error(err);
		return submitError(err, client).then(()=>{return;});
	}
});

client.login(process.env.Token);