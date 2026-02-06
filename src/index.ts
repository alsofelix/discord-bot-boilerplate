import { env } from "./env";
import "./discord/deploy-commands";
import DiscordBot from "./discord";

await new DiscordBot(env.TOKEN).start();
