from boilerplate import API
from novelai_api.utils import decrypt_user_data

class Stories:
	# I don't really know Python, so please bare in mind my code is dog water.
	# I'm not exactly sure what I can do to really make this easier, but I will learn
	# as I continue to work on this.
	# * Feel free to fix any of my terrible mistakes and bad code practices.
	# TODO: Handle Local and Remote stories.
	# TODO: Currently only using remote stories.
	async def getStoryIdName():
		async with API() as api_handler:
			api = api_handler.api
			key = api_handler.encryption_key

			keystore = await api.high_level.get_keystore(key)
			stories = await api.high_level.download_user_stories()
			decrypt_user_data(stories, keystore)

			for story in stories:
				Data = story["data"]
				print("storydata: %s, %s", Data["title"], Data["id"])

	async def getStoryWithContent():
		return

	# NOTE: Add more for more specific stuff.
	"""
	TODO:
		- Create new story
		- Download file to local machine for easy of use, mainly for story context
			- Depended on if connecting to the remote uses the context from the
				saved story on the account.
			- Local vs Remote
		- Allow story settings updates
	"""
	# async def getStoryContent():
