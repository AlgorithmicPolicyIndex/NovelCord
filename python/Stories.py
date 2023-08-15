from boilerplate import API
from novelai_api.utils import decrypt_user_data, link_content_to_story
import numpy as np
import json

# I don't really know Python, so please bare in mind my code is dog water.
# I'm not exactly sure what I can do to really make this easier, but I will learn
# as I continue to work on this.
# * Feel free to fix any of my terrible mistakes and bad code practices.
# TODO: Handle Local and Remote stories.
# TODO: Currently only using remote stories.
async def getAllStories(user, filters):
	async with API() as api_handler:
		api = api_handler.api
		key = api_handler.encryption_key

		keystore = await api.high_level.get_keystore(key)
		stories = await api.high_level.download_user_stories()
		decrypt_user_data(stories, keystore)
		storyArr = []

		for story in stories:
			description = story["data"]["description"]
			try:
				description = json.loads(description)
				if np.isin(filters, [x.lower() for x in story["data"]["tags"]]) and description["author"] == user:
					storyArr.append(story["data"])
				elif filters == "" and description["author"] == user:
					storyArr.append(story["data"])
			except:
				continue
		return storyArr

async def getAllStoryDataLimit(start, user, filters):
	async with API() as api_handler:
		api = api_handler.api
		key = api_handler.encryption_key

		keystore = await api.high_level.get_keystore(key)
		stories = await api.high_level.download_user_stories()
		decrypt_user_data(stories, keystore)
		storyArray = []

		for story in range(start, start + 6):
			description = stories[story]["data"]["description"]
			try:
				description = json.loads(description)
			except:
				description
			# Allows the ability to iterate through 6 stories, even if there are less than 6
			try:
				# TODO: Add the "users: []" context for MP stories
				if np.isin(filters, [x.lower() for x in stories[story]["data"]["tags"]]) and description["author"] == user:
					storyArray.append(stories[story]["data"])
				elif filters == "" and description["author"] == user:
					storyArray.append(stories[story]["data"])
			except: 
				return storyArray
		return storyArray
	
async def getAllStoryData():
	async with API() as api_handler:
		api = api_handler.api
		key = api_handler.encryption_key

		keystore = await api.high_level.get_keystore(key)
		stories = await api.high_level.download_user_stories()
		decrypt_user_data(stories, keystore)
		storyArray = []

		for story in stories:
			storyArray.append(story["data"])
		return storyArray

async def getAllStoriesWithContent():
	async with API() as api_handler:
		api = api_handler.api
		key = api_handler.encryption_key
		keystore = await api.high_level.get_keystore(key)
		stories = await api.high_level.download_user_stories()
		decrypt_user_data(stories, keystore)
		story_content = await api.high_level.download_user_story_contents()
		decrypt_user_data(story_content, keystore)
		link_content_to_story(stories, story_content)
		
		return stories

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
