// PERSISTÊNCIA DE DADOS COM LOCALSTORAGE
let dbClientes = JSON.parse(localStorage.getItem('dbClientes')) || [];
let dbProfissionais = JSON.parse(localStorage.getItem('dbProfissionais')) || [];
let dbAgendamentos = JSON.parse(localStorage.getItem('dbAgendamentos')) || [
    { id: 101, cliente: "Sarah Jenkins", servico: "Cortes Modernos", data: "24/08/2026 - 09:00", valor: 120.00, status: "Pago" }
];

function salvarAgendamentos() {
    localStorage.setItem('dbAgendamentos', JSON.stringify(dbAgendamentos));
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('users-table-body') || document.querySelector('.admin-dashboard')) {
        renderAdminDashboard();
    }
    if (document.getElementById('agendar-profissional')) {
        popularSelectsAgendamento();
    }
    const listaProfs = document.getElementById('lista-profissionais');
    if (listaProfs) {
        dbProfissionais.forEach(p => {
            listaProfs.innerHTML += `<div class="service-card"><i class="fa-solid fa-user-tie"></i><h3>${p.nome}</h3><p>${p.especialidade} — ${p.telef}</p></div>`;
        });
    }
});

// ALTERNAR FORMULÁRIO DE CADASTRO
function switchForm(type) {
    const formCli = document.getElementById('form-cliente');
    const formProf = document.getElementById('form-profissional');
    const btns = document.querySelectorAll('.tab-btn');

    if (type === 'cliente') {
        formCli.style.display = 'block';
        formProf.style.display = 'none';
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        formCli.style.display = 'none';
        formProf.style.display = 'block';
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
}

// CADASTRO DE CLIENTES/PROFISSIONAIS
function handleRegister(event, type) {
    event.preventDefault();

    if (type === 'cliente') {
        const cliente = {
            nome: document.getElementById('cli-nome').value,
            email: document.getElementById('cli-email').value,
            telef: document.getElementById('cli-telef').value,
            senha: document.getElementById('cli-senha').value
        };
        dbClientes.push(cliente);
        localStorage.setItem('dbClientes', JSON.stringify(dbClientes));
        alert('✨ Cliente cadastrado com sucesso!');
    } else {
        const prof = {
            nome: document.getElementById('prof-nome').value,
            especialidade: document.getElementById('prof-especialidade').value,
            telef: document.getElementById('prof-telef').value
        };
        dbProfissionais.push(prof);
        localStorage.setItem('dbProfissionais', JSON.stringify(dbProfissionais));
        alert('✨ Profissional cadastrado com sucesso!');
    }

    event.target.reset();
}

// SERVIÇOS DISPONÍVEIS (nome, profissional opcional, valor)
const SERVICOS = [
    { nome: "Corte Feminino", valor: 90.00 },
    { nome: "Corte Masculino", valor: 50.00 },
    { nome: "Coloração", valor: 220.00 },
    { nome: "Progressiva", valor: 350.00 },
    { nome: "Manicure & Pedicure", valor: 60.00 },
    { nome: "Design de Sobrancelhas", valor: 45.00 }
];

// PREENCHER SELECTS DO FORMULÁRIO DE AGENDAMENTO
function popularSelectsAgendamento() {
    const selServico = document.getElementById('agendar-servico');
    const selProf = document.getElementById('agendar-profissional');

    if (selServico) {
        selServico.innerHTML = SERVICOS.map(s => `<option value="${s.nome}" data-valor="${s.valor}">${s.nome} — R$ ${s.valor.toFixed(2)}</option>`).join('');
    }
    if (selProf) {
        selProf.innerHTML = '<option value="">Qualquer profissional</option>' +
            dbProfissionais.map(p => `<option value="${p.nome}">${p.nome} (${p.especialidade})</option>`).join('');
    }
}

// CRIAR AGENDAMENTO
function handleBooking(event) {
    event.preventDefault();

    const servicoSel = document.getElementById('agendar-servico');
    const servico = SERVICOS.find(s => s.nome === servicoSel.value);
    const dataHora = document.getElementById('agendar-data').value;

    const ag = {
        id: Date.now().toString().slice(-6),
        cliente: document.getElementById('agendar-nome').value,
        servico: servicoSel.value,
        data: dataHora ? new Date(dataHora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
        valor: servico ? servico.valor : 0,
        status: "Pendente"
    };

    dbAgendamentos.push(ag);
    salvarAgendamentos();
    alert(`✨ Agendamento confirmado para ${ag.data}!\nServiço: ${ag.servico} — R$ ${ag.valor.toFixed(2)}`);
    event.target.reset();
}

// LOGIN SIMPLES (cliente cadastrado ou admin fixo)
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    if (email === 'admin@studio.com' && senha === 'admin123') {
        alert('🔓 Login de administrador realizado!');
        window.location.href = 'admin.html';
        return;
    }

    const cliente = dbClientes.find(c => c.email === email && c.senha === senha);
    if (cliente) {
        alert(`💖 Bem-vinda, ${cliente.nome}!`);
        window.location.href = 'index.html';
    } else {
        alert('❌ E-mail ou senha incorretos.');
    }
}

// CARREGAR DADOS NO PAINEL ADMIN
function renderAdminDashboard() {
    const usersTbody = document.getElementById('users-table-body');
    const bookingsTbody = document.getElementById('db-table-body');

    if (usersTbody) {
        usersTbody.innerHTML = '';
        dbClientes.forEach(c => {
            usersTbody.innerHTML += `<tr><td><span class="badge-cli">Cliente</span></td><td>${c.nome}</td><td>${c.telef} | ${c.email}</td></tr>`;
        });
        dbProfissionais.forEach(p => {
            usersTbody.innerHTML += `<tr><td><span class="badge-prof">Profissional</span></td><td>${p.nome}</td><td>${p.especialidade} (${p.telef})</td></tr>`;
        });
        if (dbClientes.length === 0 && dbProfissionais.length === 0) {
            usersTbody.innerHTML = '<tr><td colspan="3">Nenhum registro ainda.</td></tr>';
        }
    }

    if (bookingsTbody) {
        bookingsTbody.innerHTML = '';
        dbAgendamentos.forEach(b => {
            const badge = b.status === 'Pago' ? 'badge-pago' : 'badge-pendente';
            bookingsTbody.innerHTML += `
                <tr>
                    <td>#${b.id}</td>
                    <td>${b.cliente}</td>
                    <td>${b.servico}</td>
                    <td>${b.data}</td>
                    <td>R$ ${Number(b.valor).toFixed(2)}</td>
                    <td><span class="${badge}">${b.status}</span></td>
                </tr>`;
        });
    }

    // Atualizar métricas
    const totalRev = dbAgendamentos.reduce((acc, curr) => acc + Number(curr.valor), 0);
    const elRev = document.getElementById('total-revenue');
    const elBookings = document.getElementById('total-bookings');
    const elOccupancy = document.getElementById('occupancy-rate');
    if (elRev) elRev.innerText = `R$ ${totalRev.toFixed(2).replace('.', ',')}`;
    if (elBookings) elBookings.innerText = dbAgendamentos.length;
    if (elOccupancy) elOccupancy.innerText = Math.min(100, dbAgendamentos.length * 10) + '%';
}
