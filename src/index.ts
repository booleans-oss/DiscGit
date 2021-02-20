import Server from './server'
import { Client } from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()
module.exports = function (client: Client):Server {
    return new Server(client);
}
const DiscGit = (client: Client):Server => {
    return new Server(client);
}
const bot = new Client();
bot.login('NzU5NzA4NjEyNDM1NTA5Mjc4.X3Bbxw.S7nJWzqrpwvNgCeKCEorvBH9ejQ');
if(process.env.NODE_ENVIRONMENT === "DEV") DiscGit(bot);
