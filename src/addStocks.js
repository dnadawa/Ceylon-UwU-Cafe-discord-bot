const { EmbedBuilder } = require("discord.js");
var admin = require("firebase-admin");
const moment = require('moment-timezone');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

var serviceAccount = require("./../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

async function addSingleRecord(userName, date, items) {
  const docID = userName + "|" + date;
  const total = getTotalCount(items);
  
  await db.collection('stocks').doc(docID).set({
    user: userName,
    time: Timestamp.now(),
    total: total,
    ...items
  });

  await db.collection('users').doc(userName).set({ 'stocksCount': FieldValue.increment(total) }, { merge: true });
}

module.exports = async function addStocks(interaction) {
  const { options, member, channelId } = interaction;
  const allowedChannels = ["1129728839149436974", "1129735070299721728"];

  if (!allowedChannels.includes(channelId)) {
    return interaction.reply({
      content: `Sorry, this command can only be used in <#${"1129735070299721728"}> channel.`,
      ephemeral: true,
    });
  }
  await interaction.deferReply();

  const bubbleTeaCount = options.getNumber("bubble-tea");
  const coffeeCount = options.getNumber("coffee");
  const latteCount = options.getNumber("latte");
  const cupcakeCount = options.getNumber("cupcake");
  const iceCreamSandwichCount = options.getNumber("ice-cream-sandwich");
  const chickenPastelCount = options.getNumber("chicken-pastel");
  const nutellaPancakeCount = options.getNumber("nutella-pancake");
  const nutellaWaffelCount = options.getNumber("nutella-waffel");
  const oreoPancakeCount = options.getNumber("oreo-pancake");
  const itemList = {
    "Bubble Tea": bubbleTeaCount,
    Coffee: coffeeCount,
    Latte: latteCount,
    Cupcake: cupcakeCount,
    "Ice-cream Sandwich": iceCreamSandwichCount,
    "Chicken Pastel": chickenPastelCount,
    "Nutella Pancake": nutellaPancakeCount,
    "Nutella Waffel": nutellaWaffelCount,
    "Oreo Pancake": oreoPancakeCount,
  };

  const allValuesNull = Object.values(itemList).every(
    (value) => value === null || value === 0
  );
  const anyValueNotPositiveInteger = Object.values(itemList).some(
    (value) => value !== null && (!Number.isInteger(value) || value <= 0)
  );

  if (allValuesNull || anyValueNotPositiveInteger) {
    return interaction.reply({
      content:
        "Please select at least one item, and ensure all numbers are positive integers.",
      ephemeral: true,
    });
  }

  const today = new Date();
  const todayFormatted = today.toLocaleDateString();

  const embed = new EmbedBuilder()
    .setTitle("Stock Details")
    .setColor(0xfec5e0)
    .setAuthor({
      name: member.nickname,
      iconURL: member.user.displayAvatarURL(),
    })
    .setDescription(`${member.nickname} have prepared the following items.`)
    .addFields({ name: "Date", value: todayFormatted });

    const dbData = {};

  for (const [itemName, itemCount] of Object.entries(itemList)) {
    if (itemCount !== null) {
      embed.addFields({ name: itemName, value: itemCount.toString() });
      dbData[itemName] = itemCount;
    }
  }

  await addSingleRecord(interaction.user.username, moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), dbData);

  await interaction.followUp({ embeds: [embed] });
};

function getTotalCount(items) {
  let totalCount = 0;
  
  for (const count of Object.values(items)) {
    totalCount += count;
  }
  
  return totalCount;
}