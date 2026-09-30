// src/botEngine.js
const sessoesUsuarios = {};

async function orquestrarMensagem(usuarioId, tipoEntrada, conteudo) {
    // 1. Inicialização da sessão do usuário
    if (!sessoesUsuarios[usuarioId]) {
        sessoesUsuarios[usuarioId] = {
            etapa: 'SELECAO_ACESSIBILIDADE',
            preferenciaAudio: false
        };

        return {
            texto: "👋 Olá! Bem-vindo ao atendimento acessível do **Sistema Oxi - Prefeitura de Ibiporã (v1.0)**.\n\nComo você prefere interagir com o bot?\n\n[1] Texto e Áudio\n[2] Apenas Texto"
        };
    }

    const sessao = sessoesUsuarios[usuarioId];
    let respostaTexto = "";

    // 2. Configuração da Preferência de Acessibilidade
    if (sessao.etapa === 'SELECAO_ACESSIBILIDADE') {
        if (conteudo.includes('1') || conteudo.toLowerCase().includes('audio')) {
            sessao.preferenciaAudio = true;
            respostaTexto = "✅ Preferência configurada para **TEXTO E ÁUDIO**!\n\nSelecione um serviço de Ibiporã:\n[1] 📄 Segunda Via IPTU\n[2] 🔍 Consultar Protocolo\n[3] 🗣️ Ouvidoria";
        } else {
            sessao.preferenciaAudio = false;
            respostaTexto = "✅ Preferência configurada para **APENAS TEXTO**!\n\nSelecione um serviço de Ibiporã:\n[1] 📄 Segunda Via IPTU\n[2] 🔍 Consultar Protocolo\n[3] 🗣️ Ouvidoria";
        }
        sessao.etapa = 'MENU_PRINCIPAL';

        return { texto: respostaTexto };
    }

    // 3. Processamento do Menu de Serviços da Oxi
    const input = conteudo.toLowerCase();
    if (input.includes('1') || input.includes('iptu')) {
        respostaTexto = "📄 [Sistema Oxi - IPTU]: Para consultar a 2ª via do IPTU, envie o CPF do titular do imóvel.";
    } else if (input.includes('2') || input.includes('protocolo')) {
        respostaTexto = "🔍 [Sistema Oxi - Protocolo]: Digite o número do protocolo desejado (Exemplo: 1234/2026).";
    } else if (input.includes('3') || input.includes('ouvidoria')) {
        respostaTexto = "🗣️ [Sistema Oxi - Ouvidoria]: Digite a sua solicitação ou reclamação para encaminharmos à prefeitura.";
    } else {
        respostaTexto = "🤖 Opção não reconhecida. Responda com 1 para IPTU, 2 para Protocolo ou 3 para Ouvidoria.";
    }

    return {
        texto: respostaTexto,
        audio: sessao.preferenciaAudio ? { transcricaoAudio: respostaTexto } : null
    };
}

module.exports = { orquestrarMensagem };