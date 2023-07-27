# NovelCord
Welcome to a random Discord bot that I had the idea of creating.  
NovelCord is a Discord Bot meant to integrate NovelAi stories directly into your server.

## Requirements
- [Python v3.11.2](https://www.python.org/downloads/)  
	- [NovelAI_API](https://github.com/Aedial/novelai-api/tree/main)
- [NodeJS v18.14.1](https://nodejs.org/en)
	- Install packages using your preferred manager.

**Disclaimer**:  
The Database is a JSON DB. I will try to make it as minimal as possible, so if you want, you can use something such as MySQL, Mongo, and others.

## Current Plans
- Getting it to work, firstly
- Create commands and begin work on python command handler
- Create Role if server does not have a `NovelUser` named role
- Finish up `createNovelRole` in [functions](/src/functions.ts)
- Map out commands for help command, via the c.commands collection
	- Might look into collections, and see if a third option can bee added into it, for a description, for less hard coded values.
- Finish up [UsrAgmt](/src/commands/usragmt.ts) 

## Possible ideas
- Upload custom stories to local or remote
- Local vs Remote stories? ~~Not sure about the way context will be handled~~
- Command use in DMs (Will still be sent through the server specified in JS .env and the channel config in JSONDB)
- Soon to be more as I get closer to a actual useable product.

## Setup ( BOT COMMANDS DO NOT WORK )
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
Use `/help` when ready to start using the bot. *(I'll make a wiki at some point.)*

**! ⚠️ ================================================ ⚠️ !  
  One thing to keep in mind, it may take a while to get a response.  
  I will be taking my time to learn more of this API and trying to optimize what I can.  
! ⚠️ ================================================ ⚠️ !**