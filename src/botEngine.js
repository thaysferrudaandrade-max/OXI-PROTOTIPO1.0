// src/botEngine.js
const sessoesUsuarios = {};

async function orquestrarMensagem(usuarioId, tipoEntrada, conteudo) {
    const textoEntrada = conteudo.trim().toLowerCase();

    // 1. Inicialização da sessão
    if (!sessoesUsuarios[usuarioId]) {
        sessoesUsuarios[usuarioId] = {
            etapa: 'SELECAO_ACESSIBILIDADE',
            preferenciaAudio: false,
            dadosConsulta: {}
        };

        return {
            texto: "👋 Olá! Bem-vindo à **Secretaria Virtual do Colégio**.\n\nComo você prefere interagir com o bot?\n\n[1] Texto e Áudio\n[2] Apenas Texto"
        };
    }

    const sessao = sessoesUsuarios[usuarioId];
    let respostaTexto = "";

    // 2. Configuração da Acessibilidade
    if (sessao.etapa === 'SELECAO_ACESSIBILIDADE') {
        if (textoEntrada.includes('1') || textoEntrada.includes('audio')) {
            sessao.preferenciaAudio = true;
        } else {
            sessao.preferenciaAudio = false;
        }
        
        sessao.etapa = 'MENU_PRINCIPAL';
        respostaTexto = "✅ Preferência registrada!\n\nComo a **Secretaria** pode te ajudar hoje?\n\n[1] 📊 Consultar Notas e Boletim\n[2] 👤 Consultar Dados do Aluno (Turma / Série)\n[3] 🏫 Atendimento e Documentos da Secretaria";
        
        return montarResposta(sessao, respostaTexto);
    }

    // 3. Menu Principal
    if (sessao.etapa === 'MENU_PRINCIPAL') {
        if (textoEntrada.includes('1') || textoEntrada.includes('nota') || textoEntrada.includes('boletim')) {
            sessao.etapa = 'NOTAS_MATRICULA';
            respostaTexto = "📊 **[Consulta de Notas]**\nPor favor, digite o **Número da Matrícula** do aluno:";
        } else if (textoEntrada.includes('2') || textoEntrada.includes('aluno') || textoEntrada.includes('dados')) {
            sessao.etapa = 'ALUNO_NOME';
            respostaTexto = "👤 **[Dados do Aluno]**\nPor favor, digite o **Nome Completo** do aluno:";
        } else if (textoEntrada.includes('3') || textoEntrada.includes('secretaria') || textoEntrada.includes('documento')) {
            respostaTexto = "🏫 **[Secretaria Escolar]**\n\n📌 **Horário de Atendimento:** Segunda a Sexta, das 07h30 às 17h00.\n📌 **Serviços:** Declaração de Matrícula, Histórico Escolar e Rematrículas.\n\nEscreva sua dúvida ou solicitação que a equipe responderá em breve!";
        } else {
            respostaTexto = "🤖 Opção não reconhecida.\nResponda com:\n[1] Consultar Notas\n[2] Dados do Aluno\n[3] Secretaria";
        }

        return montarResposta(sessao, respostaTexto);
    }

    // 4. Fluxo de Consulta de Notas
    if (sessao.etapa === 'NOTAS_MATRICULA') {
        sessao.dadosConsulta.matricula = conteudo;
        sessao.etapa = 'MENU_PRINCIPAL';

        respostaTexto = `📊 **[Boletim Escolar - Matrícula ${conteudo}]**\n\n` +
                        `• Português: 8.5 (Aprovado)\n` +
                        `• Matemática: 9.0 (Aprovado)\n` +
                        `• História: 7.5 (Aprovado)\n` +
                        `• Ciências: 8.0 (Aprovado)\n\n` +
                        `Digite **1**, **2** ou **3** para voltar ao menu principal.`;

        return montarResposta(sessao, respostaTexto);
    }

    // 5. Fluxo de Dados do Aluno (Nome -> Série -> Turma)
    if (sessao.etapa === 'ALUNO_NOME') {
        sessao.dadosConsulta.nome = conteudo;
        sessao.etapa = 'ALUNO_SERIE';
        respostaTexto = `Entendido! Qual é a **Série / Ano** do(a) aluno(a) ${conteudo}? (Exemplo: 8º Ano, 1º Ano Ensino Médio):`;
        
        return montarResposta(sessao, respostaTexto);
    }

    if (sessao.etapa === 'ALUNO_SERIE') {
        sessao.dadosConsulta.serie = conteudo;
        sessao.etapa = 'ALUNO_TURMA';
        respostaTexto = `E qual é a **Turma**? (Exemplo: Turma A, Turma B, Matutino):`;

        return montarResposta(sessao, respostaTexto);
    }

    if (sessao.etapa === 'ALUNO_TURMA') {
        sessao.dadosConsulta.turma = conteudo;
        sessao.etapa = 'MENU_PRINCIPAL';

        respostaTexto = `📋 **[Ficha do Aluno - Secretaria]**\n\n` +
                        `👤 **Nome:** ${sessao.dadosConsulta.nome}\n` +
                        `📚 **Série/Ano:** ${sessao.dadosConsulta.serie}\n` +
                        `🏫 **Turma:** ${sessao.dadosConsulta.turma}\n` +
                        `✅ **Status da Matrícula:** Ativo / Regular\n` +
                        `📅 **Frequência Geral:** 94%\n\n` +
                        `Digite **1**, **2** ou **3** para fazer outra consulta.`;

        return montarResposta(sessao, respostaTexto);
    }

    sessao.etapa = 'MENU_PRINCIPAL';
    return montarResposta(sessao, "Digite **1**, **2** ou **3** para ver as opções da Secretaria.");
}

function montarResposta(sessao, texto) {
    return {
        texto: texto,
        audio: sessao.preferenciaAudio ? { transcricaoAudio: texto } : null
    };
}

module.exports = { orquestrarMensagem };