const { EmbedBuilder } = require("discord.js");

module.exports = async function getRank(interaction) {
    const { options, member, channelId } = interaction;
    const allowedChannels = ["1129728839149436974"];

  if (!allowedChannels.includes(channelId)) {
    return interaction.reply({
      content: `Sorry, this command can only be used in <#${"1129735070299721728"}> channel.`,
      ephemeral: true,
    });
  }

  
}