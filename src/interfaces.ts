export interface ServerSettings {
	NovelChannel: string, // Channel used to restrain NovelAi user interactions. Allows easier implementation of multiplayer stories
	ModChannel: string // Channel used for local server moderation
}

export interface NovelDescription {
	author: string,
	channel: string, // The most recent channel the author used this story in
			// Used mostly for "multiplayer" stories. 
	filters: string[],
	users?: string[], // Optional context filter, if author allows people to use story
	// extras?
}