// bot-local.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { orquestrarMensagem } = require('./src/botEngine');

console.log('🔄 Inicializando Oxi Protótipo 1.0 - Secretaria Escolar...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-sessao'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n📲 ESCANEIE O QR CODE ABAIXO COM O SEU WHATSAPP:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n(No WhatsApp: Menu > Dispositivos conectados > Conectar um dispositivo)');
});

client.on('ready', () => {
    console.log('\n✅ BOT ESCOLAR CONECTADO COM SUCESSO!');
    console.log('🤖 O bot responderá apenas a interações diretas e mensagens válidas.\n');
});

// Palavras autorizadas para INICIAR a conversa com o bot
const PALAVRAS_INICIO = ['oi', 'ola', 'olá', 'menu', 'secretaria', 'bom dia', 'boa tarde', 'boa noite', 'ajuda', 'bot', 'iniciar', '1', '2', '3'];

// Conjunto para controlar quais números já estão com o atendimento iniciado
const conversasAtivas = new Set();

client.on('message', async (msg) => {
    // 1. Ignora mensagens de grupos (@g.us), do próprio bot e transmissões de status
    if (msg.from.endsWith('@g.us') || msg.from === 'status@broadcast' || msg.fromMe) return;

    const remetente = msg.from;
    const conteudoTexto = (msg.body || '').trim().toLowerCase();

    // 2. Proteção: Se a conversa AINDA NÃO começou, verifica se enviou uma palavra de início
    if (!conversasAtivas.has(remetente)) {
        const ehComandoInicio = PALAVRAS_INICIO.some(palavra => conteudoTexto.includes(palavra));
        
        if (!ehComandoInicio) {
            // Ignora mensagens aleatórias para evitar disparos indesejados
            return;
        }

        conversasAtivas.add(remetente);
    }

    let tipoEntrada = 'texto';
    let conteudo = msg.body;

    if (msg.hasMedia && (msg.type === 'audio' || msg.type === 'ptt')) {
        tipoEntrada = 'audio';
        conteudo = 'Mensagem de áudio recebida do aluno/responsável';
    }

    try {
        console.log(`📩 Atendimento ativo com [${remetente.replace('@c.us', '')}]: ${conteudo}`);

        const resposta = await orquestrarMensagem(remetente, tipoEntrada, conteudo);

        await client.sendMessage(remetente, resposta.texto);

        if (resposta.audio) {
            await client.sendMessage(remetente, `🔊 [Acessibilidade - Áudio]: ${resposta.audio.transcricaoAudio}`);
        }

    } catch (erro) {
        console.error('❌ Erro ao processar mensagem:', erro);
    }
});

client.initialize();