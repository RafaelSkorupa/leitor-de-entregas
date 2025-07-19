document.addEventListener('DOMContentLoaded', () => {
    let dadosEntregas = [];

    // Carrega e processa o arquivo CSV
    fetch('dados.csv')
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    dadosEntregas = results.data;
                    console.log("Dados CSV carregados:", dadosEntregas);
                    iniciarScanner();
                }
            });
        });

    function iniciarScanner() {
        const html5QrCode = new Html5Qrcode("reader");
        const resultadoDiv = document.getElementById('result');

        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            console.log(`Código lido: ${decodedText}`);
            
            // Procura o código de barras nos dados carregados
            const entrega = dadosEntregas.find(dado => dado.Codigo === decodedText);

            if (entrega) {
                // Toca um som de sucesso (beep)
                new Audio('https://cdn.freesound.org/previews/219/219018_4104529-lq.mp3').play();

                // Exibe o resultado na tela
                resultadoDiv.innerHTML = `
                    <p class="ordem">Entrega N° ${entrega.Ordem}</p>
                    <p class="motorista">Motorista: ${entrega.Motorista}</p>
                `;
            } else {
                // Toca um som de erro
                new Audio('https://cdn.freesound.org/previews/159/159378_2435388-lq.mp3').play();

                // Exibe mensagem de erro
                resultadoDiv.innerHTML = `
                    <p class="erro">Código não encontrado na planilha!</p>
                `;
            }
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        // Inicia o scanner usando a câmera traseira
        html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
            .catch(err => {
                console.error("Não foi possível iniciar o scanner", err);
                resultadoDiv.innerHTML = `<p class="erro">Erro ao acessar a câmera. Verifique as permissões.</p>`;
            });
    }
});