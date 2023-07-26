# NovelCord
Welcome to a random Discord bot that I had the idea of creating.

## Requirements
- [Python v3.11.2](https://www.python.org/downloads/)  
	- [NovelAI_API](https://github.com/Aedial/novelai-api/tree/main)
- [NodeJS v18.14.1](https://nodejs.org/en)
	- Install packages using your preferred manager.

## Current Plans
- Getting it to work, firstly
- Integrate Discord.JS, currently only using a single file to just run the code.

## Possible ideas
- Upload custom stories to local or remote
- Local vs Remote stories? ~~Not sure about the way context will be handled~~
- Soon to be more as I get closer to a actual useable product.

## Setup ( BOT DOES NOT WORK )
Using your [NovelAi](https://novelai.net) account, insert your username and password inside the **[.env](python/.env)**  
Head to the [DDP](https://discord.com/developers/applications) to get your bot Token, then paste it into the **[.env](src/.env)**

**! ⚠️ ================================================ ⚠️ !  
  I know I can combine the [Python .env](python/.env) and [Js .env](src/.env), but I am not very keen to figure out the implications of going outside the root directory to handle this.  
  If you know how to do this, feel free to do that.  
! ⚠️ ================================================ ⚠️ !**  

Run the Build script  
- `pnpm build`
- `yarn run build`
- `npm run build`  

Copy the [Js .env](src/.env) to `build/`  
Run the Start script  

Assuming everything is installed correctly, inserted correctly it should run.  
Use `/help` when ready to start using the bot. *(I'll make a wiki at some point.)*

**! ⚠️ ================================================ ⚠️ !  
  One thing to keep in mind, it may take a while to get a response.  
  I will be taking my time to learn more of this API and trying to optimize what I can.  
! ⚠️ ================================================ ⚠️ !**
