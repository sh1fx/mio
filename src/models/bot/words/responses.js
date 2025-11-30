const fs = require('fs');
const path = require('path');

const loadJSON = (file) => {
  try {
    const filePath = path.join(__dirname, './wordjsonfile', file);
     console.log(`✨ โหลด ${file}`);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`โหลด ${file} ไม่สำเร็จ:`, err.message);
    return [];
  }
};

const responses = [
  ...loadJSON('aboutchc.json'),
  ...loadJSON('drama.json'),
  ...loadJSON('greeting.json'),
  ...loadJSON('food.json'),
  ...loadJSON('gasha.json'),
  ...loadJSON('locations.json'),
  ...loadJSON('questions.json'),
   ...loadJSON('wtf.json'),
  

].filter(item => 
  Array.isArray(item.keywords) && 
  typeof item.response === 'string' && 
  item.response.trim()
  
);

const fallbackReplies = loadJSON('fallback.json')
  .filter(r => typeof r === 'string' && r.trim());

module.exports = { responses, fallbackReplies };