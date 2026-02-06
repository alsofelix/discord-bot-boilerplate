import { Glob } from "bun";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { Command, BotEvent, UserContextMenu, MessageContextMenu } from "./types";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
    userContextMenus: Collection<string, UserContextMenu>;
    messageContextMenus: Collection<string, MessageContextMenu>;
  }
}

class DiscordBot extends Client {
  private readonly _token: string;
  commands: Collection<string, Command>;
  userContextMenus: Collection<string, UserContextMenu>;
  messageContextMenus: Collection<string, MessageContextMenu>;

  constructor(token: string) {
    super({
      intents: [GatewayIntentBits.Guilds],
    });

    this._token = token;
    this.commands = new Collection();
    this.userContextMenus = new Collection();
    this.messageContextMenus = new Collection();
  }

  private async loadCommands(): Promise<void> {
    const baseDir = import.meta.dir;
    const glob = new Glob("*.ts");

    for await (const file of glob.scan(`${baseDir}/commands`)) {
      const filePath = `${baseDir}/commands/${file}`;
      const module = (await import(filePath)) as {
        default?: Command;
      } & Command;
      const command = module.default ?? module;

      if ("data" in command && "execute" in command) {
        this.commands.set(command.data.name, command);
      } else {
        console.warn(`[WARNING] Command at ${filePath} missing "data" or "execute".`);
      }
    }
  }

  private async loadEvents(): Promise<void> {
    const baseDir = import.meta.dir;
    const glob = new Glob("*.ts");

    for await (const file of glob.scan(`${baseDir}/events`)) {
      const module = (await import(`${baseDir}/events/${file}`)) as {
        default?: BotEvent;
      } & BotEvent;
      const event = module.default ?? module;

      const handler = event.bot
        ? (...args: unknown[]) => event.execute(this, ...args)
        : (...args: unknown[]) => event.execute(...args);

      if (event.once) {
        this.once(event.event, handler);
      } else {
        this.on(event.event, handler);
      }
    }
  }

  private async loadUserContextMenus(): Promise<void> {
    const baseDir = import.meta.dir;
    const glob = new Glob("*.ts");

    for await (const file of glob.scan(`${baseDir}/contextMenus/user`)) {
      const filePath = `${baseDir}/contextMenus/user/${file}`;
      const module = (await import(filePath)) as {
        default?: UserContextMenu;
      } & UserContextMenu;
      const menu = module.default ?? module;

      if ("data" in menu && "execute" in menu) {
        this.userContextMenus.set(menu.data.name, menu);
      } else {
        console.warn(`[WARNING] User context menu at ${filePath} missing "data" or "execute".`);
      }
    }
  }

  private async loadMessageContextMenus(): Promise<void> {
    const baseDir = import.meta.dir;
    const glob = new Glob("*.ts");

    for await (const file of glob.scan(`${baseDir}/contextMenus/message`)) {
      const filePath = `${baseDir}/contextMenus/message/${file}`;
      const module = (await import(filePath)) as {
        default?: MessageContextMenu;
      } & MessageContextMenu;
      const menu = module.default ?? module;

      if ("data" in menu && "execute" in menu) {
        this.messageContextMenus.set(menu.data.name, menu);
      } else {
        console.warn(`[WARNING] Message context menu at ${filePath} missing "data" or "execute".`);
      }
    }
  }

  async start(): Promise<this> {
    await this.loadCommands();
    await this.loadUserContextMenus();
    await this.loadMessageContextMenus();
    await this.loadEvents();
    await this.login(this._token);
    return this;
  }

  async destroy(): Promise<void> {
    await super.destroy();
  }
}

export default DiscordBot;
