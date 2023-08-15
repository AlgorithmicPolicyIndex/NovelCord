import { Config, JsonDB } from "node-json-db";

const db = new JsonDB(new Config("JSONDB/stories", true, false, "/"));

// ! I dont really like the way I have coded this DB. I personally use Sequalize. So don't expect it to be good.
export async function createUserStory(id: string, server: string, story: {name: string | null, id: string | null}) {
	if (!await db.exists(`/${server}/${id}`)) {
		db.push(`/${server}/${id}`, story);
	}
}

export async function getStoryData(id: string, server: string) {
	if (!await db.exists(`/${server}/${id}`)) {
		await createUserStory(id, server, { name: null, id: null });
	}
	return db.getData(`/${server}/${id}`);
}

export async function selectStory(id: string, server: string, story: {name: string, id: string}) {
	return db.push(`/${server}/${id}`, story);
}