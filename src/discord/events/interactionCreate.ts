import { Events, MessageFlags, type Client, type ChatInputCommandInteraction, type Interaction } from "discord.js";
import type { BotEvent, Command, ParsedArgs, UserContextMenu, MessageContextMenu } from "../types";

const DISCORD_TYPES = {
  SUBCOMMAND: 1,
  SUBCOMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTACHMENT: 11,
} as const;

// Map type numbers to their property names on the option object
const TYPE_PROPERTY_MAP: Record<number, string> = {
  [DISCORD_TYPES.USER]: "user",
  [DISCORD_TYPES.CHANNEL]: "channel",
  [DISCORD_TYPES.ROLE]: "role",
  [DISCORD_TYPES.ATTACHMENT]: "attachment",
};

function extractOptionValue(
  option: { name: string; type: number; value?: unknown; member?: unknown },
  interaction: ChatInputCommandInteraction,
): unknown {
  switch (option.type) {
    case DISCORD_TYPES.STRING:
    case DISCORD_TYPES.INTEGER:
    case DISCORD_TYPES.BOOLEAN:
    case DISCORD_TYPES.NUMBER:
      return option.value;
    case DISCORD_TYPES.USER:
      // Return member (GuildMember) if available, otherwise user
      return (option as Record<string, unknown>).member ?? (option as Record<string, unknown>).user;
    case DISCORD_TYPES.CHANNEL:
    case DISCORD_TYPES.ROLE:
    case DISCORD_TYPES.ATTACHMENT: {
      const propName = TYPE_PROPERTY_MAP[option.type];
      return propName ? (option as Record<string, unknown>)[propName] : option.value;
    }
    case DISCORD_TYPES.MENTIONABLE:
      return interaction.options.getMentionable(option.name);
    default:
      return option.value;
  }
}

function processOptions(
  options: readonly {
    name: string;
    type: number;
    value?: unknown;
    member?: unknown;
  }[],
  interaction: ChatInputCommandInteraction,
): ParsedArgs {
  const args: ParsedArgs = {};
  for (const option of options) {
    args[option.name] = extractOptionValue(option, interaction);
  }
  return args;
}

type RepliableInteraction = Interaction & {
  replied: boolean;
  deferred: boolean;
  reply: (options: { content: string; flags: number }) => Promise<unknown>;
  followUp: (options: { content: string; flags: number }) => Promise<unknown>;
};

async function safeExecute(
  interaction: RepliableInteraction,
  fn: () => Promise<void>,
  errorMessage: string,
): Promise<void> {
  try {
    await fn();
  } catch (error) {
    console.error(error);
    const payload = { content: errorMessage, flags: MessageFlags.Ephemeral };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
}

// noinspection JSUnusedGlobalSymbols - dynamically imported
export default {
  event: Events.InteractionCreate,
  once: false,
  bot: true,
  async execute(client: Client, interaction: Interaction) {
    // User context menu
    if (interaction.isUserContextMenuCommand()) {
      const menu = client.userContextMenus.get(interaction.commandName) as UserContextMenu | undefined;
      if (!menu) {
        console.error(`No user context menu matching ${interaction.commandName} was found.`);
        return;
      }
      await safeExecute(
        interaction,
        () => menu.execute(client, interaction),
        "There was an error while executing this context menu!",
      );
      return;
    }

    // Message context menu
    if (interaction.isMessageContextMenuCommand()) {
      const menu = client.messageContextMenus.get(interaction.commandName) as MessageContextMenu | undefined;
      if (!menu) {
        console.error(`No message context menu matching ${interaction.commandName} was found.`);
        return;
      }
      await safeExecute(
        interaction,
        () => menu.execute(client, interaction),
        "There was an error while executing this context menu!",
      );
      return;
    }

    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName) as Command | undefined;
      if (!command?.autocomplete) return;

      try {
        await command.autocomplete(client, interaction);
      } catch (error) {
        console.error(error);
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName) as Command | undefined;

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    let executeMethod = command.execute;
    let args: ParsedArgs = {};

    const option = interaction.options.data[0];

    if (option) {
      if (option.type === DISCORD_TYPES.SUBCOMMAND_GROUP) {
        const subCmd = option.options?.[0];
        if (subCmd) {
          executeMethod = command[`${option.name}__${subCmd.name}`] as typeof executeMethod;
          if (subCmd.options?.length) {
            args = processOptions(subCmd.options, interaction);
          }
        }
      } else if (option.type === DISCORD_TYPES.SUBCOMMAND) {
        executeMethod = command[interaction.options.getSubcommand()] as typeof executeMethod;
        if (option.options?.length) {
          args = processOptions(option.options, interaction);
        }
      } else {
        args = processOptions(interaction.options.data, interaction);
      }
    }

    if (!executeMethod) {
      console.error(`Command ${interaction.commandName} missing execute method for subcommand.`);
      await interaction.reply({
        content: "This command is not properly configured.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await safeExecute(
      interaction,
      () => executeMethod(client, interaction, args),
      "There was an error while executing this command!",
    );
  },
} satisfies BotEvent<[Client, Interaction]>;
