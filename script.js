const socket = io();
let myID = localStorage.getItem("zoojo_id") || "";
let contacts = JSON.parse(localStorage.getItem("zoojo_contacts") || "[]");

// --- 1. FUNGSI GENERATE ID (INSTAN) ---
function startLoading() {
    // Langsung buat ID tanpa nunggu setTimeout
    myID = "ZJ" + Math.floor(10000000 + Math.random() * 90000000);
    localStorage.setItem("zoojo_id", myID);
    
    // Langsung update tampilan
    document.getElementById('btn-create').classList.add('hidden');
    document.getElementById('id-display-area').classList.remove('hidden');
    document.getElementById('generated-id').innerText = myID;
    document.getElementById('post-id-btns').classList.remove('hidden');
    
    // Daftarkan ke server
    socket.emit('register', myID);
    console.log("ID Berhasil Dibuat: " + myID);
}

// --- 2. NAVIGASI HALAMAN ---
function keDashboard() {
    if (!myID) return alert("Buat ID dulu bos!");
    document.getElementById('screen-register').classList.add('hidden');
    document.getElementById('screen-dashboard').classList.remove('hidden');
    renderContacts();
}

function bukaHalamanID() {
    document.getElementById('screen-dashboard').classList.add('hidden');
    document.getElementById('screen-profile').classList.remove('hidden');
    document.getElementById('my-id-display').innerText = localStorage.getItem("zoojo_id") || myID;
}

function kembaliKeChat() {
    document.getElementById('screen-profile').classList.add('hidden');
    document.getElementById('screen-dashboard').classList.remove('hidden');
}

// --- 3. KONTAK & MODAL ---
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
        document.getElementById('input-target').value = "";
    } else {
        alert("ID tidak valid!");
    }
}

function renderContacts() {
    const list = document.getElementById('contact-list');
    list.innerHTML = contacts.length === 0 ? '<p class="empty-info">Belum ada teman.</p>' : "";
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

// --- 4. SISTEM CHAT ---
function kirimPesan() {
    const input = document.getElementById('msg-input');
    const targetID = document.getElementById('chat-with-id').innerText;
    const pesan = input.value.trim();

    if (pesan && targetID) {
        socket.emit('kirim-pesan', { sender: myID, target: targetID, text: pesan });
        tampilkanPesan(pesan, 'sent');
        input.value = "";
    }
}

socket.on('terima-pesan', (data) => {
    if (data.sender === document.getElementById('chat-with-id').innerText) {
        tampilkanPesan(data.text, 'received');
    } else {
        alert("Pesan baru dari " + data.sender);
    }
});

function tampilkanPesan(teks, tipe) {
    const container = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `message ${tipe}`;
    div.innerText = teks;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Auto-login
window.onload = () => {
    if (myID) {
        document.getElementById('id-display-area').classList.remove('hidden');
        document.getElementById('generated-id').innerText = myID;
        document.getElementById('post-id-btns').classList.remove('hidden');
        document.getElementById('btn-create').classList.add('hidden');
        socket.emit('register', myID);
    }
};