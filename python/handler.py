import sys
import asyncio
from Stories import getAllStories, getAllStoryDataLimit, getAllStoryData

CommandPassThrough = sys.argv[1]
async def handler():
	match (CommandPassThrough):
		case "list":
			start = 0
			if len(sys.argv) == 3:
				start = start + int(sys.argv[2])

			allStories = await getAllStoryDataLimit(start)
			# ! This was for testing
			# ! "document" is actually the story context for the Ai
			# ! What I mean, is that it's the ENTIRE STORY, from what I can tell. It may cut off at some point, but I dont know.
			# ! It seems to be more than just the current story, because it includes everything inside the menu for selective undo
			# ! say, you type "hello" and undo it, then type "run", it is listed inside the document.
			# ! There are also long text like "datapositionlengthdatalengthpositionrootcurrentnodesparentchildrenroutechangesdategenPositiontypesectionafter" from my test story
			# ! One thing to note for the document, is that there is a jumble of hexcode.
			# ! Another note, is before "dataposition..." it is the current context of what I actually have, not the selective undo.
			# * print(b64decode(stories[0]["content"]["data"]["document"]))

			print(len(await getAllStories()))
			for story in allStories:
				print('{"name": "%s", "id": "%s"}' % (story["title"], story["id"]))

		case "select":
			"""
			# TODO: Story Select Preview
			Returns, Title, ID(s?), Description/preview text
			and whether or not, it's multiplayer, if it is, return users ids/names
			"""
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