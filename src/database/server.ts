import { JsonDB, Config } from "node-json-db";
import { ServerObject } from "../interfaces";

const db = new JsonDB(new Config("JSONDB/server", true, false, "/"));

export async function settings(id: string, options: ServerObject) {
	if (!await db.exists(`/${id}`)) {
		db.push(`/${id}`, options);
	}
}

export async function settingsExist(id: string) {
	return await db.exists(`/${id}`);
}

export async function updateSettings(id: string, options: ServerObject) {
	if (!await db.exists(`/${id}`)) {
		return null;
	}
}