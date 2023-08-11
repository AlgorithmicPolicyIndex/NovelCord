import { TextChannel } from "discord.js";

export interface ServerSettings {
	NovelChannel: TextChannel, // Channel used to restrain NovelAi user interactions. Allows easier implementation of multiplayer stories
	// However, The users inside the multiplayer story, will only interact with it IF they select it. Multiplayer stories is just a context filter, to know what they can see.
}

export interface NovelDescription {
	// TODO: This
}

export interface NovelFilters {
	// TODO: This
}