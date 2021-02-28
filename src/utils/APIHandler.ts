import { Octokit } from "@octokit/core";
import Server from "../server";
import { Utils } from './'
import { ServerConfig, EventType } from "../server.d";
import { Webhook } from "../webhooks/webhook";
import { OrgHooksPath, RepoHooksPath, RepoGetHookPath, OrgGetHookPath, RepoHookPingPath, OrgHookPingPath } from '../constants'

/**
 * The main APIHandler for the HTTP requests
 * @extends {Octokit}
 */
export default class APIHandler extends Octokit {

  /**
   * @param {Server} Main HTTP server
   */
  constructor(app: Server) {
    super({ auth: app._config.token });

    /**
     * @type {ServerConfig}
     */
    this._config = app._config;

    /**
     * @type {Server}
     */
    this._app = app;
  }

  /**
   * Fetch the first webhook of a specific repository/organization
   * @param {string} owner - Owner of the repo/organization
   * @param {string} repo - Name of the repo/organization
   * @param {string} type - Type "repository" or "organization"
   * @return {Promise<Webhook | never | undefined>} The first webhook of the repo
   * @throws if unable to fetch the webhook
   */
  async getWebhook(
    owner: string,
    repo: string,
    type: string
  ): Promise<Webhook | never | undefined> {
    let webhooks: undefined | Array<Webhook> = undefined;
    try {
      const options = this.fetchOptions(owner, repo, type);
      webhooks = (
        await this.request(
          Utils.isRepo(type)
            ? `GET ${RepoHooksPath}`
            : `GET ${OrgHooksPath}`,
          options as { owner: string; repo: string }
        )
      ).data as Array<Webhook>;
    } catch (e) {
      throw new Error(`Unable to fetch webhook for repo: ${repo} due to error: ${e.message}`);
    }
    if (!webhooks) return;
    const RepoWebhooks = webhooks.filter((webhook: Webhook) =>
      webhook.config.url.endsWith(".ngrok.io")
    );
    return RepoWebhooks[0];
  }

  /**
   * Fetch the webhook with the specific id in the repo/organization
   * @param {string} owner - Owner of the repo/organization
   * @param {string} repo - Name of the repo/organization
   * @param {number} id
   * @param {string} type - Type "repository" or "organization"
   * @throws If webhook was not found
   * @return {Promise<Webhook | never | undefined>} The webhook with the specific ID
   */
  async getWebhookById(
    owner: string,
    repo: string,
    id: number,
    type: string
  ): Promise<Webhook | undefined | never> {
    let webhook: undefined | Webhook = undefined;
    try {
      const options = { ...this.fetchOptions(owner, repo, type), hook_id: id };
      webhook = (
        await this.request(
            Utils.isRepo(type)
            ? `GET ${RepoGetHookPath}`
            : `GET ${OrgGetHookPath}`,
          options as { owner: string; repo: string; hook_id: number }
        )
      ).data as Webhook;
    } catch (e) {
      throw new Error(`Unable to fetch webhook for repo: ${repo} due to error: ${e.message}`);
    }
    return webhook;
  }

  /**
   * Create a webhook
   * Only create webhook if no ngrok webhook was found in the repo/organization
   * @param {string} owner - Owner of the repo/organization
   * @param {string} repo - Name of the repo/organization
   * @param {string} type - Type "repository" or "organization"
   * @params {Array<string>} events - Events the webhook will listen to
   * @return {Promise<Webhook | never | undefined>}  The new webhook for the repo
   * @throws if unable to create the webhook
   */
  async createWebhook(
    owner: string,
    repo: string,
    events: Array<EventType>,
    type: string
  ): Promise<Webhook | undefined | never> {
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
          Utils.isRepo(type)
          ? `POST ${RepoHooksPath}`
          : `POST ${OrgHooksPath}`,
        options as { owner: string; repo: string; config: any }
      );
      return await this.getWebhookById(owner, repo, data.id, type);
    } catch (e) {
      throw new Error(`Unable to create webhook for repo: ${repo} due to error: ${e.message}`);
    }
  }

  /**
   * Send a ping POST request to the webhook to know if it is active/working or not
   * If the ping is not received, Github will mark the webhook as errored
   * @param {string} owner - Owner of the repo/organization
   * @param {string} repo - Name of the repo/organization
   * @param {number} id
   * @param {string} type - Type "repository" or "organization"
   * @return {Promise<void | never>}
   * @throws if unable to ping the webhook
   */
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
          Utils.isRepo(type)
          ? `POST ${RepoHookPingPath}`
          : `POST ${OrgHookPingPath}`,
        options as { owner: string; repo: string; hook_id: number }
      );
    } catch (e) {
      throw new Error(`Unable to ping webhook for repo ${repo} due to error: ${e.message}`);
    }
  }

  /**
   *
   * Update webhook
   * Only update previous webhook if it was found in the repo/organization
   * @param {string} owner - Owner of the repo/organization
   * @param {string} repo - Name of the repo/organization
   * @param {number} id - ID of the webhook
   * @param {string} type - Type "repository" or "organization"
   * @params {Array<string>} events - Events the webhook will listen to
   * @return {Promise<Webhook | never | undefined>} The updated webhook if no error
   * @throws if unable to update the webhook
   */
  async updateWebhook(
    owner: string,
    repo: string,
    id: number,
    events: Array<EventType>,
    type: string
  ): Promise<Webhook | never | undefined> {
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
          Utils.isRepo(type)
          ? `PATCH ${RepoGetHookPath}`
          : `PATCH ${OrgGetHookPath}`,
        options as { owner: string; repo: string; hook_id: number }
      );
      return await this.getWebhookById(owner, repo, id, type);
    } catch (e) {
      throw `Unable to update webhook for repo: ${repo} due to error: ${e.message}`;
    }
  }

  /**
   * Create options object for HTTP requests
   * @param {string} owner - Owner of the repo/organization
   * @param {string} repo - Name of the repo/organization
   * @param {string} type - Type "repository" or "organization"
   * @param {boolean} ping - If request is for ping event
   * @return {OptionType} Options for specific request
   */
  fetchOptions(owner: string, repo: string, type: string, ping?: boolean) {
    const options: {
      owner?: string;
      repo?: string;
      org?: string;
      name?: string;
    } = {};
    if (Utils.isRepo(type)) {
      options.repo = repo;
      options.owner = owner;
    } else {
      options.org = owner;
      if (!ping) options.name = "web";
    }
    return options;
  }
}
