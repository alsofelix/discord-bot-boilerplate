import type {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  ContextMenuCommandBuilder,
  Client,
  ModalSubmitInteraction,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (client: Client, interaction: ChatInputCommandInteraction, args: ParsedArgs) => Promise<void>;
  autocomplete?: (client: Client, interaction: AutocompleteInteraction) => Promise<void>;
  [key: string]: unknown; // for subcommand methods like `group__subcommand`
}

export interface UserContextMenu {
  data: ContextMenuCommandBuilder;
  execute: (client: Client, interaction: UserContextMenuCommandInteraction) => Promise<void>;
}

export interface MessageContextMenu {
  data: ContextMenuCommandBuilder;
  execute: (client: Client, interaction: MessageContextMenuCommandInteraction) => Promise<void>;
}

export interface BotEvent<T extends unknown[] = unknown[]> {
  event: string;
  once: boolean;
  bot: boolean;
  execute: (...args: T) => Promise<void> | void;
}

export type ParsedArgs = Record<string, unknown>;

export interface ModalQuestion {
  id?: string; // key for getValues(), defaults to label
  label: string;
  style: "TEXT-SHORT" | "TEXT-LONG";
  placeholder?: string;
  description?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
}

export interface ModalConfig {
  title: string;
  questions: ModalQuestion[];
}

export interface ModalResult {
  interaction: ModalSubmitInteraction;
  values: Record<string, string>;
}
