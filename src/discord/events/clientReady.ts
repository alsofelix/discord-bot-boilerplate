import { Events } from "discord.js";
import type { BotEvent } from "../types";

// noinspection JSUnusedGlobalSymbols - dynamically imported
export default {
  event: Events.ClientReady,
  once: true,
  bot: false,
  execute() {
    console.log("Bot is ready");
  },
} satisfies BotEvent;
