import { JsonDB, Config } from "node-json-db";

interface serverObject {
	NovelChannel: string | "all",
	ModChannel: string,
}

export async function settings(id: string, options: serverObject) {
	const db = new JsonDB(new Config("JSONDB/server", true, false, "/"));
	if (!await db.exists(`/${id}`)) {
		db.push(`/${id}`, options);
	}
}