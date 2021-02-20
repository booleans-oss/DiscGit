import { Octokit } from "@octokit/core";
import Server from "../server";
import { ServerConfig, EventType } from "../server.d";
import { Webhook } from "../webhooks/webhook";
export default class APIHandler extends Octokit {
  constructor(config: ServerConfig, app: Server) {
    super({ auth: config.token });
    this._config = config;
    this._app = app;
  }
  async getWebhook(
    owner: string,
    repo: string,
    type: string
  ): Promise<Webhook | undefined> {
    let webhooks: undefined | Array<Webhook> = undefined;
    try {
      const options = this.fetchOptions(owner, repo, type);
      webhooks = (
        await this.request(
          type === "repository"
            ? "GET /repos/{owner}/{repo}/hooks"
            : "GET /orgs/{org}/hooks",
          options as { owner: string; repo: string }
        )
      ).data as Array<Webhook>;
    } catch (e) {
      throw `Unable to fetch webhook for repo: ${repo} due to error: ${e.message}`;
    }
    if (!webhooks) return;
    const RepoWebhooks = webhooks.filter((webhook: Webhook) =>
      webhook.config.url.endsWith(".ngrok.io")
    );
    return RepoWebhooks[0];
  }

  async getWebhookById(
    owner: string,
    repo: string,
    id: number,
    type: string
  ): Promise<Webhook | undefined> {
    let webhook: undefined | Webhook = undefined;
    try {
      const options = { ...this.fetchOptions(owner, repo, type), hook_id: id };
      webhook = (
        await this.request(
          type === "repository"
            ? "GET /repos/{owner}/{repo}/hooks/{hook_id}"
            : "GET /orgs/{org}/hooks/{hook_id}",
          options as { owner: string; repo: string; hook_id: number }
        )
      ).data as Webhook;
    } catch (e) {
      throw `Unable to fetch webhook for repo: ${repo} due to error: ${e.message}`;
    }
    return webhook;
  }

  async createWebhook(
    owner: string,
    repo: string,
    events: Array<EventType>,
    type: string
  ): Promise<Webhook | undefined> {
    try {
      const options = {
        ...this.fetchOptions(owner, repo, type),
        config: {
          url: this._app._url,
          content_type: "json",
          secret: this._config.secret,
          insecure_ssl: "insecure_ssl",
          token: "token",
          digest: "digest",
        },
        events,
      };
      const { data }: { data: { id: number } } = await this.request(
        type === "repository"
          ? "POST /repos/{owner}/{repo}/hooks"
          : "POST /orgs/{org}/hooks",
        options as { owner: string; repo: string; config: any }
      );
      return await this.getWebhookById(owner, repo, data.id, type);
    } catch (e) {
      throw `Unable to create webhook for repo: ${repo} due to error: ${e.message}`;
    }
  }
  async pingWebhook(
    id: number,
    repo: string,
    owner: string,
    type: string
  ): Promise<void> {
    try {
      const options = {
        ...this.fetchOptions(owner, repo, type, true),
        hook_id: id,
      };
      await this.request(
        type === "repository"
          ? "POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"
          : "POST /orgs/{org}/hooks/{hook_id}/pings",
        options as { owner: string; repo: string; hook_id: number }
      );
    } catch (e) {
      throw `Unable to ping webhook for repo ${repo} due to error: ${e.message}`;
    }
  }
  async updateWebhook(
    owner: string,
    repo: string,
    id: number,
    events: Array<EventType>,
    type: string
  ): Promise<Webhook | undefined> {
    try {
      const options = {
        ...this.fetchOptions(owner, repo, type),
        config: {
          url: this._app._url,
          content_type: "json",
          secret: this._config.secret,
          insecure_ssl: "insecure_ssl",
        },
        hook_id: id,
      };
      await this.request(
        type === "repository"
          ? "PATCH /repos/{owner}/{repo}/hooks/{hook_id}"
          : "PATCH /orgs/{org}/hooks/{hook_id}",
        options as { owner: string; repo: string; hook_id: number }
      );
      return await this.getWebhookById(owner, repo, id, type);
    } catch (e) {
      throw `Unable to update webhook for repo: ${repo} due to error: ${e.message}`;
    }
  }
  fetchOptions(owner: string, repo: string, type: string, ping?: boolean) {
    const options: {
      owner?: string;
      repo?: string;
      org?: string;
      name?: string;
    } = {};
    if (type === "repository") {
      options.repo = repo;
      options.owner = owner;
    } else {
      options.org = owner;
      if (!ping) options.name = "web";
    }
    return options;
  }
}
