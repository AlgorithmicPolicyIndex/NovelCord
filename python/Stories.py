from boilerplate import API, dumps
from novelai_api.utils import decrypt_user_data, link_content_to_story
from novelai_api.GlobalSettings import GlobalSettings
from novelai_api.StoryHandler import NovelAIStory
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
		
		useableStories = []
		storyArray = []

		for useableStory in stories:
			description = useableStory["data"]["description"]
			try:
				description = json.loads(description)
			except:
				continue
			
			if np.isin(filters, [x.lower() for x in useableStory["data"]["tags"]]) and description["author"] == user:
				useableStories.append(useableStory["data"])
			elif filters == "" and description["author"] == user:
				useableStories.append(useableStory["data"])

		for story in range(start, start + 6):
			# Allows the ability to iterate through 6 stories, even if there are less than 6
			try:
				# TODO: Add the "users: []" context for MP stories
				storyArray.append(useableStories[story])
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

async def getStory(id: str):
	async with API() as api_handler:
		api = api_handler.api
		key = api_handler.encryption_key
		keystore = await api.high_level.get_keystore(key)
		api.timeout = 30

		globalSettings = GlobalSettings()
		stories = await api.high_level.download_user_stories()
		contents = await api.high_level.download_user_story_contents()
		decrypt_user_data(stories, keystore)
		decrypt_user_data(contents, keystore)
		link_content_to_story(stories, contents)
		story = {}
		for storyIn in stories:
			if storyIn["meta"] == id:
				story = storyIn
				continue

		try:
			return NovelAIStory(api, keystore, story["meta"], globalSettings, story, story["content"])
		except Exception as e:
			await api.session.close()
			return e

# ! Does not work
async def generateStory(id: str):
	async with API() as api_handler:
		api = api_handler.api
		key = api_handler.encryption_key
		keystore = await api.high_level.get_keystore(key)
		api.timeout = 30

		globalSettings = GlobalSettings()
		stories = await api.high_level.download_user_stories()
		contents = await api.high_level.download_user_story_contents()
		decrypt_user_data(stories, keystore)
		decrypt_user_data(contents, keystore)
		link_content_to_story(stories, contents)
		story = {}
		for storyIn in stories:
			if storyIn["meta"] == id:
				story = storyIn
				return

		# TODO: NovelAIStory.generate() does not take a arg, it builds it's own prompt via the .build_context()
		# TODO: Manually build context and append the users tokenized prompt to it.
		try:
			story_handler = NovelAIStory(api, keystore, story["meta"], globalSettings, story, story["content"])
			return await story_handler.generate()
		except Exception as e:
			await api.session.close()
			return e
	


	# ! Seems to grab the settings and context of a story
	# ! Not entirely sure, the docs don't exactly explain what NovelAIStory stuff do, let alone the example code isn't exactly up to date.
	# ! Free balling all of this.
	# await story_handler.load_from_remote()
	
	# if story == None:
	# 	return
	
	# for _ in range(10):
	# 	await story.generate()

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
