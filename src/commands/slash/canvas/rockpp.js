const { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const path = require('path');
const { request } = require('undici');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('เป่ายิงฉุบ')
        .setDescription('เล่นเกมเป่ายิงฉุบกับท่านเทพ'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        // --- Canvas ---
        Canvas.GlobalFonts.loadFontsFromDir(path.join(process.cwd(), 'src/assets/font'));
        const canvas = Canvas.createCanvas(700, 250);
        const context = canvas.getContext('2d');

        const BACKGROUND_PATH = path.join(process.cwd(), 'src/assets/image/bg7.jpg');
        const background = await Canvas.loadImage(BACKGROUND_PATH);
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        const { body } = await request(interaction.user.displayAvatarURL({ extension: 'jpg', size: 512 }));
        const avatar = await Canvas.loadImage(await body.arrayBuffer());
        const avatar2Path = path.join(process.cwd(), 'src/assets/image/bg8.jpg');
        const avatar2 = await Canvas.loadImage(avatar2Path);

         context.save();
        context.beginPath();
        context.arc(125, 125, 100, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(avatar2, 25, 25, 200, 200);
        context.restore();

        // วาด avatar 2 (ผู้เล่น)
        const avatarX = 450;
        const avatarY = 25;
        const avatarSize = 200;
        context.save();
        context.beginPath();
        context.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        context.restore();

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'rps-image.png' });

        // --- Buttons พร้อม custom emoji ---
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rock')
                    .setLabel('ค้อน')
                    .setEmoji('<:r_:1443309603034107965>')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('paper')
                    .setLabel('กระดาษ')
                    .setEmoji('<:p_:1443309703315849337>')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('scissors')
                    .setLabel('กรรไกร')
                    .setEmoji('<:s_:1443309658126155798>')
                    .setStyle(ButtonStyle.Primary)
            );

        const message = await interaction.editReply({
            content: `${interaction.member} เจ้าจงเลือกมาสิ จะค้อน กระดาษ หรือกรรไกรดีนะ....`,
            files: [attachment],
            components: [row]
        });

        // --- Collector สำหรับจับปุ่ม ---
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'คุณไม่ได้เล่นเกมนี้!', ephemeral: true });
            }

            // ปิดปุ่มหลังเลือก
            row.components.forEach(button => button.setDisabled(true));
            await i.update({ components: [row] });

            const userChoice = i.customId; // 'rock', 'paper', 'scissors'

            // --- AI สุ่ม ---
            const choices = ['rock', 'paper', 'scissors'];
            const aiChoice = choices[Math.floor(Math.random() * choices.length)];

            // --- สรุปผล ---
            let resultText = '';
            if (userChoice === aiChoice) {
                resultText = 'ฟูรินะ: “เสมอกันงั้นหรือ? ฮึ! ข้ายังไม่ได้เอาจริงต่างหาก  ”';
            } else if (
                (userChoice === 'rock' && aiChoice === 'scissors') ||
                (userChoice === 'paper' && aiChoice === 'rock') ||
                (userChoice === 'scissors' && aiChoice === 'paper')
            ) {
                resultText = 'ฟูรินะ: “แพ้เช่นนี้… ฮึ! เมื่อกี้ข้าก็แค่กดปุ่มมั่วๆเท่านั้นเอง ข้ายังไม่ได้เอาจริงซักหน่อย';
            } else {
                resultText = 'ฟูรินะ: “หึ ชนะเช่นนี้ช่างเป็นเรื่องธรรมดา ข้าเหนือกว่าเจ้ามาตั้งแต่แรกอยู่แล้ว';
            }

           let emoji;
if (userChoice === 'rock') {
    emoji = "<:r_:1443309603034107965>";
} else if (userChoice === 'paper') {
    emoji = "<:p_:1443309703315849337>";
} else if (userChoice === 'scissors') {
    emoji = "<:s_:1443309658126155798>";
}

let emoji2;
if (aiChoice === 'rock') {
    emoji2 = "<:rr:1443309972086849698>";
} else if (aiChoice === 'paper') {
    emoji2 = "<:pp:1443309859083653211>";
} else if (aiChoice === 'scissors') {
    emoji2 = "<:ss:1443309784005742824>";
}
            await i.followUp({ content: `คุณเลือก: ${emoji} \nFurina เลือก: ${emoji2} \n${resultText}` });
            collector.stop();
        });

        collector.on('end', async collected => {
            // ถ้ายังไม่เลือกใคร ปิดปุ่ม
            row.components.forEach(button => button.setDisabled(true));
            await message.edit({ components: [row] });
        });
    }
};
