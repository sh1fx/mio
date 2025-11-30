const { AttachmentBuilder, SlashCommandBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');
const { request } = require('undici');
const genshinCharacters = require('../../../models/bot/chcurl');

const FALLBACK_IMAGE_URL = 'https://api.hakush.in/gi/UI/UI_AvatarIcon_Hutao.webp';

// โหลดภาพจาก URL แบบ safe
async function loadImageSafe(url) {
    try {
        const { body, statusCode } = await request(url);
        if (statusCode !== 200) throw new Error(`HTTP ${statusCode}`);
        const buffer = Buffer.from(await body.arrayBuffer());
        return await Canvas.loadImage(buffer);
    } catch (err) {
        console.warn(`รูป 404: ${url} → ใช้ fallback`);
        const { body } = await request(FALLBACK_IMAGE_URL);
        const buffer = Buffer.from(await body.arrayBuffer());
        return await Canvas.loadImage(buffer);
    }
}

// โหลด local file แบบ safe
function loadLocalImageSafe(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        return Canvas.loadImage(buffer);
    } catch (err) {
        console.error('โหลดไฟล์ local ล้มเหลว:', filePath, err);
        // สร้าง placeholder
        const placeholder = Canvas.createCanvas(200, 200);
        const ctx = placeholder.getContext('2d');
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#666';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No Image', 100, 100);
        return Canvas.loadImage(placeholder.encodeSync('png'));
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('คุณตรงสเปคใครใน Genshin'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        // เลือกตัวละคร Genshin แบบ random
        const getRandomCharacter = () => {
            if (!genshinCharacters || genshinCharacters.length === 0) {
                return { name: 'Error', img: FALLBACK_IMAGE_URL };
            }
            const randomIndex = Math.floor(Math.random() * genshinCharacters.length);
            return genshinCharacters[randomIndex];
        };

        const getRandomCompatibility = () => Math.floor(Math.random() * 101);

        const char = getRandomCharacter();
        const compatibility = getRandomCompatibility();
        const { name, img } = char;

        // Canvas
        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        // โหลดภาพ local แบบ safe
        const BACKGROUND_PATH = path.join(process.cwd(), 'src/assets/image/furina1.jpg');
        const BLACK_PATH = path.join(process.cwd(), 'src/assets/image/black.jpg');
        const HEART_PATH = path.join(process.cwd(), 'src/assets/image/heart.png');

        const background = await loadLocalImageSafe(BACKGROUND_PATH);
        const black = await loadLocalImageSafe(BLACK_PATH);
        const heart = await loadLocalImageSafe(HEART_PATH);

        //ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // avatar ผู้ใช้
        const { body: userBody } = await request(interaction.user.displayAvatarURL({ extension: 'jpg' }));
        const avatar = await Canvas.loadImage(Buffer.from(await userBody.arrayBuffer()));

        // avatar ตัวละคร Genshin
        const avatar2 = await loadImageSafe(img);

        // วาด avatar + overlay
        ctx.drawImage(avatar, 150, 25, 200, 200);
        ctx.drawImage(black, 350, 25, 200, 200);
        ctx.drawImage(avatar2, 350, 25, 200, 200);
        ctx.drawImage(heart, 300, 80, 100, 100);

        // เขียน % compatibility
        ctx.font = 'bold 30px Sarabun-ExtraBold';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${compatibility}%`, canvas.width / 2.15, canvas.height / 1.8);

        // ส่งรูป
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-image.png' });
        await interaction.editReply({ files: [attachment] });
    }
};
