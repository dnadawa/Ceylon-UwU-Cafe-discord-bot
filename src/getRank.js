const {
  EmbedBuilder,
  MessageAttachment,
  AttachmentBuilder,
} = require("discord.js");
const canvacord = require("canvacord");
const { getFirestore } = require("firebase-admin/firestore");

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
  return Math.round(stockCount * 0.3 + salesCount * 0.4);
}

async function getUserCounts() {
  const docs = await db.collection("users").get();
  const users = {};
  docs.forEach((doc) => {
    const data = doc.data();
    const points = calculatePoints(
      data["stocksCount"] ?? 0,
      data["salesCount"] ?? 0
    );
    users[doc.id] = points;
  });

  return users;
}

function getRankByUsername(users, username) {
  const sortedUsers = Object.entries(users).sort((a, b) => b[1] - a[1]);
  const userIndex = sortedUsers.findIndex((user) => user[0] === username);
  const rank = userIndex + 1;
  return rank;
}

async function generateEmbeds(member, stocksCount, salesCount, revenue) {
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - member.joinedAt.getTime();
  const daysAsMember = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  const points = calculatePoints(
    stocksCount ?? 0,
    salesCount ?? 0
  );
  const levelDetails = getLevelAndXP(points);

  const roleColor = member.roles.cache.first().color.toString(16);
  const users = await getUserCounts();
  const rankNumber = getRankByUsername(users, member.user.username);
  const rankColor =
    rankNumber === 1
      ? "#FFd700"
      : rankNumber === 2
      ? "#c0c0c0"
      : rankNumber === 3
      ? "#cd7f32"
      : "#fec5e0";

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
  const attachment = new AttachmentBuilder(data).setName(`1_${member.user.username}.png`);
;


  const embed = new EmbedBuilder()
    .setTitle("Employee Card")
    .setDescription(`An Employee for ${daysAsMember} days.`)
    .setColor(0xfec5e0)
    .setAuthor({
      name: member.nickname,
      iconURL: member.user.displayAvatarURL(),
    })
    .setImage(`attachment://1_${member.user.username}.png`)
    .addFields(
      {
        name: "Total Stocks",
        value: (stocksCount ?? 0).toString(),
        inline: true,
      },
      {
        name: "Total Income",
        value: `\$ ${(revenue ?? 0).toString()}`,
        inline: true,
      }
    );

    return {
      embed: embed,
      file: attachment
    };
}

async function getRank(interaction, isEmployeeCardOf) {
  const { options, channelId } = interaction;
  const allowedChannels = ["1129728839149436974", "1131954748807991488"];

  if (!allowedChannels.includes(channelId)) {
    return interaction.reply({
      content: `Sorry, this command can only be used in <#${"1131954748807991488"}> channel.`,
      ephemeral: true,
    });
  }

  let member = interaction.member;

  if (isEmployeeCardOf) {
    const allowedRoles = [
      "1129738415634657340",
      "1129739274108031028",
      "1129739434489823282",
    ];
    if (
      !allowedRoles.some((role) => interaction.member._roles.includes(role))
    ) {
      return interaction.reply({
        content: `Sorry, you don't have the permission to run this command.`,
        ephemeral: true,
      });
    }

    member = options.getMember("employee");
  }

  await interaction.deferReply();

  const doc = await db.collection("users").doc(member.user.username).get();

  if (!doc.exists) {
    return await interaction.followUp({ content: "Cannot find record!" });
  }

  const empData = doc.data();
  const {embed, file} = await generateEmbeds(member, empData['stocksCount'], empData['salesCount'], empData['revenue']);
  
  await interaction.followUp({ embeds: [embed], files: [file] });
};

module.exports = {
  getRank,
  generateEmbeds,
  calculatePoints
};