import { ApplicationCommandType, ContextMenuCommandBuilder, MessageFlags } from "discord.js";
import type { UserContextMenu } from "../../types";

// noinspection JSUnusedGlobalSymbols - dynamically imported
export default {
  data: new ContextMenuCommandBuilder().setName("User Info").setType(ApplicationCommandType.User),

  async execute(client, interaction) {
    const target = interaction.targetUser;
    const member = interaction.targetMember;

    const info = [
      `**Username:** ${target.username}`,
      `**ID:** ${target.id}`,
      `**Created:** <t:${Math.floor(target.createdTimestamp / 1000)}:R>`,
    ];

    if (member && "joinedTimestamp" in member && member.joinedTimestamp) {
      info.push(`**Joined:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`);
    }

    await interaction.reply({
      content: info.join("\n"),
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies UserContextMenu;
