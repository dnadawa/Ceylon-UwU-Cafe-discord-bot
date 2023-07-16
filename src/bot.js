const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
require("dotenv").config();
const addDutyTime = require("./addDutyTime");
const addStocks = require("./addStocks");

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

client.login(process.env.TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "add-duty-time") {
    await addDutyTime(interaction);
  }
  if (commandName === "add-stocks") {
    await addStocks(interaction);
  }
});
