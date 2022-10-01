## About RainbowBOT
This is a [RainbowBOT](https://rbot.irisdev.xyz)'s source files. 

RainbowBOT is a Discord bot with rich functionality written on TypeScript using [Synergy3](https://github.com/Hatry1337/Synergy3) and [discord.js](https://github.com/discordjs/discord.js) libs.

Basically, main discord-related stuff is implemented on Synergy3 side and this bot is a Synergy3 Modules Collection. 

So, now bot is completely opensource. Feel free to leave issues/pull requests, fork and etc.

## How to build and run
1. Clone this repo somewhere
```bash
git clone https://github.com/Hatry1337/RainbowBOTJS
```
2. Move into cloned directory
```bash
cd RainbowBOTJS
```
3. Create `.env` file and fill it with your credentials
```env
TOKEN="Your Discord Token"
DBURI="Database URI like postgres://user:password@host:5432/database"
NODE_ENV="'production' or 'development', production pushes commands globally by default"
MASTER_GUILD="Your discord guild id to push commands to if you use development mode"
TOPGG_TOKEN="Your top.gg token, can be leaved blank"
OSU_API_KEY="Your osu! api key, used for module 'OsuInfo', also can be leaved blank"
```
4. Install required dependencies
```bash
npm i
```
5. Build typescript project
```bash
tsc
```
6. Launch the bot!
```bash
node ./dist/bot.js
```
