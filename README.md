A powerful package to create Github Webhooks and link to Discord.js.

<div align="center">
  <br />
  <p>
    <a href="https://github.com/booleans-oss/Discgit"><img src="https://i.imgur.com/AUGULdM.png" width="546" alt="discgit" /></a>
  </p>
  <br />
  <p>
    <a href="https://www.npmjs.com/package/discgit"><img src="https://img.shields.io/badge/npm-1.0.6-blueviolet" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/discgit"><img src="https://img.shields.io/badge/download-0-informational" alt="NPM downloads" /></a>
    <a href="https://github.com/booleans-oss/discgit/actions"><img src="https://github.com/discordjs/discord.js/workflows/Testing/badge.svg" alt="Build status" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/discgit/"><img src="https://nodei.co/npm/discgit.png?downloads=true&stars=true" alt="npm installnfo" /></a>
  </p>
</div>

Discgit is a Node.js package which allows users to create webhooks on their public and private Github repos and connect them to their Discord.js bot in order to receive every notification.
# Table of contents
- [Installation](#installation)
- [Usage](#Usage)
- [Getting started](#getting-started)
  - [Configuration](#configuration)
    - [Config File](#configFile)
    - [Auth Token](#Token)
    - [Hook Config](#HookConfig)
  - [Link to Discord](#Link)
  - [Receiving requests](#Receiving)
  - [Fetching Embed](#Sending)
- [Payload and Events](#Types)
  - [Github Events](#Github Events)
  - [Event payload](#Event Payload)
- [FAQ](#FAQ)
  
# Installation
Using npm: 
```bash
$ npm install discgit
```

Using yarn
```bash
$ yarn add discgit
```

# Usage 
The following examples use CommonJS import. If using ES6 import, or Typescript, see: [Typescript](#Typescript)
```js
const Discgit = require('discgit');
Discgit(client)
```
Receiving a ``push event``:
```js
client.on('GithubEvent', (payload, event) => {  
  console.log(payload) // will log the information for the event
  console.log(event) // will log "push"
 });
 ```
# Getting Started
## Configuration
In order to create the different webhooks, the package requires a ``discgit.config.json`` file in the root folder of your project. **It is very important to name the file ``discgit.config.json`` as well as putting it in the root folder.**

## Configuration file
The configuration file contains the different information for the Github user:
```json
{
  "token": "Personal Access Token",
  "secret": "HTTP Request Secret",
  "port": 3000,
  "log": true,
  "repos": []
}
```


Key | Type | Required | Default | Description
:----- | :----: | :-----: | :-----: | -----: 
**token** | ``string`` | ``true`` | ``null`` | The Personal Github Auth Token that will allow webhooks to reach the repo/organization
**secret**  | ``string``  | ``false`` | ``DiscGit-WB`` | Secret that will be used in order to secure the different HTTP Request sent to Github and received by Github
**port** | ``number`` | ``false`` | ``3000`` | Port used by the HTTP server in order to listen and receive the different POST request sent by Github
**logs** | ``boolean`` | ``false`` | ``false`` | If the application should log the different information about the server/hooks (ping, events)
**repos** | ``Array<HookConfig`` | ``true`` | ``null`` | Array of the different hooks the app will listen to

### Auth Token
In order for the package to access the required repos and organizations, A personal Access Token is needed in the configuration file. This token is mandatory for the package to work. **The package will not store the token in a database.** The package only uses the token as it is required in the different HTTP Request.
To get this token, the user must create its own on this link: [New Personal Access Token](https://github.com/settings/tokens/new) or by going on ``Github`` -> ``Settings`` -> ``Developer settings`` -> ``Personal access tokens`` -> ``New personal access token``. 
For the package to work perfectly, few options need to be checked:

- ``admin:repo_hook``: to be able to read and write the different repo's hooks
- `` admin: org_hook``: to be able to read and write the different org's hooks

### HookConfig

```json
{
  "type": "repository",
  "owner": "booleans-oss",
  "repo": "DiscGit",
  "events": [
    "push",
    "start"
  ],
  "channel": "ID_CHANNEL"
}
```

Key | Type | Required | Default | Description
:----- | :----: | :-----: | :-----: | -----: 
**type** | ``repository`` or ``organization`` | ``true`` | ``null`` | Type of repository the webhook should listen to as Organizations and Repositories hooks will behave differently.
**owner**  | ``string``  | ``true`` | ``null`` |  Name of the repository's owner or the name of the organization
**repo** | ``string`` | required if repository | ``null`` | The name of the repository the webhook will listen to.
**events** | ``Array<WebhookEvents>`` | ``false`` | ``['push', 'star', 'fork']`` | The different the webhook will listen to and send POST request when occuring
**channel** | ``string`` | ``true`` | ``null`` | ID of the Guild's channel the bot will send the notifications on Discord

## Linking with Discord
```js
const Discprd = require('discord.js')
const Client = new Discord.Client();
// Creating a Client instance

const Discgit = require('discgit');
// Importing the package

Discgit(Client)
// Linking the bot to the package
```
The first and only parameter that the root function is the Client Instance. By doing so, the package will be able to declare and emit the custom event when receiving a request if the user has not defined its own event.

# Receiving Requests
As the HTTP server is set up, the server will emit the event ``Webhook-Event`` on the client instance. The module allows the user to create its own ``Webhook-Event`` as long as it is declared in the bot instance. The event has two parameters:

Key | Type | Description
:---- | ----- | -----: 
**payload** | Object[GithubPayload] | The payload sent by the Github POST Request containing the different information of the event
**event** | string | The event that is triggered and sent to the HTTP Server

```js
const { fetchEmbed } = require('discgit');
client.on('Webhook-Event', (payload, event) => {
    <TextChannel>.send(`New ${event} event`)
});
```
However, the module offers the basic standard notification messages **if the event ``Webhook-Event`` is not set by the user**. The basic messages look just as the Discord's Github Webhooks messages.

# Fetching default message
As the module provides a default event handler (when the event is not set), the package contains the basic message embed. It is also possible to set its own ``Webhook-Event`` but importing the default message builder in order to be able to modify it afterward.
```js
const { fetchEmbed } = require('discgit');
// Importing the default embed builder
client.on('Webhook-Event', (payload, event) => {
    // Declaring the webhook event
    const messageEmbed = fetchEmbed(payload, event);
    // Get the default Message Embed Object
    messageEmbed.title = "Github Notification"
    // Overwriting the default title of the embed
})
```
## Payload and Events

###Github Events

The list of available events is published on [Github's Webhooks API] however, the default event handler only supports few of them (we will add more): 
- push
- start
- fork
- pull_request
- pull_request_review
- pull_request_review_comment
- issues
- issue_comment
- release

### Event Payload
The payload sent by Github's API is different for each event which is why the format of the payload will only contain the properties common to all webhooks' payload. **It is recommended to check out Github's Documentation in order to find the different properties for each event's payload.**

| Key | Type | Description
-----: | :-----: | :------
**action** | ``string`` | The action of the event which depends on the event (e.g. *created*, *closed*, ...)
**sender** | ``object`` | The user that is responsible of the event being triggered (the pusher, or the commiter)
**repository** | ``object`` | The repository where the event was triggered.

# FAQ
> Should I commit my ``discgit.config.json`` file ?

**ABSOLUTELY NOT**. Your config file contains your Github Access Token. Publicly commiting your access token can compromise your whole Github profile even if you have configured it to only access hooks.

> How long does the event take to reach the bot ?

The bot is directly connected to the HTTP server which means very low latency. However, latency can depend on your internet connection as well as Github API status. On average, pings take ~1 second to reach the HTTP server. 

> I have an error with ngrok ?

Ngrok is a NPM package which allow to connect local (*127.0.0.1*) servers to web servers (*ngrok.io*). Some firewall don't allow ngrok to link the web server to the local server. Unfortunatly, there is no solution. 

> How do I know what the event payload look like ?

The best advice is to look at Github's Webhook API which contains every payload for every event as they are all different. It is well-written and very easy to understand.

> Can I create different webhook for the same repo ?

Unfortunatly no. The current code only allows one ngrok webhook. However, next releases involve the ability to have several webhooks for the same repo.


