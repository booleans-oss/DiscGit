import Server from './server'
import { Client } from 'discord.js'
import EventHandler from './utils/EventHandler'

module.exports = (client: Client) => new Server(client);
module.exports.fetchEmbed = EventHandler;

