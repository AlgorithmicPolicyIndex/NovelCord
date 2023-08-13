import sys
import asyncio
from Stories import getAllStories, getAllStoryData
from boilerplate import dumps
from base64 import b64decode

CommandPassThrough = sys.argv[1]
async def handler():
	match (CommandPassThrough):
		case "list":
			start = 0
			if len(sys.argv) == 3:
				start = start + int(sys.argv[2])

			allStories = await getAllStoryData(start)
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

asyncio.run(handler())