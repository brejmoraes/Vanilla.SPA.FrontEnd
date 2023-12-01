var ownerOptions = '<option value="">-- Selecione --</option>';

// Função chamada quando a página é carregada
function myHome() {
    // Muda o título da página
    changeTitle('Novo Documento');
    // Obtém opções para um dropdown
    getOwnersToSelect();
    // Verifica e define a aba aberta com base no sessionStorage
    if (sessionStorage.openTab == undefined)
        sessionStorage.openTab = 'item'
    showTab(sessionStorage.openTab);
    // Adiciona manipuladores de evento para os botões de nova aba
    $('#btnNewOwner').click(() => { showTab('owner') });
    $('#btnNewItem').click(() => { showTab('item'); });
    // Adiciona manipulador de evento para envio de formulário
    $('.tabs form').submit(sendData);
}

// Função chamada ao enviar um formulário
function sendData(ev) {
    // Impede o comportamento padrão de envio de formulário
    ev.preventDefault();

    // Inicializa um objeto para armazenar dados do formulário
    var formJSON = {};
    const formData = new FormData(ev.target);
    formData.forEach((value, key) => {
        // Remove tags HTML e atribui valores ao objeto formJSON
        formJSON[key] = stripTags(value);
        $('#' + key).val(formJSON[key]);
    });

    // Verifica se algum campo no formJSON está vazio e retorna false se verdadeiro
    for (const key in formJSON)
        if (formJSON[key] == '')
            return false;

    // Chama a função para salvar os dados do formulário
    saveData(formJSON);
    return false;
}

// Função para salvar os dados do formulário usando AJAX
function saveData(formJSON) {
    // Constrói a URL de requisição com base no tipo de formulário
    requestURL = `${app.apiBaseURL}/${formJSON.type}s`;
    // Remove a propriedade 'type' de formJSON
    delete formJSON.type;

    // Manipula casos específicos para ownerName e itemName em formJSON.

    // Usa jQuery para fazer uma requisição AJAX POST para a URL especificada
    $.ajax({
        type: "POST",
        url: requestURL,
        data: JSON.stringify(formJSON),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    })
        // Callback de sucesso: Atualiza viewHTML com mensagem de sucesso
        .done(() => {
            viewHTML = `
            <form>
                <h3>Oba!</h3>
                <p>Cadastro efetuado com sucesso.</p>
                <p>Obrigado...</p>
            </form>
        `;
        })
        // Callback de falha: Atualiza viewHTML com mensagem de erro
        .fail((error) => {
            console.error('Erro:', error.status, error.statusText, error.responseJSON);
            viewHTML = `
            <form>
                <h3>Oooops!</h3>
                <p>Não foi possível realizar o cadastro. Ocorreu uma falha no servidor.</p>
            </form>
        `;
        })
        // Callback sempre: Atualiza o conteúdo HTML de .tabBlock e reseta formulários
        .always(() => {
            $('.tabBlock').html(viewHTML);
            $('#formNewOwner').trigger('reset');
            $('#formNewItem').trigger('reset');
        });

    return false;
}

// Função para mostrar uma aba específica
function showTab(tabName) {
    $('#formNewOwner').trigger('reset');
    $('#formNewItem').trigger('reset');

    switch (tabName) {
        case 'owner':
            $('#tabOwner').show();
            $('#tabItem').hide();
            $('#btnNewOwner').attr('class', 'active');
            $('#btnNewItem').attr('class', 'inactive');
            sessionStorage.openTab = 'owner';
            break;
        case 'item':
            $('#tabItem').show();
            $('#tabOwner').hide();
            $('#btnNewItem').attr('class', 'active');
            $('#btnNewOwner').attr('class', 'inactive');
            break;
    }
}

// Função para obter dados de proprietários e popular um dropdown
function getOwnersToSelect() {
    // Constrói a URL de requisição para dados de proprietários
    requestURL = `${app.apiBaseURL}/owner`;

    // Faz uma requisição GET para a URL especificada
    $.get(requestURL)
        // Callback de sucesso: Preenche ownerOptions com elementos de opção
        .done((apiData) => {
            apiData.forEach((item) => {
                ownerOptions += `<option value="${item.id}">${item.id} - ${item.name}</option>`;
            });

            // Define o conteúdo HTML do elemento #owner com ownerOptions
            $('#owner').html(ownerOptions);
        })
        // Callback de falha: Registra uma mensagem de erro
        .fail((error) => {
            console.error('Erro:', error.status, error.statusText, error.responseJSON);
        });
}

// Adiciona um ouvinte de evento para executar a função myHome quando o documento estiver pronto
$(document).ready(myHome);
