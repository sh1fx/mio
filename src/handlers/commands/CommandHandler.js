const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
  // สร้าง Collection สำหรับ commands ถ้ายังไม่มี
  if (!client.commands) client.commands = new Collection();
  if (!client.nonPrefixCommands) client.nonPrefixCommands = new Collection();

  /**
   * Recursive loader สำหรับ commands
   * @param {string} dir - โฟลเดอร์ที่จะอ่าน
   * @param {Collection} collection - Collection ที่จะเก็บ command
   * @param {boolean} isSlash - true = slash commands, false = non-prefix
   */
  const loadCommands = (dir, collection, isSlash = true) => {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        loadCommands(fullPath, collection, isSlash);
      } else if (file.endsWith('.js')) {
        try {
          const command = require(fullPath);

          if (isSlash) {
            if (command?.data && command?.execute) {
              collection.set(command.data.name, command);
              console.log(`🏑 [LOADED] Slash Command: /${command.data.name}`);
            } else {
              console.warn(`[WARNING] ${fullPath} is missing "data" or "execute"`);
            }
          } else {
            if (command?.name && command?.execute) {
              collection.set(command.name, command);
              console.log(`💌 [LOADED] Non-prefix Command: ${command.name}`);
            } else {
              console.warn(`[WARNING] ${fullPath} is missing "name" or "execute"`);
            }
          }
        } catch (err) {
          console.error(`[ERROR] Failed to load command ${fullPath}:`, err);
        }
      }
    }
  };

  // --- Load Slash Commands ---
  const slashPath = path.join(__dirname, '../../commands/slash');
  loadCommands(slashPath, client.commands, true);

  // --- Load Non-Prefix Commands ---
   if (!client.nonPrefixCommands) client.nonPrefixCommands = new Collection();

  /**
   * Recursive loader สำหรับ commands
   * @param {string} dir - โฟลเดอร์ที่จะอ่าน
   * @param {Collection} collection - Collection ที่จะเก็บ command
   */
  const loadNonPrefixCommands = (dir, collection) => {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        loadNonPrefixCommands(fullPath, collection);
      } else if (file.endsWith('.js')) {
        try {
          const command = require(fullPath);

          if (command?.name && command?.execute) {
            collection.set(command.name, command);
            console.log(`💌 [LOADED] Non-prefix Command: ${command.name}`);
          } else {
            console.warn(`[WARNING] ${fullPath} is missing "name" or "execute"`);
          }
        } catch (err) {
          console.error(`[ERROR] Failed to load command ${fullPath}:`, err);
        }
      }
    }
  };

  // --- Load Non-Prefix Commands ---
  const nonPrefixPath = path.join(__dirname, '../../commands/nonslash');
  loadNonPrefixCommands(nonPrefixPath, client.nonPrefixCommands);
};