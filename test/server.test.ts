import Server from '../src/server'
import { Client } from 'discord.js'
const Methods = ["start", "addDiscGitListenner", "loadConfig", "loadTunnel", "listen"];

jest.mock('../src/server.ts');

describe('Testing Server Class Methods', () => {
    for(let i = 0; i < Methods.length; i++) {
        it(`Expecting method ${Methods[i]} to be defined`, () => {
            const ServerInstance = new Server(new Client());
            expect(ServerInstance).toHaveProperty(Methods[i]);
        })
    }
});