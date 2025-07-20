const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const emojis = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎫', '🎰'];

function shuffleArray(array) {
    const newArray = [...array, ...array]; // Her emojiden 2 tane
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function createBoard() {
    const shuffledEmojis = shuffleArray(emojis);
    const board = [];
    for (let i = 0; i < 4; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 4; j++) {
            const index = i * 4 + j;
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`card_${index}`)
                    .setLabel('❓')
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        board.push(row);
    }
    return { board, emojis: shuffledEmojis };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hafiza')
        .setDescription('Emoji eşleştirme hafıza oyunu'),
    async execute(interaction) {
        const { board, emojis: gameEmojis } = createBoard();
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;

        const embed = new EmbedBuilder()
            .setTitle('🎯 Hafıza Oyunu')
            .setDescription('Eşleşen emoji çiftlerini bul!\nHamle sayısı: 0')
            .setColor('#00ff00');

        const message = await interaction.reply({
            embeds: [embed],
            components: board,
            fetchReply: true
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 300000 }); // 5 dakika

        collector.on('collect', async i => {
            const [_, cardIndex] = i.customId.split('_');
            const index = parseInt(cardIndex);

            if (flippedCards.includes(index)) {
                await i.reply({ content: 'Bu kart zaten açık!', ephemeral: true });
                return;
            }

            moves++;
            const emoji = gameEmojis[index];
            
            // Kartı çevir
            await i.update({
                embeds: [embed.setDescription(`Eşleşen emoji çiftlerini bul!\nHamle sayısı: ${moves}`)],
                components: board.map((row, rowIndex) => {
                    const newRow = new ActionRowBuilder();
                    row.components.forEach((button, buttonIndex) => {
                        const buttonIndex2D = rowIndex * 4 + buttonIndex;
                        const newButton = ButtonBuilder.from(button);
                        if (buttonIndex2D === index || flippedCards.includes(buttonIndex2D)) {
                            newButton.setLabel(gameEmojis[buttonIndex2D]);
                        }
                        newRow.addComponents(newButton);
                    });
                    return newRow;
                })
            });

            flippedCards.push(index);

            if (flippedCards.length === 2) {
                const [firstCard, secondCard] = flippedCards;
                if (gameEmojis[firstCard] === gameEmojis[secondCard]) {
                    matchedPairs++;
                    if (matchedPairs === emojis.length) {
                        collector.stop('win');
                        return;
                    }
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    // Kartları geri çevir
                    await interaction.editReply({
                        embeds: [embed.setDescription(`Eşleşen emoji çiftlerini bul!\nHamle sayısı: ${moves}`)],
                        components: board.map((row, rowIndex) => {
                            const newRow = new ActionRowBuilder();
                            row.components.forEach((button, buttonIndex) => {
                                const buttonIndex2D = rowIndex * 4 + buttonIndex;
                                const newButton = ButtonBuilder.from(button);
                                if (!flippedCards.includes(buttonIndex2D)) {
                                    newButton.setLabel('❓');
                                }
                                newRow.addComponents(newButton);
                            });
                            return newRow;
                        })
                    });
                }
                flippedCards = [];
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'win') {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🎉 Tebrikler!')
                            .setDescription(`Tüm eşleşmeleri ${moves} hamlede buldunuz!`)
                            .setColor('#00ff00')
                    ],
                    components: []
                });
            } else if (reason === 'time') {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('⏰ Süre Doldu!')
                            .setDescription(`Oyun süresi doldu! ${matchedPairs} çift buldunuz.`)
                            .setColor('#ff0000')
                    ],
                    components: []
                });
            }
        });
    },
}; 