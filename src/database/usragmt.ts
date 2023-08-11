import { Config, JsonDB } from "node-json-db";

const db = new JsonDB(new Config("JSONDB/usragmt", true, false, "/"));

export async function Agreement(id: string, server: string) {	
	if (!await db.exists(`/${id}`)) {
		db.push(`/${server}/${id}`, true);
	}
}

// ! I do not use this in the file, as I have no actual reason to. just in case, I need another thing added on.
// ! This is only used outside of this function, as I do no plan on exposing the DB directly to the command file.
// ! This is to help with my plan to minimize the use of JsonDB so you can use whatever DB you want.
export async function agreementExists(id: string, server: string) {
	return await db.exists(`/${server}/${id}`);
}

export async function getAgreement(id: string, server: string) {
	if (!await db.exists(`/${server}/${id}`)) {
		return null;
	}
	return await db.getData(`/${server}/${id}`);
}