const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('analy')
        .setDescription('Avalia a solicitação de um usuário para YouTuber')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário que será avaliado')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('decisao')
                .setDescription('A decisão da análise')
                .setRequired(true)
                .addChoices(
                    { name: 'Aprovar', value: 'aprovar' },
                    { name: 'Análise', value: 'analise' },
                    { name: 'Reprovar', value: 'reprovar' }
                )),
                
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const decisao = interaction.options.getString('decisao');

        // Se o responsável escolher REPROVAR, abrimos o Modal V2
        if (decisao === 'reprovar') {
            // Criação do Modal V2
            const modal = new ModalBuilder()
                .setCustomId(`modal_reprovar_${targetUser.id}`)
                .setTitle('Motivo da Reprovação');

            // Criação do Input de Texto V2
            const motivoInput = new TextInputBuilder()
                .setCustomId('motivo_input')
                .setLabel('Qual o motivo da reprovação?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            // Adicionando o input à action row (Exigência do Discord)
            const actionRow = new ActionRowBuilder().addComponents(motivoInput);
            modal.addComponents(actionRow);

            // Mostra o Modal para o usuário que digitou o comando
            await interaction.showModal(modal);
            return; // Encerramos aqui, pois a continuação está no index.js (isModalSubmit)
        }

        // Se for APROVAR (Com Botão V2)
        if (decisao === 'aprovar') {
            // Criação do Botão de Link V2
            const linkButton = new ButtonBuilder()
                .setLabel('Entrar no Grupo')
                .setURL(config.link_grupo)
                .setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder().addComponents(linkButton);

            await interaction.reply({
                content: `${config.emojis.aprovado} Olá ${targetUser} sua solicitação para receber o cargo de YouTuber foi aprovada por ${interaction.user}, envie pedido ao grupo através do botão abaixo ou copie e cole o link: \`${config.link_grupo}\`.`,
                components: [row]
            });
            return;
        }

        // Se for ANÁLISE
        if (decisao === 'analise') {
            await interaction.reply({
                content: `${config.emojis.analise} Olá ${targetUser} sua solicitação para receber o cargo de YouTuber está em análise, aguarde as próximas orientações. (Enviado por: ${interaction.user})`
            });
            return;
        }
    },
};
