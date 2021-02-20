import _http, { Server as HTTPServer } from 'http'
import { ClientGithub, ServerConfig } from './server.d'
import { Client } from 'discord.js'
import RequestHandler from './RequestHandler';
import { connect } from 'ngrok'
import { Logger, Config, APIHandler } from './utils'
import WebhookHandler from './webhooks'
import DEFAULT_LISTENER from './utils/DefaultListenner'
export default class Server {
    server: HTTPServer;
    _config: ServerConfig;
    APIHandler: APIHandler;
    logger: Logger;
    _url: string | null = null;
    client: Client;
    webhooks: WebhookHandler;
    constructor(client: Client) {
        this._config = new Config().verify(this);
        this.logger = new Logger();
        this.client = client;
        this.APIHandler = new APIHandler(this._config, this);
        this.webhooks = new WebhookHandler(this._config, this);
        this.server = _http.createServer(RequestHandler.bind(this, this));
        this.start();
    }
    async start():Promise<void> {
        await this.loadTunnel();
        await this.webhooks.readWebhooks();
        await this.webhooks.LinkHooksToClient(this.client as ClientGithub);
        if(!this.client.eventNames().includes('DiscGit')) this.addDiscGitListenner();
        this.listen();
    }
    async loadTunnel(): Promise<void> {
        try {
            this._url = await connect(this._config.port);
        } catch(e) {
            this.logger.err(e.msg);
            process.exit();
        }
    }
    listen():void {
        this.server.listen(this._config.port, undefined, async () => {
            this.logger.log('Serveur UP');
            await this.webhooks.pingAll();
        });
    }
    addDiscGitListenner():void {
        this.client.on('DiscGit', DEFAULT_LISTENER);
    }
}