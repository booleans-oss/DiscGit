import Server from './server'
import { Client } from 'discord.js'
module.exports = function (client: Client):Server {
    return new Server(client);
}
