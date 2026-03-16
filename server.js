const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Objek untuk menyimpan daftar user yang online
const users = {}; 

io.on('connection', (socket) => {
    console.log('Ada koneksi baru terdeteksi!');

    // 1. Logika saat user mendaftarkan ID ZJ-nya
    socket.on('register', (zjID) => {
        users[zjID] = socket.id;
        console.log(`User terdaftar: ID ZJ [${zjID}] menggunakan Socket [${socket.id}]`);
    });

    // 2. LOGIKA KIRIM PESAN REAL-TIME
    socket.on('kirim-pesan', (data) => {
        const targetSocketId = users[data.target];
        
        if (targetSocketId) {
            // Jika teman online, langsung kirim ke dia
            io.to(targetSocketId).emit('terima-pesan', {
                sender: data.sender,
                text: data.text
            });
            console.log(`Pesan dari ${data.sender} dikirim ke ${data.target}`);
        } else {
            console.log(`Gagal kirim: ${data.target} sedang tidak online.`);
        }
    });
}); // <--- Langsung ditutup di sini tanpa disconnect

http.listen(3000, () => {
    console.log('MANTAP! Server Zoojo jalan di http://localhost:3000');
});