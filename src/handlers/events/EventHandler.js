const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../../events');
    const eventCategories = fs.readdirSync(eventsPath);

    for (const category of eventCategories) {
        const categoryPath = path.join(eventsPath, category);
        if (!fs.statSync(categoryPath).isDirectory()) continue;

        const eventFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(categoryPath, file);
            const event = require(filePath);

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }

            console.log(`✅ [LOADED EVENT] ${file}`);
        }
    }
};
