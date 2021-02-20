import { Client } from 'discord.js';
export interface ServerConfig {
    port?: number,
    secret?: string,
    token: string,
    log?: boolean,
    repos: Array<HookConfig>
}

export type ConfigType = "secret" | "token" | "repos" | "port" | "log";
export type EventType = "check_run" | "check_suite" | "code_scanning_alert" | "commit_comment" | "content_reference" | "create" | "delete" | "deploy_key" | "deployment" | "deployment_status" | "fork" | "github_app_authorization" | "gollum" | "installation" | "installation_repositories" | "issue_comment" | "issues" | "label" | "marketplace_purchase" | "member" | "membership" | "meta" | "milestone" | "organization" | "org_block" | "package" | "page_build" | "ping" | "project_card" | "project_column" | "project" | "public" | "pull_request" | "pull_request_review" | "pull_request_review_comment" | "push" | "release" | "repository_dispatch" | "repository" | "repository_import" | "repository_vulnerability_alert" | "secret_scanning_alert" | "security_advisory" | "sponsorship" | "star" | "status" | "team" | "team_add" | "watch" | "workflow_dispatch" | "workflow_run"
export interface HookData extends HookConfig {
    events: Array<EventType>,
    isRepo: boolean
}
export interface HookConfig {
    channel: string,
    repo: string,
    owner: string
    id: number,
    type: stringå
}
export interface CommitAuthor {
    name: string,
    email: string,
}
export interface GitAuthor {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}
export interface GitCommit {
        id: string;
        tree_id: string;
        distinct: boolean;
        message: string;
        timestamp: Date;
        url: string;
        author: CommitAuthor;
        committer: CommitAuthor;
        added: [];
        removed: [];
        modified: [];
}
export interface ClientGithub extends Client {
    hooks: Array<HookConfig>
}
interface Author {
    icon_url: string,
    url: string,
    name: string
}
interface Footer {
    name: string,
    icon_url: string,
    url: string,
}
interface Field {
    name: string,
    value: string
}
export interface CustomEmbed implements MessageEmbed {
    url: string,
    color?: string,
    title?: string,
    author?: Author,
    description?: string,
    timestamp?: Date,
    footer?: Footer,
    fields?: Array<Field>
}
export interface Config {
    content_type: string;
    insecure_ssl: string;
    secret: string;
    url: string;
}
