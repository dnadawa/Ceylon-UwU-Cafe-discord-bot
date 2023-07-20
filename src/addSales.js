const { EmbedBuilder } = require("discord.js");
const moment = require('moment-timezone');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const db = getFirestore();

async function addSingleRecord(userName, date, items, income) {
  const docID = userName + "|" + date;
  const total = getTotalCount(items);
  
  await db.collection('sales').doc(docID).set({
    user: userName,
    time: Timestamp.now(),
    total: total,
    income: income,
    ...items
  });

    await db.collection('users').doc(userName).set(
      {
        'salesCount': FieldValue.increment(total),
        'revenue': FieldValue.increment(income),
      }, {merge: true});

}

module.exports = async function addSales(interaction) {
  const { options, member, channelId } = interaction;
  const allowedChannels = ["1129728839149436974", "1131565102018089052"];

  if (!allowedChannels.includes(channelId)) {
    return interaction.reply({
      content: `Sorry, this command can only be used in <#${"1131565102018089052"}> channel.`,
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
  const promotion = options.getString("promotion");
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
  const priceList = {
    "Bubble Tea": 100,
    Coffee: 75,
    Latte: 75,
    Cupcake: 130,
    "Ice-cream Sandwich": 170,
    "Chicken Pastel": 200,
    "Nutella Pancake": 200,
    "Nutella Waffel": 200,
    "Oreo Pancake": 200,
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

  const currentTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm a');

  const embed = new EmbedBuilder()
    .setTitle("Sales")
    .setColor(0xfec5e0)
    .setAuthor({
      name: member.nickname,
      iconURL: member.user.displayAvatarURL(),
    })
    .setDescription(`${member.nickname} have sold the following items.`)
    .addFields({ name: "Date & Time", value: currentTime });

  const dbData = {};
  let total = 0;
  for (const [itemName, itemCount] of Object.entries(itemList)) {
    if (itemCount !== null) {
      embed.addFields({ name: itemName, value: itemCount.toString() });
      total += (priceList[itemName] * itemCount);
      dbData[itemName] = itemCount;
    }
  }

  if(promotion !== null){
    embed.addFields({ name: "Promotion", value: promotion });
    dbData['Promotion'] = promotion;
  }
  embed.addFields({ name: 'Total', value: `\$${total}`});

   await addSingleRecord(interaction.user.username, moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), dbData, total);
  
   await interaction.followUp({ embeds: [embed] });
};

function getTotalCount(items) {
  let totalCount = 0;
  
  for (const count of Object.values(items)) {
    if(Number.isInteger(count))
      totalCount += count;
  }
  
  return totalCount;
}