import Server from '../src/server'
import { Client } from 'discord.js'
const bot = new Client();
bot.login('NzU5NzA4NjEyNDM1NTA5Mjc4.X3Bbxw.k7GCRoC5phVc8UEezwz9dzsumi4');
new Server(bot);