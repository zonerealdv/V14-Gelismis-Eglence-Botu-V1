const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('taskagitmakas')
        .setDescription('Bot ile taş kağıt makas oyna'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tas')
                    .setLabel('Taş')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('kagit')
                    .setLabel('Kağıt')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('makas')
                    .setLabel('Makas')
                    .setStyle(ButtonStyle.Primary),
            );

        const response = await interaction.reply({
            content: 'Taş, kağıt, makas! Seçimini yap:',
            components: [row],
        });

        const choices = ['tas', 'kagit', 'makas'];
        const filter = i => i.user.id === interaction.user.id && choices.includes(i.customId);

        try {
            const buttonInteraction = await response.awaitMessageComponent({ filter, time: 15000 });
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            
            let result;
            if (buttonInteraction.customId === botChoice) {
                result = 'Berabere!';
            } else if (
                (buttonInteraction.customId === 'tas' && botChoice === 'makas') ||
                (buttonInteraction.customId === 'kagit' && botChoice === 'tas') ||
                (buttonInteraction.customId === 'makas' && botChoice === 'kagit')
            ) {
                result = 'Sen kazandın!';
            } else {
                result = 'Ben kazandım!';
            }

            const userChoice = buttonInteraction.customId === 'tas' ? 'Taş' : 
                             buttonInteraction.customId === 'kagit' ? 'Kağıt' : 'Makas';
            const botChoiceText = botChoice === 'tas' ? 'Taş' : 
                                botChoice === 'kagit' ? 'Kağıt' : 'Makas';

            await buttonInteraction.update({
                content: `Senin seçimin: ${userChoice}\nBenim seçimim: ${botChoiceText}\n\n${result}`,
                components: [],
            });
        } catch (error) {
            await interaction.editReply({
                content: 'Oyun süresi doldu veya bir hata oluştu!',
                components: [],
            });
        }
    },
}; 