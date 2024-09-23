import NovelAI from "@ibaraki-douji/novelai";
import { config } from "dotenv";
import path = require("path");
config({ path: path.join(__dirname, "..", "secrets", ".env") });

const nai = new NovelAI();

nai.user.login(process.env.NAI_USERNAME as string, process.env.NAI_PASSWORD as string);

export async function getAllStories(userId: string, filters?: string[]) {
	const stories = await nai.stories.get();

	let useableStories = [];
	for (let story of stories) {
		if (!story.data) continue;
		const tags = story.data.tags;
		let description = parseJSON(story.data.description);

		
		if (!description) continue;
		if (description.author != userId) continue;

		if (filters?.some(t => tags.includes(t.toLowerCase()))) {
			useableStories.push(story.data)
		} else {
			useableStories.push(story.data);
		}
	}

	return useableStories;
}

interface Description {
	author: string,
}

function parseJSON(data: string): Description | undefined {
	let parsed;
	try { parsed = JSON.parse(data); } catch { }
	return parsed;
} 