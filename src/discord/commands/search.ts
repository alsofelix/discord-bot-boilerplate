import { SlashCommandBuilder, MessageFlags } from "discord.js";
import type { Command } from "../types";
import { toChoices } from "../utils/autocomplete";

const FRUITS = [
  "Apple",
  "Apricot",
  "Banana",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Strawberry",
];

// noinspection JSUnusedGlobalSymbols - dynamically imported
export default {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for a fruit (autocomplete example)")
    .addStringOption(option =>
      option.setName("fruit").setDescription("Pick a fruit").setRequired(true).setAutocomplete(true),
    ),

  async autocomplete(_client, interaction) {
    const focused = interaction.options.getFocused();
    await interaction.respond(toChoices(FRUITS, focused));
  },

  async execute(_client, interaction, args) {
    const fruit = args.fruit as string;
    await interaction.reply({
      content: `You selected: **${fruit}**`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
