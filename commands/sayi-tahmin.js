const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sayitahmin')
        .setDescription('1-100 arasında sayı tahmin etme oyunu'),
    async execute(interaction) {
        const targetNumber = Math.floor(Math.random() * 100) + 1;
        let attempts = 0;
        const maxAttempts = 10;

        const createButtons = (min, max) => {
            const row = new ActionRowBuilder();
            const middle = Math.floor((min + max) / 2);
            
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`lower_${min}_${middle}`)
                    .setLabel(`${min}-${middle}`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`higher_${middle + 1}_${max}`)
                    .setLabel(`${middle + 1}-${max}`)
                    .setStyle(ButtonStyle.Primary)
            );
            
            return row;
        };

        await interaction.reply({
            content: `1-100 arasında bir sayı tuttum! ${maxAttempts} hakkın var. Hangi aralıkta olduğunu tahmin et:`,
            components: [createButtons(1, 100)]
        });

        const filter = i => i.user.id === interaction.user.id && i.customId.startsWith('lower_') || i.customId.startsWith('higher_');
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            attempts++;
            const [action, min, max] = i.customId.split('_').map(n => parseInt(n) || n);
            const range = max - min + 1;

            if (range <= 2) {
                if (min === targetNumber || max === targetNumber) {
                    await i.update({
                        content: `🎉 Tebrikler! Doğru tahmin: ${targetNumber}\nToplam deneme: ${attempts}`,
                        components: []
                    });
                    collector.stop();
                    return;
                }
            }

            if (attempts >= maxAttempts) {
                await i.update({
                    content: `Üzgünüm, ${maxAttempts} hakkın doldu! Doğru sayı ${targetNumber} idi.`,
                    components: []
                });
                collector.stop();
                return;
            }

            if (range <= 1) {
                await i.update({
                    content: `Yanlış tahmin! Doğru sayı ${targetNumber} idi.`,
                    components: []
                });
                collector.stop();
                return;
            }

            const newRow = createButtons(min, max);
            await i.update({
                content: `${maxAttempts - attempts} hakkın kaldı. ${min}-${max} arasındaki sayıyı tahmin et:`,
                components: [newRow]
            });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: 'Oyun süresi doldu!',
                    components: []
                });
            }
        });
    },
}; 