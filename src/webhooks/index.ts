import {
  ServerConfig,
  HookConfig,
  HookData,
  ClientGithub,
  EventType,
  IMustHaveProperties,
} from "../server.d";
import Server from "../server";
import { Webhook } from "./webhook";
import { EVENTS } from "../constants";

/**
 * Webhook Manager that will manage active webhooks
 * @class {WebhookManager}
 * @param {Server} HTTP Server
 */
export default class WebhookManager {

  private _config: ServerConfig;
  private app: Server;
  private _data: Array<HookConfig> = [];

  constructor(app: Server) {
    /**
     * HTTP Server config
     * @type {ServerConfig}
     */
    this._config = app._config;
    /**
     * HTTP Server
     * @type {Server}
     */
    this.app = app;

  }

  /**
   * Fetch the first webhook for this repo/organization
   * Firstly fetch all the webhook and filter with ngrok domain to have only the first current webhook
   * @param {string} owner - The repo's owner or organization
   * @param {string} repo - The name of the repo
   * @param {string} type - The type of repo (repo or organization)
   * @return {@link {Webhook} | undefined}
   */
  async getWebhook(
    owner: string,
    repo: string,
    type: string
  ): Promise<Webhook | undefined> {
    return await this.app.APIHandler.getWebhook(owner, repo, type);
  }

  /**
   * Fetch all the webhooks set in the config file and update/create them with current ngrok localhost link
   * @throws if {@link HookData} is not valid
   * @return {Promise<void>}
   */
  async readWebhooks(): Promise<void> {
    const Repos: Array<HookData> = this._config.repos as Array<HookData>;
    for (let i = 0; i < Repos.length; i++) {
      if (!this.isValidHook(Repos[i])) return;
      const webhook: Webhook | undefined = await this.getWebhook(
        Repos[i].owner,
        Repos[i].repo,
        Repos[i].type
      );
      if (!webhook) await this.createWebhook(Repos[i]);
      else await this.updateWebhook({ ...Repos[i], id: webhook.id });
    }
  }

  /**
   * Create array of active webhooks in the instance of Client
   * Used in order to access the different active webhooks in the Client events
   * @param {ClientGithub} client - new Bot Instance
   * @constructor
   * @return {void}
   */
  async LinkHooksToClient(client: ClientGithub): Promise<void> {
    client.hooks = [];
    for (let i = 0; i < this._data.length; i++) {
      client["hooks"].push(this._data[i]);
    }
  }

  /**
   * Create webhook as set in the config file
   * Push the webhook in the cache of the WebhookManager
   * @param {string} owner - The repo's owner or the organization
   * @param {string} repo - The name of repo
   * @param {string} channel - ID of the channel where the notification should be sent
   * @param {Array<string>} events - Array of events the webhook will listen to
   * @param {string} type - Type of webhook, repo/organization
   * @return {Promise<void>}
   */
  async createWebhook({
    owner,
    repo,
    channel,
    events,
    type,
  }: HookData): Promise<void> {
    const webhook: Webhook = (await this.app.APIHandler.createWebhook(
      owner,
      repo,
      events,
      type
    )) as Webhook;
    this._data.push({ owner, id: webhook.id, repo: repo, channel, type });
  }

  /**
   * Update previous webhook with the new ngrok localhost link
   * Push the updated webhook in the cache of the webhookManager
   * @param {string} owner - The repo's owner or the organization
   * @param {string} repo - The name of repo
   * @param {string} channel - ID of the channel where the notification should be sent
   * @param {Array<string>} events - Array of events the webhook will listen to
   * @param {string} type - Type of webhook, repo/organization
   * @return {Promise<void>}
   */
  async updateWebhook({
    owner,
    repo,
    id,
    channel,
    events,
    type,
  }: HookData): Promise<void> {
    const webhook = (await this.app.APIHandler.updateWebhook(
      owner,
      repo,
      id,
      events,
      type
    )) as Webhook;
    this._data.push({ owner, id: webhook.id, repo: repo, channel, type });
  }

  /**
   * Ping all the current webhooks for Github to mark them as active
   * @throw if ping is not received
   * @return Promise<void>
   */
  async pingAll(): Promise<void> {
    for (let i = 0; i < this._data.length; i++) {
      await this.app.APIHandler.pingWebhook(
        this._data[i].id,
        this._data[i].repo,
        this._data[i].owner,
        this._data[i].type
      );
    }
  }

  /**
   * Check if the webhook is registered in the cache of {@link WebhookHandler}
   * @param {string} id - Webhook's ID
   * @return boolean
   */
  isRegisteredWebhook(id: string): boolean {
    return this._data.findIndex((wb) => wb.id === parseInt(id)) >= 0;
  }

  /**
   * Check if the webhook's config is valid (all required fields are filled)
   * @param {HookData} hook - The webhook's config
   * @return boolean
   */
  isValidHook(hook: HookData): boolean {
    const MustHaveProperties: IMustHaveProperties = ["type", "channel", "repo", "events", "owner"];
    let validity = true;
    for (let i = 0; i < MustHaveProperties.length; i++) {
      if (!hook[MustHaveProperties[i]]) {
        throw `Required ${MustHaveProperties[i]} for webhook`;
      }
    }
    return hook.events.some((event) => !EVENTS.includes(event));
  }
}
