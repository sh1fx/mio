const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ทายเหรียญ')
        .setDescription('ทายผลด้านหัวหรือก้อยของเหรียญ'),
    
    async execute(interaction) {
        await interaction.deferReply();

        // --- สร้างปุ่ม ---
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('heads')
                    .setLabel('หัว')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('tails')
                    .setLabel('ก้อย')
                    .setStyle(ButtonStyle.Primary)
            );

        // ส่ง GIF พร้อมปุ่ม
        const emb = new EmbedBuilder()
        .setColor('Blurple')
        .setImage('https://media.tenor.com/lFqq1S5jr6IAAAAi/geometry-dash-secret-coin.gif')
        const message = await interaction.editReply({
            content: `${interaction.user} เลือกด้านที่คิดว่าจะออก!`,
            components: [row],
            embeds:[emb]
        });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 20000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'คุณไม่ได้เล่นเกมนี้!', ephemeral: true });
            }

            // ปิดปุ่มหลังเลือก
            row.components.forEach(btn => btn.setDisabled(true));
            await i.update({ components: [row] });

            const userChoice = i.customId; // 'heads' หรือ 'tails'

            // บอทสุ่มผล
            const coinSides = ['heads', 'tails'];
            const coinResult = coinSides[Math.floor(Math.random() * 2)];

            // ข้อความ Furina
            let resultText = '';
            if (userChoice === coinResult) {
                resultText = 'ฟูรินะ: “ฮึ! เจ้าโชคดีนิดหน่อยนะ แต่ข้ายังเหนือกว่าเจ้าหลายขุม 😎”';
            } else {
                resultText = 'ฟูรินะ: “ฮ่า ๆ แพ้แล้วสินะ? ข้าได้หัวเราะฟรี ๆ 😏 เจ้าไม่รอดมือเทพเจ้าแล้ว!”';
            }

            await i.followUp({
                content: `คุณเลือก: ${userChoice === 'heads' ? 'หัว' : 'ก้อย'}\nผลลัพธ์: ${coinResult === 'heads' ? 'หัว' : 'ก้อย'}\n${resultText}`
            });

            collector.stop();
        });

        collector.on('end', async () => {
            row.components.forEach(btn => btn.setDisabled(true));
            await message.edit({ components: [row] });
        });
    }
};
