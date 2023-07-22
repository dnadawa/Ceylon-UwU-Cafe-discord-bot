const { EmbedBuilder, MessageAttachment, AttachmentBuilder } = require("discord.js");
const canvacord = require("canvacord");
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

function getLevelAndXP(xp) {
  const xpRange = {
    p1: { minLevel: 1, maxLevel: 10, xpPerLevel: 150 },
    p2: { minLevel: 11, maxLevel: 30, xpPerLevel: 300 },
    p3: { minLevel: 31, maxLevel: 50, xpPerLevel: 500 },
    p4: { minLevel: 50, maxLevel: 100000000000, xpPerLevel: 700 },
  };

  let remainingXp = xp;
  let level = 1;
  let currentPhase = xpRange.p1;
  let currentPhaseIndex = 0;
  let progressXP = 0;

  while (remainingXp > 0) {
    if (level < currentPhase.maxLevel) {
      if (remainingXp < currentPhase.xpPerLevel) {
        progressXP = remainingXp;
        remainingXp = 0;
      } else {
        remainingXp -= currentPhase.xpPerLevel;
        level++;
        if (remainingXp <= 0 && level === currentPhase.maxLevel) {
          currentPhaseIndex++;
          currentPhase = Object.values(xpRange)[currentPhaseIndex];
        }
      }
    } else {
      currentPhaseIndex++;
      currentPhase = Object.values(xpRange)[currentPhaseIndex];
    }
  }

  return {
    level,
    progressXP,
    levelXP: currentPhase.xpPerLevel,
  };
}

function calculatePoints(stockCount, salesCount) {
  return Math.round((stockCount * 0.3) + (salesCount * 0.4));
}

async function getUserCounts() {
   const docs = await db.collection('users').get();
   const users = {};
   docs.forEach(doc => {
    const data = doc.data();
    const points = calculatePoints(data['stocksCount'] ?? 0, data['salesCount'] ?? 0);
    users[doc.id] = points;
   });

   return users;
}

function getRankByUsername(users, username) {
  const sortedUsers = Object.entries(users).sort((a, b) => b[1] - a[1]);
  const userIndex = sortedUsers.findIndex((user) => user[0] === username)
  const rank = userIndex + 1;
  return rank;
}

module.exports = async function getRank(interaction) {
    const { options, member, channelId } = interaction;
    const allowedChannels = ["1129728839149436974"];

  if (!allowedChannels.includes(channelId)) {
    return interaction.reply({
      content: `Sorry, this command can only be used in <#${"1131954748807991488"}> channel.`,
      ephemeral: true,
    });
  }
  await interaction.deferReply();

  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - interaction.member.joinedAt.getTime();
  const daysAsMember = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  const doc = await db.collection('users').doc(interaction.user.username).get();
  const empData = doc.data();

  const points = calculatePoints(empData['stocksCount'] ?? 0, empData['salesCount'] ?? 0);
  const levelDetails = getLevelAndXP(points);

  const roleColor = interaction.member.roles.cache.first().color.toString(16);
  const users = await getUserCounts();
  const rankNumber = getRankByUsername(users, member.user.username);
  const rankColor = rankNumber === 1 ? "#FFd700" : rankNumber === 2 ? "#c0c0c0" : rankNumber === 3 ? "#cd7f32" : "#fec5e0";
  
const rank = new canvacord.Rank()
    .setCurrentXP(levelDetails.progressXP)
    .setRequiredXP(levelDetails.levelXP)
    .setLevel(levelDetails.level)
    .setCustomStatusColor(`#${roleColor}`)
    .setProgressBar(rankColor, "COLOR")
    .setAvatar(member.user.displayAvatarURL())
    .setRank(rankNumber)
    .setUsername(member.nickname, `#${roleColor}`);

    const data = await rank.build();
    const attachment = new AttachmentBuilder(data).setName('img.png');

    const embed = new EmbedBuilder()
    .setTitle("Employee Card")
    .setDescription(`An Employee for ${daysAsMember} days.`)
    .setColor(0xfec5e0)
    .setAuthor({
      name: member.nickname,
      iconURL: member.user.displayAvatarURL(),
    })
    .setImage('attachment://img.png')
    .addFields(
      {name: "Total Stocks", value: empData['stocksCount'].toString(), inline: true},
      {name: "Total Income", value: `\$ ${empData['revenue'].toString()}`, inline: true},
    );

    await interaction.followUp({embeds: [embed], files: [attachment]});
}