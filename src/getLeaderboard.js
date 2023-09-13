const { calculatePoints, generateEmbeds } = require("./getRank");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function getUserData() {
  const docs = await db.collection("users").get();
  const users = {};
  docs.forEach((doc) => {
    const data = doc.data();
    const points = calculatePoints(
      data["stocksCount"] ?? 0,
      data["salesCount"] ?? 0
    );
    users[doc.id] = {
      points,
      stocksCount: data["stocksCount"] ?? 0,
      salesCount: data["salesCount"] ?? 0,
      revenue: data["revenue"] ?? 0,
    };
  });

  return users;
}

module.exports = async function getLeaderBoard(interaction) {
  const { channelId } = interaction;
  const allowedChannels = ["1129728839149436974", "1131954748807991488"];

  if (!allowedChannels.includes(channelId)) {
    return interaction.reply({
      content: `Sorry, this command can only be used in <#${"1131954748807991488"}> channel.`,
      ephemeral: true,
    });
  }

  const allowedRoles = [
    "1129738415634657340",
    "1129739274108031028",
    "1129739434489823282",
  ];
  if (!allowedRoles.some((role) => interaction.member._roles.includes(role))) {
    return interaction.reply({
      content: `Sorry, you don't have the permission to run this command.`,
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  const users = await getUserData();
  const sortedUsers = Object.entries(users).sort(
    (a, b) => b[1].points - a[1].points
  );
  const embedList = [];
  const fileList = [];
  async function processUser(user) {
    const username = user[0];

    const members = await interaction.guild.members.fetch({
      query: username,
      limit: 1,
    });
    const member = members.first();
    if (member !== undefined) {
      const empData = user[1];
      const { embed, file } = await generateEmbeds(
        member,
        empData["stocksCount"],
        empData["salesCount"],
        empData["revenue"]
      );
      embedList.push(embed);
      fileList.push(file);
    }
  }

  await Promise.all(sortedUsers.map(processUser));

  await interaction.followUp({ embeds: embedList, files: fileList });
};
