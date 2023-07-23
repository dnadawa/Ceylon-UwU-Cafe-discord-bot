const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");
require("dotenv").config();

const commands = [
  {
    name: "add-duty-time",
    description: "Record duty on and off times!",
    options: [
      {
        name: 'duty-on-time',
        description: 'Duty on time in "hh:mm a" format. (eg: 09:30 AM)',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'duty-off-time',
        description: 'Duty off time in "hh:mm a" format. (eg: 09:30 AM)',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ]
  },
  {
    name: "add-stocks",
    description: "Record prepared food & drinks",
    options: [
      {
        name: 'bubble-tea',
        description: 'Bubble tea (sum of all flavours)',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'coffee',
        description: 'Coffee',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'latte',
        description: 'Latte',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'cupcake',
        description: 'Cup cake (sum of all flavours)',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'ice-cream-sandwich',
        description: 'Ice-creame sandwich (sum of all flavours)',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'chicken-pastel',
        description: 'Chicken Pastel',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'nutella-pancake',
        description: 'Nutella Pancake',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'nutella-waffel',
        description: 'Nutella Waffel',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'oreo-pancake',
        description: 'Oreo Pancake',
        type: ApplicationCommandOptionType.Number,
      },
    ]
  },
  {
    name: "add-sales",
    description: "Record sold food & drinks",
    options: [
      {
        name: 'bubble-tea',
        description: 'Bubble tea (sum of all flavours)',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'coffee',
        description: 'Coffee',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'latte',
        description: 'Latte',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'cupcake',
        description: 'Cup cake (sum of all flavours)',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'ice-cream-sandwich',
        description: 'Ice-creame sandwich (sum of all flavours)',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'chicken-pastel',
        description: 'Chicken Pastel',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'nutella-pancake',
        description: 'Nutella Pancake',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'nutella-waffel',
        description: 'Nutella Waffel',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'oreo-pancake',
        description: 'Oreo Pancake',
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'promotion',
        description: 'Name of the promotion (if applies)',
        type: ApplicationCommandOptionType.String,
      },
    ]
  },
  {
    name: "employee-card",
    description: "Get the employee record card",
  },
  {
    name: "employee-card-of",
    description: "Get the employee record card of a specefic employee",
    options: [
      {
        name: 'employee',
        description: 'Employee',
        type: ApplicationCommandOptionType.User,
        required: true
      },
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
