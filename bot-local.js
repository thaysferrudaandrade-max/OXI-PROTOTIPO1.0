// bot-local.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { orquestrarMensagem } = require('./src/botEngine');

console.log('🔄 Inicializando Oxi Protótipo 1.0...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-sessao'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Exibe o QR Code no terminal do VS Code
client.on('qr', (qr) => {
    console.log('\n📲 ESCANEIE O QR CODE ABAIXO COM O SEU WHATSAPP:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n(No WhatsApp: Menu de 3 pontos > Dispositivos conectados > Conectar um dispositivo)');
});

// Confirmação quando o WhatsApp for conectado
client.on('ready', () => {
    console.log('\n✅ BOT OXI DE IBIPORÃ (v1.0) CONECTADO COM SUCESSO!');
    console.log('🤖 O bot já está pronto para receber e responder mensagens no WhatsApp.\n');
});

// Recebimento e resposta das mensagens
client.on('message', async (msg) => {
    if (msg.from.endsWith('@g.us')) return;

    const remetente = msg.from;
    let tipoEntrada = 'texto';
    let conteudo = msg.body;

    if (msg.hasMedia && (msg.type === 'audio' || msg.type === 'ptt')) {
        tipoEntrada = 'audio';
        conteudo = 'Mensagem de áudio recebida do cidadão';
    }

    try {
        console.log(`📩 Mensagem de [${remetente.replace('@c.us', '')}]: ${conteudo}`);

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