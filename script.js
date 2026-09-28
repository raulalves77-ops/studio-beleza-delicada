// PERSISTÊNCIA DE DADOS COM LOCALSTORAGE
let dbClientes = JSON.parse(localStorage.getItem('dbClientes')) || [];
let dbProfissionais = JSON.parse(localStorage.getItem('dbProfissionais')) || [];
let dbAgendamentos = JSON.parse(localStorage.getItem('dbAgendamentos')) || [
    { id: 101, cliente: "Sarah Jenkins", servico: "Cortes Modernos", data: "24/08/2026 - 09:00", valor: 120.00, status: "Pago" }
];

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-dashboard') || document.getElementById('users-table-body')) {
        renderAdminDashboard();
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
            telef: document.getElementById('cli-telef').value
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
    }

    if (bookingsTbody) {
        bookingsTbody.innerHTML = '';
        dbAgendamentos.forEach(b => {
            bookingsTbody.innerHTML += `
                <tr>
                    <td>#${b.id}</td>
                    <td>${b.cliente}</td>
                    <td>${b.servico}</td>
                    <td>${b.data}</td>
                    <td>R$ ${b.valor.toFixed(2)}</td>
                    <td>${b.status}</td>
                </tr>`;
        });
    }

    // Atualizar métricas
    const totalRev = dbAgendamentos.reduce((acc, curr) => acc + curr.valor, 0);
    if (document.getElementById('total-revenue')) {
        document.getElementById('total-revenue').innerText = `R$ ${totalRev.toFixed(2)}`;
        document.getElementById('total-bookings').innerText = dbAgendamentos.length;
        document.getElementById('total-clients').innerText = dbClientes.length;
    }
}
