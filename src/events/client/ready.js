const { Events, ActivityType ,PresenceUpdateStatus} = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
client.user.setPresence({
      activities: [{
        name: 'กำลังดู  Red, White & Royal Blue', 
        type: ActivityType.Streaming,  
        url: 'https://www.twitch.tv/furinuy' 
      }],
      status: 'online'
    });

  }
};