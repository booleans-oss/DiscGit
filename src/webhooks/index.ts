import {
  ServerConfig,
  HookConfig,
  HookData,
  ClientGithub,
  EventType,
} from "../server.d";
import Server from "../server";
import { Webhook } from "./webhook";
import { EVENTS } from "../constants";

export default class WebhookHandler {

  private _config: ServerConfig;
  private app: Server;
  private _data: Array<HookConfig> = [];

  constructor(config: ServerConfig, app: Server) {

    this._config = config;
    this.app = app;

  }

  async getWebhook(
    owner: string,
    repo: string,
    type: string
  ): Promise<Webhook | undefined> {
    return await this.app.APIHandler.getWebhook(owner, repo, type);
  }
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

  async LinkHooksToClient(client: ClientGithub): Promise<void> {
    client.hooks = [];
    for (let i = 0; i < this._data.length; i++) {
      client["hooks"].push(this._data[i]);
    }
  }

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

  isRegisteredWebhook(id: string): boolean {
    return this._data.findIndex((wb) => wb.id === parseInt(id)) >= 0;
  }

  isValidHook(hook: HookData): boolean {
    const MustHaveProperties: Array<
      "type" | "channel" | "repo" | "events" | "owner"
    > = ["type", "channel", "repo", "events", "owner"];
    let validity = true;
    for (let i = 0; i < MustHaveProperties.length; i++) {
      if (!hook[MustHaveProperties[i]]) {
        throw `Required ${MustHaveProperties[i]} for webhook`;
      }
    }
    return hook.events.some((event) => !EVENTS.includes(event));
  }
}
