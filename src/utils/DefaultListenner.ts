import { TextChannel, MessageEmbed } from "discord.js";
import { ClientGithub, HookConfig, EventType } from "../server.d";
import fetchEmbed from "./EventHandler";

export default function listennerEvent(
  client: ClientGithub,
  payload: never,
  event: EventType,
  id: string
): void {
  const HookConfig = client["hooks"].find(
    (hook: HookConfig) => hook.id === parseInt(id)
  );
  if (!HookConfig) return;
  const channel = client.channels.cache.get(HookConfig.channel) as
    | TextChannel
    | undefined;
  if (!channel) return;
  const embed = fetchEmbed(payload, event);
  if (!embed) return;
  channel.send({ embeds: [<MessageEmbed>(embed as unknown)] });
}
