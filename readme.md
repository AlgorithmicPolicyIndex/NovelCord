# I HAVE NO AFFILIATION TO NOVELAI. ANY AND ALL PROBLEMS REGARDING NOVELAI OR THE PYTHON API MUST GO TO THE RESPECTIVE PEOPLE

# NovelCord
NovelCord is a Discord Bot meant to integrate NovelAi stories directly into your server.

## Requirements
- [Python v3.11.2](https://www.python.org/downloads/)  
	- [NovelAI_API](https://github.com/Aedial/novelai-api/tree/main)
- [NodeJS v18.14.1](https://nodejs.org/en)
	- Install packages using your preferred manager.

**Disclaimer**:  
The Database is a JSON DB. I will try to make it as minimal as possible, so if you want, you can use something such as MySQL, Mongo, and others.

## Current Plans ( I should stop writing NovelAi specific things, as I can't do anything with it, until the bot, frontend?, is done. )
- MOVE ALL THIS CRAP TO A TRELLO OR SOMETHING FOR CLARITY. GOD FORBID, I'M ANNOYED AT CLUTTER EVEN THOUGH I DID IT WILLINGLY.
- Create commands and begin work on python command handler
- Server Config Command
	- Mod Channel
		- Edit SubmitError to have an optional arg called "serverChannel", so something as `usragmt.ts` sends to the bot hoster, as well as the server admins if the bot is being invited to other servers. so admins can insert the role to users while the hoster looks into the issue.
	- Novel Channel
		- The channel to restrict the NovelAi stories to. ( Based on Multiplayer context. )
			- All personal stories are ephemeral, will allow use in other channels.
			- Multiplayer stories are not Ephemeral and are restricted to the channel the author of the story is in ( Specifically, locked to the channel allowed by admins and what server the author is in. )
- NovelAi story description interface, for easy of use and consistent descriptions.
- NovelAi Discord Commands
	- Call to Python scripts that interact with NovelAi
	- Figure out the response from the python scripts and send back to discord.
	- Story specific commands
		- once user selects a story, allow them to change, who can see it, interact, change settings, etc
		- Define inside JsonDB? `{"user": "story id"}`?
	- NovelAi Story description filters
		- Custom tags set by author
		- `{..., filters: ["SFW", "FANTASY"], ...}`
- NovelAi User/Channel specific stories?
	- I can use NovelAi's story description to hold a user id and/or channel id.
		- `{"user": "1234567890", "channel": "1234567890"}`
	- Useable, but I might do something more like
		- `{"author": "1234", "users": ["5678", "9012"], ...}`
		- "users" being people allowed by the author to select the story and interact with it too. Like multiplayer? Which would be channel specific, because it'll be easier to just have a non-ephemeral message for all the people in the story.

## Possible ideas
- Upload custom stories to local or remote
- Local vs Remote stories? ~~Not sure about the way context will be handled~~
- Command use in DMs (Will still be sent through the server specified in JS .env and the channel config in JSONDB)
- Image generation (This is a heavy doubt, but it's a thought to have)
- Soon to be more as I get closer to a actual useable product.

## Setup ( BOT COMMANDS DO NOT WORK ) ( THIS SECTION WILL CHANGE OVER TIME, OR BE UPDATED ALL AT ONCE AT THE END )
Using your [NovelAi](https://novelai.net) account, insert your username and password inside the **[.env](python/example.env)**  
Head to the [DDP](https://discord.com/developers/applications) to get your bot Token, then paste it into the **[.env](src/secrets/example.env)**

**! ⚠️ ================================================ ⚠️ !  
  I know I can combine the [Python .env](python/example.env) and [Js .env](src/secrets/example.env), but I am not very keen to figure out the implications of going outside the root directory to handle this.  
  If you know how to do this, feel free to do that.  
! ⚠️ ================================================ ⚠️ !**  

*using pnpm*  
Scripts are as follows:  
---
`pnpm build`  
Copy the [Js .env](src/secrets/example.env) to `build/secrets/`  

**(*To create commands, use `:create` However, you can also use `:delete`*)**  
**(*`:guild:create` currently only updates to one server at a time*)**    
`pnpm deploy:guild:create` **or** `pnpm deploy:global:create`  
`pnpm start`

Assuming everything is installed correctly, inserted correctly it should run.

**! ⚠️ ================================================ ⚠️ !  
  One thing to keep in mind, it may take a while to get a response.  
  I will be taking my time to learn more of this API and trying to optimize what I can.  
! ⚠️ ================================================ ⚠️ !**