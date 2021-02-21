import path from 'path'

export const DEFAULT_CONFIG = {
  port: 3000,
  token: "TOKEN",
  secret: "SECRET",
  owner: "TEST",
  repos: [],
};

export const EVENTS = [
  "push",
  "star",
  "release",
  "pull_request_review_comment",
  "pull_request_review",
  "pull_request",
  "ping",
  "issue_comment",
  "fork",
  "deployment",
];


export const eventName = "Webhook-Event"
export const GithubIdHeader = "x-github-hook-id"
export const GithubEventHeader = 'x-github-event'

export const ConfigRootpath = path.join(process.cwd(), "discgit.config.json");

export const RepoHooksPath = '/repos/{owner}/{repo}/hooks'
export const OrgHooksPath = '/orgs/{org}/hooks'

export const RepoGetHookPath = '/repos/{owner}/{repo}/hooks/{hook_id}'
export const OrgGetHookPath = '/orgs/{org}/hooks/{hook_id}'

export const RepoHookPingPath = '/repos/{owner}/{repo}/hooks/{hook_id}/pings'
export const OrgHookPingPath = '/orgs/{org}/hooks/{hook_id}/pings'

