const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const path = require('path');
const { request } = require('undici');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hot')
        .setDescription('เช็คความฮ็อตของคุณ'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        Canvas.GlobalFonts.loadFontsFromDir(path.join(process.cwd(), 'src', 'assets', 'font'));

        const canvas = Canvas.createCanvas(1131, 1600);
        const context = canvas.getContext('2d');

        const BACKGROUND_PATH = path.join(process.cwd(), 'src', 'assets', 'image', 'bc1.jpg');
        const background = await Canvas.loadImage(BACKGROUND_PATH);

        // load avatar ผู้ใช้
        const { body } = await request(interaction.user.displayAvatarURL({ extension: 'jpg' }));
        const avatar = await Canvas.loadImage(await body.arrayBuffer());

        // ฟังก์ชันโหลดภาพพร้อม fallback
        async function loadImageWithFallback(url, fallbackUrl) {
            try {
                return await Canvas.loadImage(url);
            } catch (err) {
                console.warn(`Failed to load image ${url}, using fallback: ${fallbackUrl}`);
                return await Canvas.loadImage(fallbackUrl);
            }
        }

        // โหลดตัวละคร Genshin
        const genshinCharacters = require('../../../models/bot/chcurl');
        function getRandomGenshinCharacter() {
            const randomIndex = Math.floor(Math.random() * genshinCharacters.length);
            return genshinCharacters[randomIndex];
        }

        // ดึงตัวละคร 2 ตัวไม่ซ้ำกัน
        let char1 = getRandomGenshinCharacter();
        let char2 = getRandomGenshinCharacter();
        while (char2.name === char1.name) {
            char2 = getRandomGenshinCharacter();
        }

        const { img: img1 } = char1;
        const { img: img2 } = char2;

        // โหลด Avatar ตัวละครพร้อม fallback
        const avatar2 = await loadImageWithFallback(
            img1,
            'https://api.hakush.in/gi/UI/UI_AvatarIcon_Faruzan.webp'
        );

        const avatar3 = await loadImageWithFallback(
            img2,
            'https://api.hakush.in/gi/UI/UI_AvatarIcon_Kaveh.webp'
        );

        //------------------------------------------
        // ฟังก์ชันวาดสี่เหลี่ยมขอบมน
        //------------------------------------------
        function roundRect(ctx, x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }

        //------------------------------------------
        // วาด BG
        //------------------------------------------
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        //------------------------------------------
        // ฟังก์ชันวาด avatar เป็นวงกลม + กรอบ
        //------------------------------------------
        function drawCircularAvatar(img, x, y, size) {
            context.save();
            context.beginPath();
            context.arc(x + size / 2, y + size / 2, (size / 2) + 6, 0, Math.PI * 2);
            context.strokeStyle = "#ffffff";
            context.lineWidth = 12;
            context.stroke();
            context.closePath();
            context.restore();

            context.save();
            context.beginPath();
            context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            context.closePath();
            context.clip();
            context.drawImage(img, x, y, size, size);
            context.restore();
        }

        //------------------------------------------
        // วาดรูปโปรไฟล์ตรงกลาง
        //------------------------------------------
        const avatarSize = 450;
        const avatarX = (canvas.width - avatarSize) / 2;
        const avatarY = 850;
        drawCircularAvatar(avatar, avatarX, avatarY, avatarSize);

        //------------------------------------------
        // วาดรูปซ้าย–ขวา (ตัวละคร Genshin)
        //------------------------------------------
        const avatar2Size = 400;
        const avatar2X = (canvas.width - avatar2Size) / 30;
        const avatar2Y = 150;
        drawCircularAvatar(avatar2, avatar2X, avatar2Y, avatar2Size);

        const avatar3Size = 400;
        const avatar3X = (canvas.width - avatar3Size) / 1.040;
        const avatar3Y = 150;
        drawCircularAvatar(avatar3, avatar3X, avatar3Y, avatar3Size);

        //------------------------------------------
        // กล่องข้อความขอบมนใต้รูปกลาง
        //------------------------------------------
        const boxWidth = 500;
        const boxHeight = 120;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = avatarY + avatarSize + 20;

        context.fillStyle = 'rgba(36, 23, 211, 0.73)';
        roundRect(context, boxX, boxY, boxWidth, boxHeight, 25);
        context.fill();

        context.fillStyle = '#ffffffff';
        context.font = '85px "Mitr"';
        context.textAlign = 'center';
        context.fillText(interaction.member.displayName, canvas.width / 2, boxY + 75);

        //------------------------------------------
        // ส่งภาพกลับ
        //------------------------------------------
        const attachment = new AttachmentBuilder(await canvas.encode('png'), {
            name: 'profile-image.png'
        });

        interaction.editReply({ files: [attachment] });
    }
};
