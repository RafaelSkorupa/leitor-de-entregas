document.addEventListener('DOMContentLoaded', () => {
    let dadosEntregas = [];
    let csvCarregado = false;

    // Função para iniciar o scanner, será chamada quando TUDO estiver pronto
    function iniciarScannerSePronto() {
        // Só continua se o CSV foi carregado e a biblioteca Html5Qrcode existe
        if (csvCarregado && typeof Html5Qrcode !== 'undefined') {
            console.log("Tudo pronto! Iniciando o scanner...");
            const html5QrCode = new Html5Qrcode("reader");
            const resultadoDiv = document.getElementById('result');

            const qrCodeSuccessCallback = (decodedText, decodedResult) => {
                console.log(`Código lido: ${decodedText}`);
                const entrega = dadosEntregas.find(dado => dado.Codigo === decodedText);

                if (entrega) {
                    new Audio('https://cdn.freesound.org/previews/219/219018_4104529-lq.mp3').play();
                    resultadoDiv.innerHTML = `
                        <p class="ordem">Entrega N° ${entrega.Ordem}</p>
                        <p class="motorista">Motorista: ${entrega.Motorista}</p>
                    `;
                } else {
                    new Audio('https://cdn.freesound.org/previews/159/159378_2435388-lq.mp3').play();
                    resultadoDiv.innerHTML = `
                        <p class="erro">Código não encontrado na planilha!</p>
                    `;
                }
            };

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
                .catch(err => {
                    console.error("Não foi possível iniciar o scanner", err);
                    resultadoDiv.innerHTML = `<p class="erro">Erro ao acessar a câmera. Verifique as permissões.</p>`;
                });
        } else {
            console.log("Aguardando... CSV carregado:", csvCarregado, "Biblioteca pronta:", typeof Html5Qrcode);
        }
    }

    // 1. Carrega e processa o arquivo CSV
    fetch('dados.csv')
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    dadosEntregas = results.data;
                    csvCarregado = true; // Marca que o CSV foi carregado
                    console.log("Dados CSV carregados:", dadosEntregas);
                    iniciarScannerSePronto(); // Tenta iniciar o scanner
                }
            });
        });

    // 2. Verifica periodicamente se a biblioteca do QR Code já carregou
    const intervalorVerificacao = setInterval(() => {
        if (typeof Html5Qrcode !== 'undefined') {
            clearInterval(intervalorVerificacao); // Para de verificar
            iniciarScannerSePronto(); // Tenta iniciar o scanner
        }
    }, 100); // Verifica a cada 100 milissegundos
});
