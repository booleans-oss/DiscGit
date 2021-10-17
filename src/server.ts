import _http, { Server as HTTPServer } from "http";
import { ClientGithub, ServerConfig, EventType } from "./server.d";
import { Client } from "discord.js";
import RequestHandler from "./RequestHandler";
import { connect } from "ngrok";
import { ConfigManager, APIHandler } from "./utils";
import WebhookManager from "./webhooks";
import {  defaultListenner } from "./utils/DefaultListenner";
import { DEFAULT_CONFIG, eventName } from "./constants";

/**
 * Create the main HTTP Server
 * @class {Server}
 */
export default class Server  {

  server: HTTPServer;
  _config: ServerConfig;
  APIHandler: APIHandler;
  _url: string | null = null;
  client: Client;
  webhooks: WebhookManager;

  /**
   * @param {Client} client - The bot instance
   */
  constructor(client: Client) {

    /**
     * Initializing Config with Default
     * @type {Config}
     * @method
     * * Check config values
     * * @name verify
     * * @return {ServerConfig}
     */
    this._config = DEFAULT_CONFIG as ServerConfig;

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
    void this.start();
  }

  async start(): Promise<void> {
    await this.loadConfig();
    await this.loadTunnel();
    await this.webhooks.readWebhooks();
    await this.webhooks.LinkHooksToClient(this.client as ClientGithub);
    if (!this.client.eventNames().includes(eventName))
      this.addDiscGitListenner();
    this.listen();
  }

  /**
   * Loading the ConfigManager in order to load the config file
   * @returns {Promise<void>}
   */
  async loadConfig():Promise<void> {
    const ConfigHandler = new ConfigManager();
    this._config = (await ConfigHandler.registry());
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
      throw new Error(`Unable to connect with port ${this._config.port}. Try using another port.`);
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    this.client.on("eventName", (...args: [ClientGithub, never, EventType, string]) => defaultListenner(this.client, ...args));
  }
}
