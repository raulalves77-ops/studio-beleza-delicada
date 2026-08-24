// BANCO DE DADOS EM MEMÓRIA (MOCK BD)
let dbAgendamentos = [
    { id: 101, cliente: "Sarah Jenkins", servico: "Cortes Modernos", data: "24/08/2026 - 09:00", valor: 120.00, comprovante: "https://pix.com/tx123", status: "Pago" }
];

// VARIÁVEIS DE CONTROLE DO CALENDÁRIO
let currentDate = new Date();
let selectedDate = null;
let pendingBooking = null;

const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    updateAdminMetrics();
});

// LÓGICA DO CALENDÁRIO REAL
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('calendar-month-year').innerText = `${monthNames[month]} de ${year}`;

    const container = document.getElementById('calendar-days-container');
    container.innerHTML = `
        <span class="day-head">D</span><span class="day-head">S</span><span class="day-head">T</span>
        <span class="day-head">Q</span><span class="day-head">Q</span><span class="day-head">S</span><span class="day-head">S</span>
    `;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Espaços vazios antes do primeiro dia
    for (let x = 0; x < firstDayIndex; x++) {
        const emptySpan = document.createElement('span');
        emptySpan.classList.add('day', 'muted');
        container.appendChild(emptySpan);
    }

    // Dias do mês
    for (let day = 1; day <= lastDay; day++) {
        const daySpan = document.createElement('span');
        daySpan.classList.add('day');
        daySpan.innerText = day;

        const dateObj = new Date(year, month, day);

        // Bloquear dias passados
        if (dateObj < today) {
            daySpan.classList.add('disabled');
        } else {
            daySpan.onclick = () => selectDate(day, month, year, daySpan);
        }

        // Marcar selecionado se houver
        if (selectedDate && selectedDate.getTime() === dateObj.getTime()) {
            daySpan.classList.add('selected');
        }

        container.appendChild(daySpan);
    }
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function selectDate(day, month, year, element) {
    selectedDate = new Date(year, month, day);
    
    document.querySelectorAll('.calendar-grid .day').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');

    const formatted = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`;
    document.getElementById('selected-date-badge').innerText = formatted;
}

// ALTERNAR TEMA CLARO / ESCURO
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
}

// TROCA DE TELAS (SPA)
function switchView(view) {
    document.getElementById('cliente-view').style.display = view === 'cliente' ? 'grid' : 'none';
    document.getElementById('admin-view').style.display = view === 'admin' ? 'grid' : 'none';
    document.getElementById('payment-view').style.display = view === 'payment' ? 'grid' : 'none';

    if (view === 'admin') renderDatabaseTable();
}

function selectService(nomeServico, preco) {
    const select = document.getElementById('service-select');
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.includes(nomeServico)) {
            select.selectedIndex = i;
            break;
        }
    }
    document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' });
}

// ETAPA 1: DIRECIOPNAR PARA TELA DE PAGAMENTO
function goToPaymentStep(event) {
    event.preventDefault();

    if (!selectedDate) {
        alert("Por favor, escolha uma data disponível no calendário!");
        return;
    }

    const name = document.getElementById('client-name').value;
    const serviceRaw = document.getElementById('service-select').value;
    const time = document.getElementById('time-select').value;
    const paymentMethod = document.getElementById('payment-select').value;

    const [servicoNome, preco] = serviceRaw.split('|');

    const formattedDate = `${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}`;

    pendingBooking = {
        id: Math.floor(1000 + Math.random() * 9000),
        cliente: name,
        servico: servicoNome,
        data: `${formattedDate} - ${time}`,
        valor: parseFloat(preco),
        metodo: paymentMethod
    };

    // Renderizar dados na tela de pagamento
    document.getElementById('booking-summary-box').innerHTML = `
        <p><strong>Cliente:</strong> ${pendingBooking.cliente}</p>
        <p><strong>Serviço:</strong> ${pendingBooking.servico}</p>
        <p><strong>Data/Horário:</strong> ${pendingBooking.data}</p>
        <p><strong>Método Selecionado:</strong> ${pendingBooking.metodo}</p>
        <p><strong>Total a Pagar:</strong> <span style="color:var(--accent-marsala); font-size:18px; font-weight:bold;">R$ ${pendingBooking.valor.toFixed(2)}</span></p>
    `;

    switchView('payment');
}

function cancelPayment() {
    switchView('cliente');
}

// ETAPA 2: FINALIZAR E SALVAR NO BANCO
function finalizeBookingWithPayment() {
    const linkInput = document.getElementById('payment-link-input').value;

    if (!linkInput) {
        alert("Por favor, cole o link do comprovante ou a referência de pagamento!");
        return;
    }

    pendingBooking.comprovante = linkInput;
    pendingBooking.status = "Aguardando Validação";

    dbAgendamentos.push(pendingBooking);
    updateAdminMetrics();

    alert(`✨ Agendamento recebido!\nO comprovante de ${pendingBooking.cliente} foi anexado com sucesso.`);
    
    document.getElementById('agendamento-form').reset();
    document.getElementById('payment-link-input').value = '';
    selectedDate = null;
    document.getElementById('selected-date-badge').innerText = 'Selecione';
    renderCalendar();

    switchView('cliente');
}

// RENDERIZAR TABELA ADMIN
function renderDatabaseTable() {
    const tbody = document.getElementById('db-table-body');
    tbody.innerHTML = '';

    dbAgendamentos.forEach(item => {
        const row = `
            <tr>
                <td>#${item.id}</td>
                <td><strong>${item.cliente}</strong></td>
                <td>${item.servico}</td>
                <td>${item.data}</td>
                <td>R$ ${item.valor.toFixed(2)}</td>
                <td><a href="${item.comprovante}" target="_blank" style="color:var(--accent-marsala);">Ver Anexo</a></td>
                <td><span class="status-tag status-pago">${item.status}</span></td>
                <td>
                    <button style="border:none; background:none; color:red; cursor:pointer;" onclick="deleteBooking(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function deleteBooking(id) {
    dbAgendamentos = dbAgendamentos.filter(item => item.id !== id);
    renderDatabaseTable();
    updateAdminMetrics();
}

function updateAdminMetrics() {
    let revenue = 0;
    const clientsSet = new Set();

    dbAgendamentos.forEach(item => {
        revenue += item.valor;
        clientsSet.add(item.cliente);
    });

    document.getElementById('total-revenue').innerText = `R$ ${revenue.toFixed(2)}`;
    document.getElementById('total-bookings').innerText = dbAgendamentos.length;
    document.getElementById('total-clients').innerText = clientsSet.size;
}