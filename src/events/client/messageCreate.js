const { Events } = require('discord.js');
//const leveling = require('../../handlers/commands/levelingHandler');


module.exports = {
    name: Events.MessageCreate,
    once: false,
    execute: async (message, client) => {
        if (message.author.bot) return;

        //await leveling.addXP(message.guild.id, message.author.id, 10, message);

        // เรียกทุกคำสั่ง non-prefix
        for (const [name, command] of client.nonPrefixCommands) {
            try {
                await command.execute(message, client);
            } catch (err) {
                console.error(err);
            }
        }
    }
};
