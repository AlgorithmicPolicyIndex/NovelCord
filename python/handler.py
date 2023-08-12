import sys
import asyncio
from Stories import getAllStoriesWithContent
from boilerplate import dumps
from base64 import b64decode

# TODO: Handle command passed from Discord.JS
async def handler():
	match (sys.argv[1]):
		case "list":
			stories = await getAllStoriesWithContent()
			# ! This was for testing
			# ! "document" is actually the story context for the Ai
			# ! What I mean, is that it's the ENTIRE STORY, from what I can tell. It may cut off at some point, but I dont know.
			# ! One thing to note for the document, is that there is a jumble of hexcode.
			# ! While doing the dumb thing of manually decoding it, it makes no sense.
			# ! Will looking more into it.
			print(b64decode(stories[0]["content"]["data"]["document"]))

asyncio.run(handler())