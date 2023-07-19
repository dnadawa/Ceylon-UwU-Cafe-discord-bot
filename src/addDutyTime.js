const { EmbedBuilder } = require("discord.js");

module.exports = async function addDutyTime(interaction) {
    const { options, member, channelId } = interaction;
    const allowedChannels = ['1129728839149436974','1129735021452865666'];

    if (!allowedChannels.includes(channelId)) {
      return interaction.reply({
        content: `Sorry, this command can only be used in <#${'1129735021452865666'}> channel.`,
        ephemeral: true
      });
    }

    const onTime = options.getString("duty-on-time");
    const offTime = options.getString("duty-off-time");

    // Validate the time format (hh:mm a)
    const timeRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9] (am|pm|AM|PM)?$/i;

    if (!timeRegex.test(onTime) || !timeRegex.test(offTime)) {
      return interaction.reply({
        content: "Invalid time format. Please use hh:mm a format, e.g., 09:30 am.",
        ephemeral: true
    });
    }

    const today = new Date();
    const todayFormatted = today.toLocaleDateString();

    const onTimeDate = new Date(`${todayFormatted} ${onTime.toUpperCase()}`);
    const offTimeDate = new Date(`${todayFormatted} ${offTime.toUpperCase()}`);

    if (offTimeDate < onTimeDate) {
      offTimeDate.setDate(offTimeDate.getDate() + 1);
    }

    const timeDifference = offTimeDate - onTimeDate;

    const totalHours = Math.floor(timeDifference / (1000 * 60 * 60));
    const totalMinutes = Math.floor((timeDifference / (1000 * 60)) % 60);

    const embed = new EmbedBuilder()
            .setTitle("Duty Time")
            .setColor(0xFEC5E0)
            .setAuthor({name: member.nickname, iconURL: member.user.displayAvatarURL()})
            .addFields(
              {name: "Date", value: todayFormatted},
              {name: "Duty on time", value: onTime.toUpperCase(), inline: true},
              {name: "Duty off time", value: offTime.toUpperCase(), inline: true},
              {name: "Total time", value: `${totalHours}h ${totalMinutes}m`, inline: true},
            )

            interaction.reply({embeds: [embed]});
};