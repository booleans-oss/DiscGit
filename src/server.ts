import _http, { Server as HTTPServer } from "http";
import { ClientGithub, ServerConfig } from "./server.d";
import { Client } from "discord.js";
import RequestHandler from "./RequestHandler";
import { connect } from "ngrok";
import { Config, APIHandler } from "./utils";
import WebhookManager from "./webhooks";
import DEFAULT_LISTENER from "./utils/DefaultListenner";
import { eventName } from "./constants";

/**
 * Create the main HTTP Server
 * @class {Server}
 */
export default class Server {

  server: HTTPServer;
  _config: ServerConfig;
  APIHandler: APIHandler;
  _url: string | null = null;
  client: Client;
  webhooks: WebhookManager;

  /**
   * @param {Client} The bot instance
   */
  constructor(client: Client) {

    /**
     * Fetching the config .json file
     * @type {Config}
     * @method
     * * @name verify
     * * @param {Server} The main server instance
     * * @return {ServerConfig}
     */
    this._config = new Config().verify(this);

    /**
     * The bot instance
     * @type {Client}
     */
    this.client = client;
    /**
     * The APIHandler of the server
     * Will send and receive requests from Github API
     * @type {APIHandler}
     * @param {Server} The HTTP server
     */
    this.APIHandler = new APIHandler(this);
    /**
     * The Webhook Manager of the HTTP Server
     * @type {WebhookManager}
     * @param {Server} The HTTP server
     */
    this.webhooks = new WebhookManager(this);
    /**
     * The HTTP Server listenning with {@link RequestHandler}
     * @type {HTTPServer}
     */
    this.server = _http.createServer(RequestHandler.bind(this, this));
    this.start();
  }

  async start(): Promise<void> {
    await this.loadTunnel();
    await this.webhooks.readWebhooks();
    await this.webhooks.LinkHooksToClient(this.client as ClientGithub);
    if (!this.client.eventNames().includes(eventName))
      this.addDiscGitListenner();
    this.listen();
  }

  /**
   * Creating ngrok session localhost link
   * @return {Promise<void>}
   * @throws If port is already in use
   */
  async loadTunnel(): Promise<void> {
    try {
      this._url = await connect(this._config.port);
    } catch (e) {
      throw `Unable to connect with port ${this._config.port}. Try using another port.`;
    }
  }

  /**
   * Starting the HTTP server
   * @return {void}
   */
  listen(): void {
    this.server.listen(this._config.port, undefined, async () => {
      if (this._config.log === true) console.log("Discord Webhooks Listening");

      /** Pinging all the active webhooks */
      await this.webhooks.pingAll();
    });
  }

  /**
   * Setting the default event listener if no event is provided
   * @return {void}
   */
  addDiscGitListenner(): void {
    this.client.on(eventName, DEFAULT_LISTENER);
  }
}
