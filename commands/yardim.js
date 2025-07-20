const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const commandCategories = {
    oyunlar: {
        emoji: '🎮',
        title: 'Oyunlar',
        commands: [
            { name: 'blackjack', description: 'Klasik 21 oyununu oyna', usage: '/blackjack' },
            { name: 'taskagitmakas', description: 'Taş, kağıt, makas oyunu', usage: '/taskagitmakas' },
            { name: 'sayitahmin', description: '1-100 arası sayı tahmin etme oyunu', usage: '/sayitahmin' },
            { name: 'hafiza', description: 'Emoji eşleştirme hafıza oyunu', usage: '/hafiza' },
            { name: 'kelimekaristirma', description: 'Karışık harflerden kelimeyi bul', usage: '/kelimekaristirma' }
        ]
    },
    eglence: {
        emoji: '🎲',
        title: 'Eğlence',
        commands: [
            { name: 'zarat', description: '1-6 arası zar at', usage: '/zarat' },
            { name: 'sanslirenk', description: 'Günlük şanslı rengini öğren', usage: '/sanslirenk' }
        ]
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardim')
        .setDescription('Bot komutları hakkında bilgi al')
        .addStringOption(option =>
            option.setName('kategori')
                .setDescription('Hangi kategori hakkında bilgi almak istiyorsunuz?')
                .setRequired(false)
                .addChoices(
                    { name: '🎮 Oyunlar', value: 'oyunlar' },
                    { name: '🎲 Eğlence', value: 'eglence' },
                    { name: '📜 Tüm Komutlar', value: 'hepsi' }
                )),

    async execute(interaction) {
        const category = interaction.options.getString('kategori') || 'hepsi';
        
        if (category === 'hepsi') {
            // Ana yardım menüsü
            const embed = new EmbedBuilder()
                .setTitle('🤖 Bot Komutları')
                .setDescription('Aşağıdaki kategorilerden birini seçin:')
                .setColor('#0099ff')
                .addFields(
                    Object.entries(commandCategories).map(([key, cat]) => ({
                        name: `${cat.emoji} ${cat.title}`,
                        value: `\`/yardim kategori:${key}\` yazarak detaylı bilgi alın\n${cat.commands.length} komut bulunuyor`,
                        inline: true
                    }))
                )
                .setFooter({ text: 'İpucu: Komut hakkında detaylı bilgi için kategoriyi seçin' });

            const row = new ActionRowBuilder()
                .addComponents(
                    Object.entries(commandCategories).map(([key, cat]) =>
                        new ButtonBuilder()
                            .setCustomId(`help_${key}`)
                            .setLabel(cat.title)
                            .setEmoji(cat.emoji)
                            .setStyle(ButtonStyle.Primary)
                    )
                );

            const message = await interaction.reply({
                embeds: [embed],
                components: [row],
                fetchReply: true
            });

            // Buton kolektörü
            const filter = i => i.user.id === interaction.user.id && i.customId.startsWith('help_');
            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                const selectedCategory = i.customId.split('_')[1];
                await showCategoryHelp(i, selectedCategory);
            });

        } else {
            // Kategori detayları
            await showCategoryHelp(interaction, category);
        }

        async function showCategoryHelp(i, categoryKey) {
            const category = commandCategories[categoryKey];
            
            const embed = new EmbedBuilder()
                .setTitle(`${category.emoji} ${category.title} Komutları`)
                .setColor('#0099ff')
                .setDescription(`**${category.title}** kategorisindeki tüm komutlar:`)
                .addFields(
                    category.commands.map(cmd => ({
                        name: `/${cmd.name}`,
                        value: `📝 **Açıklama:** ${cmd.description}\n🔧 **Kullanım:** \`${cmd.usage}\``,
                        inline: false
                    }))
                )
                .setFooter({ text: `${category.commands.length} komut bulunuyor` });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('help_main')
                        .setLabel('Ana Menü')
                        .setEmoji('🏠')
                        .setStyle(ButtonStyle.Secondary)
                );

            if (i.message) {
                await i.update({ embeds: [embed], components: [row] });
            } else {
                await i.reply({ embeds: [embed], components: [row] });
            }

            // Ana menüye dönüş butonu için kolektör
            if (i.message) {
                const message = await i.message.fetch();
                const filter = response => response.user.id === i.user.id && response.customId === 'help_main';
                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async button => {
                    const mainEmbed = new EmbedBuilder()
                        .setTitle('🤖 Bot Komutları')
                        .setDescription('Aşağıdaki kategorilerden birini seçin:')
                        .setColor('#0099ff')
                        .addFields(
                            Object.entries(commandCategories).map(([key, cat]) => ({
                                name: `${cat.emoji} ${cat.title}`,
                                value: `\`/yardim kategori:${key}\` yazarak detaylı bilgi alın\n${cat.commands.length} komut bulunuyor`,
                                inline: true
                            }))
                        )
                        .setFooter({ text: 'İpucu: Komut hakkında detaylı bilgi için kategoriyi seçin' });

                    const mainRow = new ActionRowBuilder()
                        .addComponents(
                            Object.entries(commandCategories).map(([key, cat]) =>
                                new ButtonBuilder()
                                    .setCustomId(`help_${key}`)
                                    .setLabel(cat.title)
                                    .setEmoji(cat.emoji)
                                    .setStyle(ButtonStyle.Primary)
                            )
                        );

                    await button.update({
                        embeds: [mainEmbed],
                        components: [mainRow]
                    });
                });
            }
        }
    },
}; 