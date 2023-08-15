import sys
import asyncio
from Stories import getAllStories, getAllStoryDataLimit, getAllStoryData

CommandPassThrough = sys.argv[1]
async def handler():
	match (CommandPassThrough):
		case "list":
			user = sys.argv[2]
			start = 0
			filters = "";
			if len(sys.argv) >= 4:
				start = start + int(sys.argv[3])
			if len(sys.argv) >= 5:
				filters = sys.argv[4:]

			allStories = await getAllStoryDataLimit(start, user, filters)
			# ! This was for testing
			# ! "document" is actually the story context for the Ai
			# ! What I mean, is that it's the ENTIRE STORY, from what I can tell. It may cut off at some point, but I dont know.
			# ! It seems to be more than just the current story, because it includes everything inside the menu for selective undo
			# ! say, you type "hello" and undo it, then type "run", it is listed inside the document.
			# ! There are also long text like "datapositionlengthdatalengthpositionrootcurrentnodesparentchildrenroutechangesdategenPositiontypesectionafter" from my test story
			# ! One thing to note for the document, is that there is a jumble of hexcode.
			# ! Another note, is before "dataposition..." it is the current context of what I actually have, not the selective undo.
			# * print(b64decode(stories[0]["content"]["data"]["document"]))

			print(len(await getAllStories(user, filters)))
			for story in allStories:
				print('{"name": "%s", "id": "%s"}' % (story["title"], story["id"]))

		case "select":
			# TODO: Use same "start", "user" and "filter" from "list" instead of getting ALL stories.
			# * Unneeded wait time
			stories = await getAllStoryData()
			if len(sys.argv) != 3:
				return print("Missing Story ID")

			for story in stories:
				if story["id"] == sys.argv[2]:
					desc = str(story["textPreview"]).splitlines()
					print('{"name": "%s", "id": "%s", "description": "%s"}' % (
						story["title"],
						story["id"],
						" ".join(desc)
					))
			return;

asyncio.run(handler())