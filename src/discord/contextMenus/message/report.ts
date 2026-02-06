import { ApplicationCommandType, ContextMenuCommandBuilder, MessageFlags } from "discord.js";
import type { MessageContextMenu } from "../../types";

// noinspection JSUnusedGlobalSymbols - dynamically imported
export default {
  data: new ContextMenuCommandBuilder().setName("Report Message").setType(ApplicationCommandType.Message),

  async execute(client, interaction) {
    const message = interaction.targetMessage;
    const preview =
      message.content.length > 100 ? `${message.content.slice(0, 100)}...` : message.content || "[No text content]";

    await interaction.reply({
      content: `Reported message from **${message.author.username}**:\n> ${preview}`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies MessageContextMenu;
