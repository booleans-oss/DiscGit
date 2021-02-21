import { IncomingMessage, ServerResponse } from "http";
import { GithubEventHeader, GithubIdHeader } from "./constants";
import Server from "./server";

/**
 * Request handler to fetch payload from Github's API POST Requests
 * @param {HTTPServer} HTTP Server
 * @param {IncomingMessage} The request sent by API
 * @param {ServerResponse} Server response
 * @return {void}
 * @constructor
 */
export default function RequestHandler(
  server: Server,
  request: IncomingMessage,
  response: ServerResponse
): void {
  response.write("received");
  response.end();
  if (
    request.method !== "POST" ||
    !server.webhooks.isRegisteredWebhook(
      request.headers[GithubIdHeader] as string
    )
  )
    return;
  let body = "";
  request.on("data", function (data) {
    body += data;
    if (body.length > 1e6) request.socket.destroy();
  });

  request.on("end", function () {
    const data = JSON.parse(body);
    if (
      request.headers[GithubEventHeader] === "ping" &&
      server._config.log === true
    ) {
      console.log(
        `Ping received, took: ${Math.floor(
          Date.now() - new Date(data.hook.updated_at).getTime()
        )} ms.`
      );
    }
    server.client.emit(
      "Webhook-Event",
      server.client,
      data,
      request.headers[GithubEventHeader],
      request.headers[GithubIdHeader]
    );
  });
}
