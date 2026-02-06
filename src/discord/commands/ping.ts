import { SlashCommandBuilder } from "discord.js";
import type { Command, ModalConfig } from "../types";
import { Modal } from "../utils/modal";

const MODAL_INFO: ModalConfig = {
  title: "Ping Survey",
  questions: [
    {
      id: "name",
      label: "What's your name?",
      description: "Enter your display name",
      style: "TEXT-SHORT",
      placeholder: "John Doe",
      minLength: 2,
      maxLength: 32,
    },
    {
      id: "feedback",
      label: "Feedback",
      description: "Any thoughts on the bot?",
      style: "TEXT-LONG",
      placeholder: "I think this bot is...",
      required: false,
    },
  ],
};

export default {
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),

  execute: async (_client, interaction, _args) => {
    const modal = new Modal(MODAL_INFO, interaction);
    const submission = await modal.create();

    if (submission) {
      const values = modal.getValues();
      await submission.reply(`Pong! You entered:\n\`\`\`json\n${JSON.stringify(values, null, 2)}\n\`\`\``);
    }
  },
} satisfies Command;
