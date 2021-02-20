import { ServerConfig, HookConfig, HookData, ClientGithub, EventType} from '../server.d'
import Server from '../server'
import { Webhook } from './webhook';
import { EVENTS } from "../constants";
export default class WebhookHandler {
    private _config: ServerConfig;
    private app: Server;
    private _data: Array<HookConfig> = [];
    constructor(config: ServerConfig, app: Server) {
        this._config = config;
        this.app = app;
    }
    async getWebhook(repo: string): Promise<Webhook | undefined> {
        return await this.app.APIHandler.getWebhook(repo)
    }
    async readWebhooks(): Promise<void> {
        const Repos: Array<HookData> = this._config.repos as Array<HookData>;
        for(let i = 0; i < Repos.length; i++) {
            if(!this.isValidHook(Repos[i])) return;
            const webhook: Webhook | undefined = await this.app.APIHandler.getWebhook(Repos[i].repo);
            if(!webhook) await this.createWebhook(Repos[i].repo, Repos[i].channel, Repos[i].events as Array<EventType>);
            else await this.updateWebhook(Repos[i].repo, webhook.id, Repos[i].channel, Repos[i].events as Array<EventType>);
        }
    }
    async LinkHooksToClient(client: ClientGithub): Promise<void> {
        client.hooks = [];
        for(let i = 0; i < this._data.length; i++ ) {
            client['hooks'].push(this._data[i])
        }
    }
    async createWebhook(repo: string, channel: string, events: Array<EventType>): Promise<void> {
        const webhook: Webhook = await this.app.APIHandler.createWebhook(repo, events) as Webhook;
        this._data.push({ id: webhook.id, repo: repo, channel })
    }
    async updateWebhook(repo: string, id: number, channel: string, events: Array<EventType>): Promise<void> {
        const webhook = await this.app.APIHandler.updateWebhook(repo, id, events) as Webhook;
        this._data.push({id: webhook.id, repo: repo, channel});
    }

    async pingAll(): Promise<void> {
        for(let i = 0; i < this._data.length; i++ ) {
            await this.app.APIHandler.pingWebhook(this._data[i].id, this._data[i].repo);
        }
    }
    isRegisteredWebhook(id: string): boolean {
        return this._data.findIndex(wb => wb.id === parseInt(id)) >= 0
    }
    isValidHook(hook: HookData): boolean {
        const MustHaveProperties: Array<"channel"|"repo" | "events"> = ["channel", "repo", "events"];
        let validity = true;
        for(let i = 0; i < MustHaveProperties.length; i++) {
            if (!hook[MustHaveProperties[i]]) {
                this.app.logger.err(`Required ${MustHaveProperties[i]} for webhook`);
                return validity = false;
            }
        }
        return hook.events.some(event => !EVENTS.includes(event));
    }
}
