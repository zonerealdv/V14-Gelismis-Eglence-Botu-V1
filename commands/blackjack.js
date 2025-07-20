const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    toString() {
        const suitEmojis = {
            '♠️': '♠️',
            '♣️': '♣️',
            '♥️': '♥️',
            '♦️': '♦️'
        };
        return `${this.value}${suitEmojis[this.suit]}`;
    }

    getValue() {
        if (['J', 'Q', 'K'].includes(this.value)) return 10;
        if (this.value === 'A') return 11;
        return parseInt(this.value);
    }
}

class Deck {
    constructor() {
        this.cards = [];
        const suits = ['♠️', '♣️', '♥️', '♦️'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        for (let suit of suits) {
            for (let value of values) {
                this.cards.push(new Card(suit, value));
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        return this.cards.pop();
    }
}

class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    getScore() {
        let score = 0;
        let aces = 0;

        for (let card of this.cards) {
            if (card.value === 'A') {
                aces++;
            } else {
                score += card.getValue();
            }
        }

        for (let i = 0; i < aces; i++) {
            if (score + 11 <= 21) {
                score += 11;
            } else {
                score += 1;
            }
        }

        return score;
    }

    toString() {
        return this.cards.map(card => card.toString()).join(' ');
    }
}

async function startNewGame(interaction) {
    const deck = new Deck();
    const playerHand = new Hand();
    const dealerHand = new Hand();

    // İlk kartları dağıt
    playerHand.addCard(deck.draw());
    dealerHand.addCard(deck.draw());
    playerHand.addCard(deck.draw());
    dealerHand.addCard(deck.draw());

    return { deck, playerHand, dealerHand };
}

function createGameEmbed(playerHand, dealerHand, showDealerCards = false, message = '') {
    const embed = new EmbedBuilder()
        .setTitle('🎰 Black Jack')
        .setColor('#00ff00')
        .addFields(
            { 
                name: '🎭 Krupiye', 
                value: showDealerCards ? 
                    `${dealerHand.toString()}\nToplam: ${dealerHand.getScore()}` : 
                    `${dealerHand.cards[0].toString()}\nToplam: ${dealerHand.cards[0].getValue()}`
            },
            { 
                name: '👤 Senin Elin', 
                value: `${playerHand.toString()}\nToplam: ${playerHand.getScore()}`
            }
        );
    
    if (message) {
        embed.setDescription(message);
    }
    
    return embed;
}

function createGameButtons(showPlayAgain = false) {
    if (showPlayAgain) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('play_again')
                    .setLabel('Tekrar Oyna')
                    .setEmoji('🔄')
                    .setStyle(ButtonStyle.Success)
            );
    }

    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('hit')
                .setLabel('Kart Çek')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('stand')
                .setLabel('Kal')
                .setStyle(ButtonStyle.Secondary)
        );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Black Jack oyunu oyna'),
    async execute(interaction) {
        const deck = new Deck();
        const playerHand = new Hand();
        const dealerHand = new Hand();

        // İlk kartları dağıt
        playerHand.addCard(deck.draw());
        dealerHand.addCard(deck.draw());
        playerHand.addCard(deck.draw());
        dealerHand.addCard(deck.draw());

        const message = await interaction.reply({
            embeds: [createGameEmbed(playerHand, dealerHand)],
            components: [createGameButtons()],
            fetchReply: true
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'hit') {
                playerHand.addCard(deck.draw());
                const playerScore = playerHand.getScore();

                if (playerScore > 21) {
                    await i.update({
                        embeds: [createGameEmbed(playerHand, dealerHand, true, '**❌ 21\'i geçtin! Kaybettin!**')],
                        components: []
                    });
                    collector.stop();
                    return;
                }

                await i.update({
                    embeds: [createGameEmbed(playerHand, dealerHand)],
                    components: [createGameButtons()]
                });
            }

            if (i.customId === 'stand') {
                // İlk güncellemeyi yap
                await i.update({
                    embeds: [createGameEmbed(playerHand, dealerHand, true, '**🎲 Krupiye kart çekiyor...**')],
                    components: []
                });

                // Krupiyenin kartlarını teker teker çekmesi
                while (dealerHand.getScore() < 17) {
                    dealerHand.addCard(deck.draw());
                    const dealerMessage = `**🎲 Krupiye kart çekiyor... (${dealerHand.getScore()})**`;
                    
                    await interaction.editReply({
                        embeds: [createGameEmbed(playerHand, dealerHand, true, dealerMessage)],
                        components: []
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }

                const playerScore = playerHand.getScore();
                const dealerScore = dealerHand.getScore();

                let resultMessage;
                let color;

                if (dealerScore > 21) {
                    resultMessage = '**🎉 Krupiye battı! Sen kazandın!**';
                    color = '#00ff00';
                } else if (playerScore > dealerScore) {
                    resultMessage = '**🎉 Tebrikler! Kazandın!**';
                    color = '#00ff00';
                } else if (playerScore < dealerScore) {
                    resultMessage = '**❌ Maalesef kaybettin!**';
                    color = '#ff0000';
                } else {
                    resultMessage = '**🤝 Berabere bitti!**';
                    color = '#ffff00';
                }

                const finalEmbed = createGameEmbed(playerHand, dealerHand, true, resultMessage)
                    .setColor(color);

                await interaction.editReply({
                    embeds: [finalEmbed],
                    components: []
                });
                collector.stop();
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.editReply({
                    embeds: [
                        createGameEmbed(playerHand, dealerHand, true)
                            .setDescription('**⏰ Süre doldu!**')
                            .setColor('#ff0000')
                    ],
                    components: []
                });
            }
        });
    },
}; 