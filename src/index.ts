import Server from './server'
import { Client } from 'discord.js'
import EventHandler from './utils/EventHandler'
module.exports = function (client: Client):Server {
  return new Server(client);
}
module.exports.fetchEmbed = EventHandler;

