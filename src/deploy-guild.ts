import { Routes, REST } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { CommandCollection } from "./interfaces";
config({ path: `${__dirname}/secrets/.env` });

const commands: CommandCollection[] = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

// ! I dont want to do it like this, but for now, and it not being a main use file, it should be fine for now.
(async () => {
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		// The problem line
		const command = await import(filePath);
		commands.push(command.data.toJSON());
	}
});

const rest = new REST({ version: "10" }).setToken(process.env.Token as string);
const Servers = [
	{ "name": "dev", "id": process.env.server as string }
];
switch (process.argv[2]) {
case "create":
	if (!process.argv[3])
	{
		console.log("Please define a server to use.\n", Servers);
		break;
	}
	Servers.forEach(s => {
		if (s.name == process.argv[3])
		{
			return createCommands(commands, s.id);
		}
		return console.log("This server name, does not exist");
	});
	break;
case "delete":
	if (!process.argv[3])
	{
		console.log("Please define a server to use.\n", null, Servers);
		break;
	}
	Servers.forEach(s => {
		if (s.name == process.argv[3])
		{
			return deleteCommands(commands, s.id);
		}
		return console.log("This server name, does not exist");
	});
	break;
}

async function createCommands(cmds: CommandCollection[], serverId: string)
{
	try
	{
		console.log(`Started refreshing ${cmds.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.client_id as string, serverId),
			{ body: cmds }
		);
		// TODO: FIND OUT WHAT THE FUCK DATA RETURNS. I NEVER LOOKED INTO THIS.
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error)
	{
		console.error("38;5;1", error);
	}
}

async function deleteCommands(cmds: CommandCollection[], server: string)
{
	try
	{
		console.log(`Deleting ${cmds.length} application (/) commands.`);
		await rest.put(
			Routes.applicationGuildCommands(process.env.client_id as string, server),
			{ body: []}
		);
		console.log("Successfully deleted ALL application (/) commands.\n(Lower is better, if 0 all is deleted!)");
	}
	catch (error)
	{
		console.log(error);
	}
}
