const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

const slashPath = path.join(__dirname, 'commands', 'slash');
const commandCategories = fs.readdirSync(slashPath);

for (const category of commandCategories) {
    const categoryPath = path.join(slashPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(categoryPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`[LOADED] Slash Command: /${command.data.name} from ${category}`);
        } else {
            console.warn(`[WARNING] The command at ${filePath} is missing "data" or "execute"`);
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        //global
        //const data = await rest.put(Routes.applicationCommands(process.env.clientId), { body: commands });
        //guild
        const data = await rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
