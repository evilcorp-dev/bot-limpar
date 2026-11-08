require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const http = require('http');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

const limpar = require('./commands/limpar');
client.commands.set(limpar.data.name, limpar);

client.once('ready', () => {
    console.log(`Bot online: ${client.user.tag}`);
    client.user.setActivity('Developer by Rnzzk', { type: ActivityType.Watching });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        const msg = { content: '❌ Erro ao executar comando.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(msg).catch(() => {});
        } else {
            await interaction.reply(msg).catch(() => {});
        }
    }
});

// HTTP server para Render não derrubar
http.createServer((_, res) => res.end('ok')).listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);
