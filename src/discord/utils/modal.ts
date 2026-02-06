import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ChatInputCommandInteraction,
  type ModalSubmitInteraction,
} from "discord.js";
import type { ModalConfig, ModalQuestion } from "../types";

const STYLE_MAP: Record<ModalQuestion["style"], TextInputStyle> = {
  "TEXT-SHORT": TextInputStyle.Short,
  "TEXT-LONG": TextInputStyle.Paragraph,
};

export class Modal {
  private info: ModalConfig;
  private interaction: ChatInputCommandInteraction;
  private submission: ModalSubmitInteraction | null = null;

  constructor(info: ModalConfig, interaction: ChatInputCommandInteraction) {
    this.info = info;
    this.interaction = interaction;
  }

  async create(): Promise<ModalSubmitInteraction | null> {
    const id = crypto.randomUUID();

    const labels = this.buildLabels();
    const modal = new ModalBuilder()
      .setCustomId(id)
      .setTitle(this.info.title)
      .addLabelComponents(...labels);

    await this.interaction.showModal(modal);

    const filter = (i: ModalSubmitInteraction) => i.customId === id;

    try {
      this.submission = await this.interaction.awaitModalSubmit({
        time: 60_000,
        filter,
      });
    } catch {
      // Modal timed out or was dismissed
    }

    return this.submission;
  }

  private buildLabels(): LabelBuilder[] {
    return this.info.questions.map((question, idx) => {
      const textInput = new TextInputBuilder().setCustomId(`question_${idx}`).setStyle(STYLE_MAP[question.style]);

      if (question.placeholder) {
        textInput.setPlaceholder(question.placeholder);
      }
      if (question.required !== undefined) {
        textInput.setRequired(question.required);
      }
      if (question.minLength !== undefined) {
        textInput.setMinLength(question.minLength);
      }
      if (question.maxLength !== undefined) {
        textInput.setMaxLength(question.maxLength);
      }
      if (question.defaultValue) {
        textInput.setValue(question.defaultValue);
      }

      const label = new LabelBuilder().setLabel(question.label).setTextInputComponent(textInput);

      if (question.description) {
        label.setDescription(question.description);
      }

      return label;
    });
  }

  getSubmission(): ModalSubmitInteraction | null {
    return this.submission;
  }

  getValues(): Record<string, string> | null {
    if (!this.submission) return null;

    const values: Record<string, string> = {};
    for (let idx = 0; idx < this.info.questions.length; idx++) {
      const question = this.info.questions[idx];
      if (!question) continue;
      const key = question.id ?? question.label;
      values[key] = this.submission.fields.getTextInputValue(`question_${idx}`);
    }
    return values;
  }
}
