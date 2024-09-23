import NovelAI from "@ibaraki-douji/novelai";
import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, "python", ".env") });


const nai = new NovelAI();

const userId = "538096686522957825";
const filters = ["test2"]

nai.user.login(process.env.NAI_USERNAME, process.env.NAI_PASSWORD).then( async () => {
	const stories = await nai.stories.get();

	let useableStories = [];
	for (let story of stories) {
		if (!story.data) continue;
		const tags = story.data.tags;
		const title = story.data.title;
		let description = parseJSON(story.data.description);
		const remoteStoryId = story.data.remoteStoryId;
		const id = story.data.id;

		
		if (!description) continue;
		if (description.author != userId) continue;

		if (filters?.some(t => tags.includes(t.toLowerCase()))) {
			useableStories.push(story.data)
		} else {
			useableStories.push(story.data);
		}
	}

	return console.log(useableStories);
});

function parseJSON(data) {
	let parsed;

	try {
		parsed = JSON.parse(data);
	} catch { }

	return parsed;
} 