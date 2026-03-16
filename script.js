const socket = io();
let myID = localStorage.getItem("zoojo_id") || "";

// 1. Fungsi Loading 5 Detik
function startLoading() {
    document.getElementById('btn-create').classList.add('hidden');
    document.getElementById('post-id-btns').classList.add('hidden');
    document.getElementById('id-display-area').classList.add('hidden');
    document.getElementById('loader').classList.remove('hidden');

    setTimeout(() => {
        myID = "ZJ" + Math.floor(10000000 + Math.random() * 90000000);
        localStorage.setItem("zoojo_id", myID);
        
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('id-display-area').classList.remove('hidden');
        document.getElementById('generated-id').innerText = myID;
        document.getElementById('post-id-btns').classList.remove('hidden');
        
        socket.emit('register', myID);
    }, 5000); // 5 Detik sesuai permintaan
}

// 2. Ke Dashboard
function keDashboard() {
    if (!myID) return alert("Buat ID dulu bos!");
    document.getElementById('screen-register').classList.add('hidden');
    document.getElementById('screen-dashboard').classList.remove('hidden');
    renderContacts();
}

// 3. Sistem Kontak
let contacts = JSON.parse(localStorage.getItem("zoojo_contacts") || "[]");

function bukaModalTambah() {
    document.getElementById('modal-tambah').classList.remove('hidden');
}

function tutupModal() {
    document.getElementById('modal-tambah').classList.add('hidden');
}

function tambahTeman() {
    const target = document.getElementById('input-target').value.trim();
    if (target.startsWith("ZJ") && target !== myID) {
        if (!contacts.includes(target)) {
            contacts.push(target);
            localStorage.setItem("zoojo_contacts", JSON.stringify(contacts));
        }
        renderContacts();
        tutupModal();
    } else {
        alert("ID ZJ tidak valid!");
    }
}

function renderContacts() {
    const list = document.getElementById('contact-list');
    if (contacts.length === 0) {
        list.innerHTML = '<p class="empty-info">Belum ada teman.</p>';
        return;
    }
    list.innerHTML = "";
    contacts.forEach(id => {
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.innerHTML = `<div class="avatar-circle">ZJ</div><span>${id}</span>`;
        div.onclick = () => bukaRoomChat(id);
        list.appendChild(div);
    });
}

function bukaRoomChat(id) {
    document.getElementById('no-chat').classList.add('hidden');
    document.getElementById('chat-window').classList.remove('hidden');
    document.getElementById('chat-with-id').innerText = id;
}

function cekNomor() {
    alert("Nomor Zoojo Kamu: " + myID);
}

// Auto Login jika sudah ada ID
window.onload = () => {
    if (myID) {
        document.getElementById('btn-create').innerText = "Lanjut dengan ID: " + myID;
        // Opsional: Langsung tampilkan tombol lanjut
        document.getElementById('id-display-area').classList.remove('hidden');
        document.getElementById('generated-id').innerText = myID;
        document.getElementById('post-id-btns').classList.remove('hidden');
        document.getElementById('btn-create').classList.add('hidden');
    }
};
// 1. Fungsi untuk masuk ke halaman Profil ID
function bukaHalamanID() {
    console.log("Tombol titik 3 diklik!"); // Ini untuk cek di Console (F12)
    
    const dashboard = document.getElementById('screen-dashboard');
    const profile = document.getElementById('screen-profile');
    const idDisplay = document.getElementById('my-id-display');

    if (dashboard && profile) {
        dashboard.classList.add('hidden');
        profile.classList.remove('hidden');
        
        // Ambil ID yang tersimpan
        const currentID = localStorage.getItem("zoojo_id") || "ZJ-Belum-Ada";
        idDisplay.innerText = currentID;
    } else {
        console.error("EROR 787");
    }
}

// 2. Fungsi untuk balik lagi ke chat
function kembaliKeChat() {
    document.getElementById('screen-profile').classList.add('hidden');
    document.getElementById('screen-dashboard').classList.remove('hidden');
    // --- 5. SISTEM CHAT REAL-TIME ---

// Fungsi Kirim Pesan
function kirimPesan() {
    const input = document.getElementById('msg-input');
    const targetID = document.getElementById('chat-with-id').innerText;
    const pesan = input.value.trim();

    if (pesan && targetID) {
        // Kirim ke server
        socket.emit('kirim-pesan', {
            sender: myID,
            target: targetID,
            text: pesan
        });

        // Tampilkan di layar sendiri (Bubble Chat Kanan)
        tampilkanPesan(pesan, 'sent');
        input.value = "";
    }
}

// Terima Pesan dari Server
socket.on('terima-pesan', (data) => {
    const chatSekarang = document.getElementById('chat-with-id').innerText;
    
    // Hanya tampilkan jika kita sedang buka chat dengan pengirim tersebut
    if (data.sender === chatSekarang) {
        tampilkanPesan(data.text, 'received');
    } else {
        alert("Pesan baru dari " + data.sender);
    }
});

// Fungsi untuk Munculin Bubble Chat di Layar
function tampilkanPesan(teks, tipe) {
    const container = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `message ${tipe}`; // tipe bisa 'sent' atau 'received'
    div.innerText = teks;
    container.appendChild(div);
    
    // Auto scroll ke bawah
    container.scrollTop = container.scrollHeight;
}
}