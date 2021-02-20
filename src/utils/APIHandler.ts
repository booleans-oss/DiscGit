import { Octokit } from '@octokit/core'
import Server from '../server';
import { ServerConfig, EventType } from '../server.d'
import { Webhook } from '../webhooks/webhook'
export default class APIHandler extends Octokit {
    constructor(config: ServerConfig, app: Server) {
        super({auth: config.token});
        this._config = config;
        this._app = app;
    }
    async getWebhook(repo: string): Promise<Webhook | undefined> {
        let webhooks: undefined | Array<Webhook> = undefined;
        try {
            webhooks = (await this.request('GET /repos/{owner}/{repo}/hooks', {
                owner: this._config.owner,
                repo
              })).data as Array<Webhook>
    } catch(e) {
        this._app.logger.err(e.message);
    }
    if(!webhooks) return;
    const RepoWebhooks = webhooks.filter((webhook: Webhook) => webhook.config.url.endsWith('.ngrok.io'));
    return RepoWebhooks[0];
    }

    async getWebhookById(repo: string, id: number): Promise<Webhook | undefined> {
        let webhook: undefined | Webhook = undefined;
        try {
            webhook = (await this.request('GET /repos/{owner}/{repo}/hooks/{hook_id}', {
                owner: this._config.owner,
                repo,
                hook_id: id
              })).data as Webhook
    } catch(e) {
        this._app.logger.err(e.message);
    }
    return webhook;
    }

    async createWebhook(repo: string, events: Array<EventType>): Promise<Webhook | undefined> {
        try {
            const { data }: { data: { id: number }} = await this.request('POST /repos/{owner}/{repo}/hooks', {
                owner: this._config.owner,
                repo: repo,
                config: {
                  url: this._app._url,
                  content_type: 'json',
                  secret: this._config.secret,
                  insecure_ssl: 'insecure_ssl',
                  token: 'token',
                  digest: 'digest'
                },
                events
              });
              return await this.getWebhookById(repo, data.id);
        } catch(e) {
            this._app.logger.err(e.message);
        }
    }
    async pingWebhook(id: number, repo: string): Promise<void> {
        try {
            await this.request(`POST /repos/{owner}/{repo}/hooks/{hook_id}/pings`, {
            owner: this._config.owner,
            repo,
            hook_id: id
          });
        } catch(e) {
            this._app.logger.err(e.message);
        }
    }
    async updateWebhook(repo: string, id: number, events: Array<EventType>): Promise<Webhook | undefined> {
        try {
            await this.request('PATCH /repos/{owner}/{repo}/hooks/{hook_id}', {
                owner: this._config.owner,
                repo: repo,
                hook_id: id,
                config: {
                    url: this._app._url,
                    content_type: 'json',
                    secret: this._config.secret,
                    insecure_ssl: 'insecure_ssl',
                },
                events,
              });
              return await this.getWebhookById(repo, id)
        } catch(e) {
            this._app.logger.err(e.message);
        }
    }
}
