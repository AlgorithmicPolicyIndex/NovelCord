import { ActivityType, Client, Events, GatewayIntentBits } from "discord.js";
import { defineCommands, submitError } from "./functions";
import { config } from "dotenv";
import { agreementExists } from "./database/usragmt";
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
			name: "Stories be Generated!",
			type: ActivityType.Watching
		}]
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) return;

	const guild = client.guilds?.cache.get(interaction.guild?.id as string);
	const role = guild?.roles.cache.find(r => r.name == "NovelUser");
	if (!role) {
		guild?.roles.create({
			name: "NovelUser",
			color: // MAKE THIS DUMB BRAIN
		});
	}

	try {
		await command.execute(interaction, client);
	} catch (err) {
		console.error(err);
		return submitError(err, client).then(()=>{return;});
	}
});

client.login(process.env.Token);