# Discord.js v14 Boilerplate

A type-safe, all in one Discord bot boilerplate built with **Bun**, **TypeScript**, and **discord.js v14**. Features dynamic command/event loading, Drizzle ORM, and Docker support.

## Features

This is made using bun and discord.js v14, I've included one of the utils I have made for other bots for modals which i find quite useful.
Additionally this boilerplate uses postgres for database support.
I could add mongoose and mongo atlas support if anyone wants.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- A [Discord application](https://discord.com/developers/applications) with a bot token
- PostgreSQL (if using the database features)

### Setup

```bash
git clone <your-repo-url>
cd djs_v14_boiler

bun install

cp .env.example .env
```

Required environment variables:

```env
TOKEN=your-bot-token
CLIENT_ID=your-application-id
GUILD_ID=your-development-guild-id
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Running

```bash
# Development (hot reload)
bun run dev

# Production
bun run start

# Deploy commands only
bun run deploy
```

Commands are auto-deployed on startup. The bot registers guild-scoped commands for instant updates during development.
Feel free to change this behavior in `src/discord/deploy-commands.ts`.

### Docker

There is a dockerfile that is included. Just use it like so:
```bash
docker build -t discord-bot .
docker run --env-file .env discord-bot
```

## Project Structure

```
src/
├── index.ts                     # Entry point
├── env.ts                       
├── db/
│   ├── index.ts                 # Drizzle client
│   └── schemas/                 # Database schemas
├── discord/
│   ├── index.ts                 
│   ├── types.ts                 
│   ├── deploy-commands.ts       # Command registration script
│   ├── commands/                # Slash commands (one per file)
│   ├── contextMenus/
│   │   ├── user/                # User context menus
│   │   └── message/             # Message context menus
│   ├── events/                  # Event listeners (one per file)
│   └── utils/                   # Helpers (modal, autocomplete)
```

Files are auto-discovered — just drop a new file in the right directory and it's loaded.

## Adding a Command

Create a file in `src/discord/commands/`:

```ts
// src/discord/commands/hello.ts
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types";

export default {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Say hello")
    .addUserOption(opt =>
      opt.setName("user").setDescription("Who to greet"),
    ),

  async execute(_client, interaction, args) {
    const user = args.user ?? interaction.user;
    await interaction.reply(`Hello, ${user}!`);
  },
} satisfies Command;
```

### Subcommands

Subcommand handlers are methods on the command object. The router calls them automatically.

```ts
// src/discord/commands/config.ts
export default {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Bot config")
    .addSubcommand(sub =>
      sub.setName("view").setDescription("View config"),
    )
    .addSubcommand(sub =>
      sub.setName("reset").setDescription("Reset config"),
    ),

  // Method name matches the subcommand name
  async view(_client, interaction, args) { /* ... */ },
  async reset(_client, interaction, args) { /* ... */ },

  // Required but unused for subcommand-only commands
  async execute() {},
} satisfies Command;
```

For subcommand groups, use double underscores: `groupName__subcommandName`.

### Autocomplete

Add an `autocomplete` method to your command:

```ts
export default {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search")
    .addStringOption(opt =>
      opt.setName("query").setDescription("Search query").setAutocomplete(true),
    ),

  async autocomplete(_client, interaction) {
    const focused = interaction.options.getFocused();
    await interaction.respond(
      toChoices(["apple", "banana", "cherry"], focused),
    );
  },

  async execute(_client, interaction, args) {
    await interaction.reply(`You picked: ${args.query}`);
  },
} satisfies Command;
```

## Adding an Event

Create a file in `src/discord/events/`:

```ts
// src/discord/events/messageCreate.ts
import { Events, type Client, type Message } from "discord.js";
import type { BotEvent } from "../types";

export default {
  event: Events.MessageCreate,
  once: false,
  bot: true,  // receive client as first arg
  async execute(client: Client, message: Message) {
    if (message.content === "!ping") {
      await message.reply("Pong!");
    }
  },
} satisfies BotEvent<[Client, Message]>;
```

- `event` — the Discord.js event name (use the `Events` enum)
- `once` — `true` to listen only once, `false` for persistent
- `bot` — `true` to inject the client as the first parameter

## Adding a Context Menu

### User Context Menu

```ts
// src/discord/contextMenus/user/avatar.ts
import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import type { UserContextMenu } from "../../types";

export default {
  data: new ContextMenuCommandBuilder()
    .setName("Get Avatar")
    .setType(ApplicationCommandType.User),

  async execute(_client, interaction) {
    const user = interaction.targetUser;
    await interaction.reply(user.displayAvatarURL({ size: 1024 }));
  },
} satisfies UserContextMenu;
```

### Message Context Menu

Same pattern, in `src/discord/contextMenus/message/` with `ApplicationCommandType.Message`.

## Utilities

### Modal Helper

Build modals declaratively without managing custom IDs or component rows:

```ts
import { Modal } from "../utils/modal";

const config = {
  title: "Feedback",
  questions: [
    { label: "What do you think?", style: "TEXT-LONG", placeholder: "..." },
    { label: "Rating", style: "TEXT-SHORT", required: true },
  ],
};

// Inside a command execute:
const modal = new Modal(config, interaction);
const submission = await modal.create(); // shows modal, awaits response
if (submission) {
  const values = modal.getValues();
  // values = { "What do you think?": "...", "Rating": "..." }
}
```

### Autocomplete Filter

```ts
import { toChoices } from "../utils/autocomplete";

// Filters and formats choices for autocomplete responses (max 25)
const choices = toChoices(["apple", "banana"], focusedValue);
```

## Scripts

| Script                 | Description              |
|------------------------|--------------------------|
| `bun run dev`          | Start with hot reload    |
| `bun run start`        | Production start         |
| `bun run deploy`       | Register slash commands  |
| `bun run typecheck`    | Type check with `tsc`    |
| `bun run lint`         | Run ESLint               |
| `bun run lint:fix`     | Run ESLint with auto-fix |
| `bun run format`       | Format with Prettier     |
| `bun run format:check` | Check formatting         |

## License

ISC
