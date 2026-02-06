import { Glob } from "bun";
import { REST, Routes } from "discord.js";
import type {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord.js";
import type { Command, UserContextMenu, MessageContextMenu } from "./types";
import { env } from "../env";

const commands: (
  | RESTPostAPIChatInputApplicationCommandsJSONBody
  | RESTPostAPIContextMenuApplicationCommandsJSONBody
)[] = [];
const baseDir = import.meta.dir;

const glob = new Glob("*.ts");

// Load slash commands
for await (const file of glob.scan(`${baseDir}/commands`)) {
  const module = (await import(`${baseDir}/commands/${file}`)) as {
    default?: Command;
  } & Command;
  const command = module.default ?? module;
  commands.push(command.data.toJSON());
}

// Load user context menus
for await (const file of glob.scan(`${baseDir}/contextMenus/user`)) {
  const module = (await import(`${baseDir}/contextMenus/user/${file}`)) as {
    default?: UserContextMenu;
  } & UserContextMenu;
  const menu = module.default ?? module;
  commands.push(menu.data.toJSON());
}

// Load message context menus
for await (const file of glob.scan(`${baseDir}/contextMenus/message`)) {
  const module = (await import(`${baseDir}/contextMenus/message/${file}`)) as {
    default?: MessageContextMenu;
  } & MessageContextMenu;
  const menu = module.default ?? module;
  commands.push(menu.data.toJSON());
}

const rest = new REST().setToken(env.TOKEN);

try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  const data = (await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID), {
    body: commands,
  })) as unknown[];

  console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
  console.error(error);
}
