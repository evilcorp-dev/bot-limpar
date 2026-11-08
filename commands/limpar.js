const { SlashCommandBuilder } = require('discord.js');

const CARGO_ID = '1568407635001081957';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limpar')
        .setDescription('Limpa mensagens do canal')
        .addIntegerOption(opt =>
            opt.setName('quantidade')
                .setDescription('Quantas mensagens apagar (máx 1000)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000)
        ),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(CARGO_ID)) {
            return interaction.reply({ content: '❌ Você não tem permissão.', ephemeral: true });
        }

        const quantidade = interaction.options.getInteger('quantidade');
        await interaction.deferReply({ ephemeral: true });

        let deletadas = 0;
        let restante = quantidade;

        try {
            while (restante > 0) {
                const lote = Math.min(restante, 100);
                const msgs = await interaction.channel.messages.fetch({ limit: lote });
                if (msgs.size === 0) break;

                const recentes = msgs.filter(m => Date.now() - m.createdTimestamp < 12_096_000_000);
                const antigas = msgs.filter(m => Date.now() - m.createdTimestamp >= 12_096_000_000);

                if (recentes.size > 0) {
                    const apagadas = await interaction.channel.bulkDelete(recentes, true);
                    deletadas += apagadas.size;
                }

                for (const msg of antigas.values()) {
                    await msg.delete().catch(() => {});
                    deletadas++;
                    await new Promise(r => setTimeout(r, 300));
                }

                restante -= msgs.size;
                if (msgs.size < lote) break;
                await new Promise(r => setTimeout(r, 1000));
            }

            await interaction.editReply({ content: `✅ **${deletadas}** mensagem(ns) apagada(s).` });
        } catch (err) {
            console.error('[ERRO] /limpar:', err);
            await interaction.editReply({ content: '❌ Erro ao apagar. O bot tem permissão de **Gerenciar Mensagens**?' });
        }
    },
};
