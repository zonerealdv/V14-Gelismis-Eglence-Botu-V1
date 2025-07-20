const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sanslirenk')
        .setDescription('Bugünkü şanslı rengini öğren'),
    async execute(interaction) {
        const colors = [
            { name: 'Kırmızı', hex: '#FF0000', description: 'Tutku ve enerji' },
            { name: 'Mavi', hex: '#0000FF', description: 'Huzur ve güven' },
            { name: 'Yeşil', hex: '#00FF00', description: 'Doğa ve denge' },
            { name: 'Mor', hex: '#800080', description: 'Asalet ve yaratıcılık' },
            { name: 'Sarı', hex: '#FFFF00', description: 'Neşe ve pozitiflik' },
            { name: 'Turuncu', hex: '#FFA500', description: 'Macera ve sosyallik' },
            { name: 'Pembe', hex: '#FFC0CB', description: 'Sevgi ve şefkat' },
            { name: 'Turkuaz', hex: '#40E0D0', description: 'Sakinlik ve dinginlik' }
        ];

        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const embed = new EmbedBuilder()
            .setTitle('🎨 Bugünkü Şanslı Rengin')
            .setDescription(`**${randomColor.name}**\n${randomColor.description}`)
            .setColor(randomColor.hex)
            .setFooter({ text: 'Her gün farklı bir renk dene!' });

        await interaction.reply({ embeds: [embed] });
    },
}; 