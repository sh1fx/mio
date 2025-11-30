const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits,Partials,ActivityType,Events} = require('discord.js');
require('dotenv').config();
const mongoose = require('mongoose');

const client = new Client({ 
 intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildScheduledEvents
],
 partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
    Partials.ThreadMember
  ]


});
require('./handlers/commands/CommandHandler')(client);
//level ค่อยทำ
//require('./handlers/commands/levelingHandler');
require('./handlers/events/EventHandler')(client);

const Canvas = require('@napi-rs/canvas');
const FONT_DIR = path.join(__dirname,'assets', 'fonts');

if (fs.existsSync(FONT_DIR)) {
    Canvas.GlobalFonts.loadFontsFromDir(FONT_DIR);

    const familiesBuffer = Canvas.GlobalFonts.getFamilies();
    const familiesJSON = JSON.parse(familiesBuffer.toString());
    const familyNames = familiesJSON.map(f => f.family);

    console.log('--- 📬 Registered font families ---');

} else {
    console.warn('⚠️ WARNING: Font directory not found. Skipping font registration.');
}

// MongoDB
(async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- 📠 Connected to MongoDB successfully! --- ');
        client.mongoConnection = mongoose.connection;

        client.login(process.env.TOKEN);
         console.log('--- 💻 Bot is ready --- ');

    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error}`);
        process.exit(1);
    }
})();

client.login(process.env.TOKEN);

client.once(Events.ClientReady, (c) => {
    console.log(`loged in ${client.user.tag}`);
    client.user.setPresence({
        status: 'dnd',
        activities: [{ name: 'Restarting...', type: ActivityType.Listening }]
        
    });
    setTimeout(() => {
        
    }, 1000000);


});