const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zarat')
        .setDescription('1-6 arasında rastgele bir sayı atar'),
    async execute(interaction) {
        const result = Math.floor(Math.random() * 6) + 1;
        await interaction.reply(`🎲 Zar atıldı: **${result}** geldi!`);
    },
}; 