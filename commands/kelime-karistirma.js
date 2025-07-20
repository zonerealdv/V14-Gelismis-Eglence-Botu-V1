const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const words = [
    { word: 'DISCORD', hint: 'Bu uygulamayı kullanıyorsun' },
    { word: 'BILGISAYAR', hint: 'Elektronik cihaz' },
    { word: 'INTERNET', hint: 'Dünyayı birbirine bağlar' },
    { word: 'PROGRAMLAMA', hint: 'Kod yazma sanatı' },
    { word: 'MINECRAFT', hint: 'Küplerden oluşan oyun' },
    { word: 'TELEFON', hint: 'İletişim aracı' },
    { word: 'TEKNOLOJI', hint: 'Bilimin uygulaması' },
    { word: 'OYUN', hint: 'Eğlence aracı' }
];

function shuffleWord(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}

function createButtonRow(letters) {
    const row = new ActionRowBuilder();
    letters.forEach((letter, index) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`letter_${index}`)
                .setLabel(letter)
                .setStyle(ButtonStyle.Secondary)
        );
    });
    return row;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kelimekaristirma')
        .setDescription('Karışık harflerden kelimeyi bul'),
    async execute(interaction) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const scrambledWord = shuffleWord(randomWord.word);
        
        const embed = new EmbedBuilder()
            .setTitle('🔤 Kelime Karıştırma Oyunu')
            .setDescription(`**Karışık Kelime:** ${scrambledWord}\n**İpucu:** ${randomWord.hint}`)
            .setColor('#00ff00')
            .addFields(
                { name: 'Nasıl Oynanır?', value: 'Aşağıdaki butonları kullanarak kelimeyi tahmin et!' }
            );

        const guessButton = new ButtonBuilder()
            .setCustomId('guess')
            .setLabel('Tahmin Et')
            .setStyle(ButtonStyle.Primary);

        const giveUpButton = new ButtonBuilder()
            .setCustomId('giveup')
            .setLabel('Pes Et')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(guessButton, giveUpButton);

        const response = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = response.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'giveup') {
                collector.stop('giveup');
                return;
            }

            if (i.customId === 'guess') {
                await i.reply({
                    content: 'Tahmininizi yazın (30 saniye süreniz var):',
                    ephemeral: true
                });

                try {
                    const guess = await i.channel.awaitMessages({
                        filter: m => m.author.id === interaction.user.id,
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    });

                    const userGuess = guess.first().content.toUpperCase();
                    if (userGuess === randomWord.word) {
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('🎉 Tebrikler!')
                                    .setDescription(`Doğru tahmin! Kelime: ${randomWord.word}`)
                                    .setColor('#00ff00')
                            ],
                            components: []
                        });
                        collector.stop('win');
                    } else {
                        await i.followUp({
                            content: 'Yanlış tahmin! Tekrar dene.',
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    await i.followUp({
                        content: 'Süre doldu!',
                        ephemeral: true
                    });
                }
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'giveup') {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Oyun Bitti')
                            .setDescription(`Pes ettiniz! Doğru kelime: ${randomWord.word}`)
                            .setColor('#ff0000')
                    ],
                    components: []
                });
            } else if (reason === 'time') {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('⏰ Süre Doldu!')
                            .setDescription(`Süreniz bitti! Doğru kelime: ${randomWord.word}`)
                            .setColor('#ff0000')
                    ],
                    components: []
                });
            }
        });
    },
}; 