import { CustomEmbed, EventType } from "../server.d";
import { beautifyCommits } from "../utils/util";

export default function FetchEmbed(payload: any, event: EventType): CustomEmbed | undefined {
    let MessageEmbed: CustomEmbed;
    switch(event) {
        case 'push': {
            if(payload.commits.length === 0) {
                MessageEmbed = {
                    color: '7289d7',
                    author: {
                        name: payload.sender.login,
                        icon_url: payload.sender.avatar_url,
                        url: payload.sender.html_url
                    },
                    title: `[${payload.repository.name}/${(payload.ref as string).split('/')[2]}] ${payload.created ? 'New branch created':'Branch deleted'} : ${(payload.ref as string).split('/')[2]}`,
                    url: payload.repository.html_url,
                };
            } else {
                MessageEmbed = {
                    color: '7289d7',
                    author: {
                        name: payload.sender.login,
                        icon_url: payload.sender.avatar_url,
                        url: payload.sender.html_url
                    },
                    title: `[${payload.repository.name}/${(payload.ref as string).split('/')[2]}] ${payload.commits.length} new commit${payload.commits.length > 1 ? 's' : ''}`,
                    url: `${payload.repository.html_url}/commits/${payload.after}`,
                    description: beautifyCommits(payload)
                };
            }
            break;
        }
        case 'issue_comment' : {
            if(payload.action === 'edit') return;
            const isCreated = payload.action === 'created';
            const title = isCreated ? `[${payload.repository.full_name}] New comment on issue #${payload.issue.number}: ${payload.issue.title}`: `[${payload.repository.full_name}] Comment on pull request #${payload.issue.number} deleted`
            MessageEmbed = {
                color: 'F5DA81',
                author: {
                    name: payload.sender.login,
                    icon_url: payload.sender.avatar_url,
                    url: payload.sender.html_url
                },
                url: payload.comment.html_url,
                title,
                description: payload.comment.body
            }
            break;
        }
        case 'star': {
        MessageEmbed = {
            color: payload.action === 'created' ? 'E6CA40' : '782029',
            author: {
                name: payload.sender.login,
                icon_url: payload.sender.avatar_url,
                url: payload.sender.html_url
            },
            url: payload.repository.html_url,
            title: `[${payload.repository.full_name}] ${payload.action === 'created' ? 'New start added' : 'Start removed'}`,
        };
        break;
    }
    case 'release': {
        const isReleased = ['published', 'created', 'prereleased', 'released'].includes(payload.action);
        MessageEmbed = {
            color: isReleased ? 'E6CA40' : '782029',
            author: {
                name: payload.sender.login,
                icon_url: payload.sender.avatar_url,
                url: payload.sender.html_url
            },
            url: payload.release.url,
            title: `[${payload.repository.full_name}/${payload.release.target_commitish}?v${payload.release.tag_name}] ${isReleased ? 'New release' : 'Release deleted'}`,
        };
        break;
    }
        case 'pull_request_review_comment': {
            if(payload.action === 'edit') return;
            const isCreated = payload.action === 'created';
            const title = isCreated ? `[${payload.repository.full_name}] New comment on pull request #${payload.pull_request.number}: ${payload.pull_request.title}`: `[${payload.repository.full_name}] Comment on pull request #${payload.pull_request.id} deleted`
            MessageEmbed = {
                color: 'F5DA81',
                author: {
                    name: payload.sender.login,
                    icon_url: payload.sender.avatar_url,
                    url: payload.sender.html_url
                },
                url: payload.comment.html_url,
                title,
                description: payload.comment.body
            }
            break;
        }
        case 'pull_request_review': {
            if(payload.action !== 'submitted') return;
            MessageEmbed = {
                color: 'F5DA81',
                author: {
                    name: payload.sender.login,
                    icon_url: payload.sender.avatar_url,
                    url: payload.sender.html_url
                },
                url: payload.review._links.html.href,
                title: `[${payload.repository.full_name}] Pull request review submitted: #${payload.pull_request.number} ${payload.pull_request.title}`
            }
            break;
        }
        case 'issues': {
            switch(payload.action) {
                case 'opened': {
                    MessageEmbed = {
                        color: 'A9F5A9',
                        author: {
                            name: payload.sender.login,
                            icon_url: payload.sender.avatar_url,
                            url: payload.sender.html_url
                        },
                        url: payload.issue.url,
                        title: `[${payload.repository.full_name}] New issue opened: #${payload.issue.number} ${payload.issue.title}`,
                        description: payload.issue.body,
                    }
                    break;
                }
                case 'reopened' : {
                    MessageEmbed = {
                        color: 'A9F5A9',
                        author: {
                            name: payload.sender.login,
                            icon_url: payload.sender.avatar_url,
                            url: payload.sender.html_url
                        },
                        url: payload.issue.url,
                        title: `[${payload.repository.full_name}] Issue reopened: #${payload.issue.number} ${payload.issue.title}`,
                        description: payload.issue.body,
                    }
                    break;
                }

                case 'closed': {
                    MessageEmbed = {
                        color: 'FE2E2E',
                        author: {
                            name: payload.sender.login,
                            icon_url: payload.sender.avatar_url,
                            url: payload.sender.html_url
                        },
                        url: payload.issue.url,
                        title: `[${payload.repository.full_name}] Issue closed : #${payload.issue.number} ${payload.issue.title}`
                    }
                    break;
                }
                default: {
                    return;
                }
            }
            break;
        }
        case 'pull_request': {
            switch(payload.action) {
                case 'opened': {
                    MessageEmbed = {
                        color: 'A9F5A9',
                        author: {
                            name: payload.sender.login,
                            icon_url: payload.sender.avatar_url,
                            url: payload.sender.html_url
                        },
                        url: payload.pull_request.url,
                        title: `[${payload.repository.full_name}] New pull request opened: #${payload.pull_request.number} ${payload.pull_request.title}`,
                        description: payload.pull_request.body,
                    }
                    break;
                }
                case 'reopened' : {
                    MessageEmbed = {
                        color: 'A9F5A9',
                        author: {
                            name: payload.sender.login,
                            icon_url: payload.sender.avatar_url,
                            url: payload.sender.html_url
                        },
                        url: payload.pull_request.url,
                        title: `[${payload.repository.full_name}] Pull request reopened: #${payload.pull_request.number} ${payload.pull_request.title}`,
                        description: payload.pull_request.body,
                    }
                    break;
                }

                case 'closed': {
                    MessageEmbed = {
                        color: payload.pull_request.merged ? 'D358F7' : 'FE2E2E',
                        author: {
                            name: payload.sender.login,
                            icon_url: payload.sender.avatar_url,
                            url: payload.sender.html_url
                        },
                        url: payload.pull_request.url,
                        title: `[${payload.repository.full_name}] Pull request ${payload.pull_request.merged ? 'merged' : 'closed'} : #${payload.pull_request.number} ${payload.pull_request.title}`
                    }
                    break;
                }
                default: {
                    return;
                }
            }
            break;
        }
        default: {
            return;
        }
    }
    return MessageEmbed;
}
