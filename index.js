const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const config = require('./config.json');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Carregar o comando
client.commands = new Collection();
const analyCommand = require('./commands/analy.js');
client.commands.set(analyCommand.data.name, analyCommand);

client.once('ready', async () => {
    console.log(`Logado como ${client.user.tag}`);
    
    // Registrar o Slash Command no Discord quando ligar
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [analyCommand.data.toJSON()] }
        );
        console.log('Comandos carregados com sucesso!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    // Tratamento de Slash Commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
        }
    }

    // Tratamento do envio do Modal (Quando ele preenche o motivo da reprovação)
    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal_reprovar_')) {
            const userId = interaction.customId.split('_')[2];
            const motivo = interaction.fields.getTextInputValue('motivo_input');
            
            // Resposta final do bot na sala
            await interaction.reply({
                content: `${config.emojis.reprovado} Olá <@${userId}> sua solicitação para receber o cargo de YouTuber foi recusada! Motivo: **${motivo}** | Responsável por reprovar: ${interaction.user}`
            });
        }
    }
});

// Coloque o token no arquivo .env como TOKEN=seu_token_aqui ou substitua o process.env.TOKEN abaixo
client.login(process.env.TOKEN);
