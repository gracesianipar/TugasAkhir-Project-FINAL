const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./backend/js/db.js');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

app.use(cors({ origin: '*' }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
    }
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

// mengkonfigurasi transport untuk mengirim email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'backend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'index.html'));
});

app.get('/profil', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'profil.html'));
});

app.get('/sejarah_singkat', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'sejarah_singkat.html'));
});

app.get('/visi_misi', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'visi_misi.html'));
});

app.get('/contact_us', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'contact_us.html'));
});

app.get('/fasilitas', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'fasilitas.html'));
});

app.get('/detail-pegawai', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'detail-pegawai.html'));
});

app.get('/mading', (req, res) => {
    res.sendFile(path.join(__dirname,'frontend', 'html', 'mading.html'));
});

app.get('/mading-detail', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'mading-detail.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'login.html'));
});

app.get('/lupapassword', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'lupapassword.html'));
});

app.post('/api/login', async (req, res) => {
    const { username, password, login_sebagai } = req.body;
    try {
        let query = '';
        let params = [];
        let userRole = '';
        if (login_sebagai === 'Pegawai') {
            query = `SELECT p.nip, p.nama_pegawai, p.password, r.nama_role, p.tempat_lahir, p.tanggal_lahir, p.nik, p.tanggal_mulai_tugas, p.jenjang_pendidikan, p.jurusan, p.golongan, p.nuptk
                     FROM pegawai p
                     JOIN pegawai_roles pr ON p.nip = pr.nip
                     JOIN roles r ON pr.role_id = r.id 
                     WHERE p.nip = ?`;
            params = [username];
        } else if (login_sebagai === 'Siswa') {
            query = 'SELECT * FROM siswa WHERE nisn = ?';
            params = [username];
        } else {
            return res.status(400).json({ message: 'Login sebagai tidak valid' });
        }
        const [user] = await db.query(query, params);
        if (user.length > 0) {
            if (login_sebagai === 'Pegawai' && password === user[0].password) {
                userRole = user[0].nama_role;
                req.session.user = {
                    id: user[0].nip,
                    name: user[0].nama_pegawai,
                    role: userRole,
                    login_sebagai: login_sebagai,
                    tempat_lahir: user[0].tempat_lahir,
                    tanggal_lahir: user[0].tanggal_lahir,
                    nik: user[0].nik,
                    tanggal_mulai_tugas: user[0].tanggal_mulai_tugas,
                    jenjang_pendidikan: user[0].jenjang_pendidikan,
                    jurusan: user[0].jurusan,
                    golongan: user[0].golongan,
                    nuptk: user[0].nuptk
                };
                console.log("Session after login:", req.session.user);
                res.status(200).json({
                    message: 'Login berhasil',
                    user: {
                        id: user[0].nip,
                        name: user[0].nama_pegawai,
                        role: userRole,
                        login_sebagai: login_sebagai,
                        tempat_lahir: user[0].tempat_lahir,
                        tanggal_lahir: user[0].tanggal_lahir,
                        tanggal_mulai_tugas: user[0].tanggal_mulai_tugas,
                        jenjang_pendidikan: user[0].jenjang_pendidikan,
                        jurusan: user[0].jurusan,
                        golongan: user[0].golongan,
                        nuptk: user[0].nuptk
                    }
                });
            } else if (login_sebagai === 'Siswa' && password === user[0].password) {
                req.session.user = {
                    id: user[0].nisn, 
                    name: user[0].nama_siswa, 
                    role: 'Siswa', 
                    login_sebagai: login_sebagai,
                    tempat_lahir: user[0].tempat_lahir,
                    tanggal_lahir: user[0].tanggal_lahir,
                    nik: user[0].nik,
                    agama: user[0].agama,
                    nama_ayah: user[0].nama_ayah,
                    nama_ibu: user[0].nama_ibu,
                    no_hp_ortu: user[0].no_hp_ortu,
                    email: user[0].email,
                    anak_ke: user[0].anak_ke,
                    status: user[0].status,
                    tanggal_masuk: user[0].tanggal_masuk,
                    last_password_update: user[0].last_password_update,
                    profile_image: user[0].profile_image,
                    id_kelas: user[0].id_kelas,
                    jenis_kelamin: user[0].jenis_kelamin
                };
                console.log("Session after login (Siswa):", req.session.user);
                res.status(200).json({
                    message: 'Login berhasil',
                    user: req.session.user
                });
            } else {
                res.status(401).json({ message: 'Password salah' });
              res.status(401).json({ message: 'Password salah' });
            }
        } else {
            res.status(404).json({ message: `${login_sebagai} tidak ditemukan` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

app.post('/login', (req, res) => {
    const userRole = req.session.user?.role;
    console.log("User Role from session:", userRole);

    if (userRole === 'Admin') {
        res.redirect('/dashboard-admin');
    } else if (userRole === 'Guru Mata Pelajaran') {
        res.redirect('/dashboard-matpel');
    } else if (userRole === 'Guru Wali Kelas') {
        res.redirect('/dashboard-walikelas');
    } else if (userRole === 'Guru Mata Pelajaran & Wali Kelas') {
        res.redirect('/dashboard-walikelas');
    } else if (userRole === 'Kepala Sekolah') {
        res.redirect('/dashboard-kepalaSekolah');

    } else {
        res.redirect('/dashboard-siswa');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        const { role } = req.session.user;
        if (role === 'Admin') {
            res.redirect('/dashboard-admin');
         } else if (role === 'Guru Mata Pelajaran') {
            res.redirect('/dashboard-matpel');
        } else if (role === 'Guru Wali Kelas') {
            res.redirect('/dashboard-walikelas');
        } else if (role === 'Guru Mata Pelajaran & Wali Kelas') {
            res.redirect('/dashboard-guru');
        } else if (role === 'Siswa') {
                res.redirect('/dashboard-siswa');
        } else if (role === 'Kepala Sekolah') {
                res.redirect('/dashboard-kepalaSekolah');
        } else {
            res.redirect('/login'); // Jika role tidak dikenali
        }
    } else {
        res.redirect('/login'); // Jika tidak ada sesi
    }
});

app.get('/dashboard-admin', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        const profileImage = req.session.user.profile_image || '/images/profile/kepsek.png'; 
        res.sendFile(path.join(__dirname, 'frontend', 'html', 'dashboard-admin.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-matpel', (req, res) => {
    if (req.session.user && req.session.user.role === 'Guru Mata Pelajaran') {
        res.sendFile(path.join(__dirname, 'frontend','html', 'dashboard-matpel.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-walikelas', (req, res) => {
    if (req.session.user && req.session.user.role === 'Guru Wali Kelas') {
        res.sendFile(path.join(__dirname, 'frontend', 'html','dashboard-walikelas.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-guru', (req, res) => {
    if (req.session.user && req.session.user.role === 'Guru Mata Pelajaran & Wali Kelas') {
        res.sendFile(path.join(__dirname,  'frontend', 'html', 'dashboard-guru.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-kepalaSekolah', (req, res) => {
    if (req.session.user && req.session.user.role === 'Kepala Sekolah') {
        res.sendFile(path.join(__dirname, 'views', 'dashboard-kepalaSekolah.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-siswa', (req, res) => {
    if (req.session.user && req.session.user.role === 'Siswa') {
        res.sendFile(path.join(__dirname, 'frontend', 'html', 'dashboard-siswa.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/api/session', (req, res) => {
    if (req.session.user) {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        res.json({
            name: req.session.user.name || 'Tidak tersedia',
            tempat_lahir: req.session.user.tempat_lahir || 'Tidak tersedia',
            tanggal_lahir: req.session.user.tanggal_lahir ? formatDate(req.session.user.tanggal_lahir) : 'Tidak tersedia',
            nip: req.session.user.id || 'Tidak tersedia',
            position: req.session.user.role || 'Tidak tersedia',
            login_sebagai: req.session.user.login_sebagai || 'Tidak tersedia',
            nik: req.session.user.nik || 'Tidak tersedia',
            tanggal_mulai_tugas: req.session.user.tanggal_mulai_tugas ? formatDate(req.session.user.tanggal_mulai_tugas) : 'Tidak tersedia',
            jenjang_pendidikan: req.session.user.jenjang_pendidikan || 'Tidak tersedia',
            jurusan: req.session.user.jurusan || 'Tidak tersedia',
            golongan: req.session.user.golongan || '-',
            nuptk: req.session.user.nuptk || '-'
        });
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

app.get('/api/session-siswa', (req, res) => {
    console.log("Session Data:", req.session.user);  // Debug log untuk memastikan sesi ada

    if (req.session.user) {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID');
        };

        res.json({
            name: req.session.user.name || 'Tidak tersedia',
            tempat_lahir: req.session.user.tempat_lahir || 'Tidak tersedia',
            nisn: req.session.user.id || 'Tidak tersedia',
            tanggal_lahir: req.session.user.tanggal_lahir ? formatDate(req.session.user.tanggal_lahir) : 'Tidak tersedia',
            nik: req.session.user.nik || 'Tidak tersedia',
            jenis_kelamin: req.session.user.jenis_kelamin || 'Tidak tersedia',
            agama: req.session.user.agama || 'Tidak tersedia',
            nama_ayah: req.session.user.nama_ayah || 'Tidak tersedia',
            nama_ibu: req.session.user.nama_ibu || 'Tidak tersedia',
            no_hp_ortu: req.session.user.no_hp_ortu || 'Tidak tersedia',
            email: req.session.user.email || 'Tidak tersedia',
            anak_ke: req.session.user.anak_ke || 'Tidak tersedia',
            status: req.session.user.status || 'Tidak tersedia',
            tanggal_masuk: req.session.user.tanggal_masuk ? formatDate(req.session.user.tanggal_masuk) : 'Tidak tersedia',
            last_password_update: req.session.user.last_password_update ? formatDate(req.session.user.last_password_update) : 'Tidak tersedia',
            profile_image: req.session.user.profile_image || 'Tidak tersedia',
            id_kelas: req.session.user.id_kelas || 'Tidak tersedia'
        });
    } else {
        res.status(401).json({ message: 'User not logged in' });  // Pastikan sesi benar-benar ada
    }
});

app.get('/api/pegawai', async (req, res) => {
    try {
        const query = 'SELECT * FROM pegawai';  // Menyesuaikan query dengan struktur database Anda
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

app.get('/api/pegawai/:nip', async(req, res) => {
    const { nip } = req.params;

    try {
        const query = 'SELECT * FROM pegawai WHERE nip = ?';
        const [result] = await db.execute(query, [nip]);

        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.delete('/api/pegawai/:nip', async (req, res) => {
    const { nip } = req.params;
    console.log(`Deleting pegawai with NIP: ${nip}`);  // Log NIP yang diterima

    try {
        const deleteQuery = 'DELETE FROM pegawai WHERE nip = ?';
        const [result] = await db.query(deleteQuery, [nip]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Pegawai berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting pegawai:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/pegawai', (req, res, next) => {
    upload.single('profile_image')(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: 'Error dalam upload file!' });
        }
        next();
    });
}, async (req, res) => {
    try {
        const {
            nip, namaPegawai, tanggalLahir, tempatLahir,
            jenisKelamin, alamat, agama, email,
            noHp, password, nik, tanggalMulaiTugas,
            jenjangPendidikan, jurusan, role  // Perhatikan 'role' sebagai nilai tunggal
        } = req.body;

        console.log('Data diterima:', req.body);

        // Validasi role
        if (!role) {
            return res.status(400).json({ message: 'Role harus dipilih!' });
        }

        // Insert pegawai ke tabel pegawai
        const query = `
            INSERT INTO pegawai 
            (nip, nama_pegawai, tanggal_lahir, tempat_lahir, jenis_kelamin, alamat, agama, email, no_hp, password, nik, tanggal_mulai_tugas, jenjang_pendidikan, jurusan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.execute(query, [
            nip, namaPegawai, tanggalLahir, tempatLahir,
            jenisKelamin, alamat, agama, email,
            noHp, password, nik, tanggalMulaiTugas,
            jenjangPendidikan, jurusan
        ]);

        // Insert role ke tabel pegawai_roles
        await db.execute('INSERT INTO pegawai_roles (nip, role_id) VALUES (?, ?)', [nip, role]);

        res.status(201).json({ message: 'Data pegawai dan role berhasil ditambahkan!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('Duplicate Entry Error:', error);
            return res.status(409).json({ message: 'NIP sudah terdaftar!' });
        }

        console.error('Error menyimpan data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/check-wali', async (req, res) => {
    const pegawaiId = req.query.pegawai_id; // Sesuai dengan query yang dikirim
    const tahunAjaranId = req.query.tahun_ajaran_id;

    try {
        const [rows] = await db.execute(
            `SELECT COUNT(*) AS count 
             FROM kelas 
             WHERE nip = ? AND id_tahun_ajaran = ?`,
            [pegawaiId, tahunAjaranId]
        );
    
        console.log('Hasil Query:', rows); // Log hasil query untuk debugging
    
        if (rows[0].count > 0) {
            return res.status(200).json({ exists: true });
        }
    
        res.status(200).json({ exists: false });
    } catch (error) {
        console.error('Error saat memeriksa wali:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
    
});

app.put('/api/pegawai/:nip', async (req, res) => {
    const { nip } = req.params;
    const {
        namaPegawai,
        tanggalLahir,
        tempatLahir,
        jenisKelamin,
        alamat,
        agama,
        email,
        noHp,
        nik,
        tanggalMulaiTugas,
        jenjangPendidikan,
        jurusan,
        role,  // role adalah string (contoh: "R1")
    } = req.body;

    try {
        // Validasi input jika diperlukan
        if (!namaPegawai || !tanggalLahir || !tempatLahir || !jenisKelamin || !alamat || !agama || !email || !noHp || !nik || !tanggalMulaiTugas || !jenjangPendidikan || !jurusan || !role) {
            return res.status(400).json({ message: 'Semua field wajib diisi.' });
        }

        // Query untuk update data pegawai
        const updateQuery = `
            UPDATE pegawai 
            SET 
                nama_pegawai = ?,
                tanggal_lahir = ?,
                tempat_lahir = ?,
                jenis_kelamin = ?,
                alamat = ?,
                agama = ?,
                email = ?,
                no_hp = ?,
                nik = ?,
                tanggal_mulai_tugas = ?,
                jenjang_pendidikan = ?,
                jurusan = ? 
            WHERE nip = ?
        `;

        // Eksekusi query update data pegawai
        await db.execute(updateQuery, [
            namaPegawai,
            tanggalLahir,
            tempatLahir,
            jenisKelamin,
            alamat,
            agama,
            email,
            noHp,
            nik,
            tanggalMulaiTugas,
            jenjangPendidikan,
            jurusan,
            nip,
        ]);

        // Hapus semua roles yang ada dan masukkan role baru (karena hanya satu role)
        const deleteRolesQuery = `DELETE FROM pegawai_roles WHERE nip = ?`;
        await db.execute(deleteRolesQuery, [nip]);

        // Insert role baru (karena role adalah string)
        const insertRolesQuery = `INSERT INTO pegawai_roles (nip, role_id) VALUES (?, ?)`;
        await db.execute(insertRolesQuery, [nip, role]);

        res.status(200).json({ message: 'Data pegawai berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data pegawai.' });
    }
});

app.get('/api/pegawai-edit/:nip', async (req, res) => {
    const { nip } = req.params;

try {
    // Query untuk mendapatkan data pegawai
    const queryPegawai = 'SELECT * FROM pegawai WHERE nip = ?';
    const [pegawaiResult] = await db.execute(queryPegawai, [nip]);

    if (pegawaiResult.length > 0) {
        // Query untuk mendapatkan role yang dimiliki oleh pegawai
        const queryRoles = `
            SELECT pr.role_id
            FROM pegawai_roles pr
            WHERE pr.nip = ?
        `;
        const [rolesResult] = await db.execute(queryRoles, [nip]);

        // Ambil role pertama (jika ada) jika hanya ingin role tunggal
        const role = rolesResult.length > 0 ? rolesResult[0].role_id : null;

        // Menambahkan role pada data pegawai
        const pegawaiData = {
            ...pegawaiResult[0],
            role: role // Hanya satu role yang akan diberikan
        };

        res.status(200).json(pegawaiData);
    } else {
        res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
    }
} catch (error) {
    console.error('Error mengambil data pegawai dan role:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
}

});

app.put('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;
    const { nama_siswa, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas } = req.body;

    try {
        const updateQuery = `
            UPDATE siswa 
            SET nama_siswa = ?, tempat_lahir = ?, tanggal_lahir = ?, jenis_kelamin = ?, alamat = ?, agama = ?, tanggal_masuk = ?, nama_ayah = ?, nama_ibu = ?, no_hp_ortu = ?, email = ?, nik = ?, anak_ke = ?, status = ?, id_kelas = ?
            WHERE nisn = ?`;

        const [result] = await db.execute(updateQuery, [
            nama_siswa, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas, nisn
        ]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Data siswa berhasil diperbarui!' });
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengupdate data siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/siswa', async (req, res) => {
    try {
        const query = 'SELECT * FROM siswa'; 
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data siswa ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/siswa', async (req, res) => {
    const {
        nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
        agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas, password
    } = req.body;

    if (!nisn || !nama_siswa || !alamat || !tempat_lahir || !tanggal_lahir || !jenis_kelamin ||
        !agama || !tanggal_masuk || !nama_ayah || !nama_ibu || !no_hp_ortu || !email || !nik || !anak_ke || !status) {
        return res.status(400).json({ message: 'Field wajib harus diisi!' });
    }

    const query = `
    INSERT INTO siswa (nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
        agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const idKelasValue = id_kelas ? id_kelas : null;

    try {
        await db.query(query, [
            nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
            agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, idKelasValue, password
        ]);
        res.status(201).json({ message: 'Data siswa berhasil ditambahkan.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            // Menangani error duplikasi primary key
            return res.status(400).json({
                message: 'NISN sudah terdaftar. Silakan gunakan NISN yang berbeda.',
                detail: err.sqlMessage
            });
        }

        console.error('Error inserting siswa:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan data siswa.' });
    }
});

app.delete('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;
    try {
        const deleteQuery = 'DELETE FROM siswa WHERE nisn = ?';
        const [result] = await db.query(deleteQuery, [nisn]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Siswa berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting Siswa:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;

    try {
        // Query pertama untuk mengambil data siswa berdasarkan NISN
        const siswaQuery = 'SELECT * FROM siswa WHERE nisn = ?';
        const [siswaResult] = await db.execute(siswaQuery, [nisn]);

        // Mengecek apakah siswa ditemukan
        if (siswaResult.length === 0) {
            return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }

        const siswa = siswaResult[0];

        // Query kedua untuk mengambil data nama kelas berdasarkan id_kelas
        const kelasQuery = 'SELECT nama_kelas FROM kelas WHERE id = ?';
        const [kelasResult] = await db.execute(kelasQuery, [siswa.id_kelas]);

        // Jika data kelas ditemukan, tambahkan nama_kelas ke objek siswa
        if (kelasResult.length > 0) {
            siswa.nama_kelas = kelasResult[0].nama_kelas;
        } else {
            siswa.nama_kelas = 'Tidak tersedia'; // Jika tidak ditemukan
        }

        // Mengirimkan data siswa yang sudah dilengkapi dengan nama_kelas
        res.status(200).json(siswa);

    } catch (error) {
        console.error('Error mengambil data Siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/kelas', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran || null;

        let query = `
            SELECT k.id, k.nama_kelas, k.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai, 
                   k.id_tahun_ajaran, k.tingkatan, 
                   ta.nama_tahun_ajaran, ta.semester  -- Tambahkan semester
            FROM kelas k
            LEFT JOIN pegawai p ON k.nip = p.nip
            LEFT JOIN tahun_ajaran ta ON k.id_tahun_ajaran = ta.id
        `;

        const params = [];

        // menambahkan filter hanya jika tahun ajaran disediakan
        if (filterTahunAjaran) {
            query += ` WHERE k.id_tahun_ajaran = ?`;
            params.push(filterTahunAjaran);
        }

        const [rows] = await db.query(query, params);

        if (rows.length > 0) {
            console.log('Data kelas yang dikirimkan:', rows);
            res.json(rows);
        } else {
            console.log('Tidak ada data kelas yang ditemukan.');
            res.json([]); 
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

app.post('/api/check-attendance', async (req, res) => {
    const { id_kelas, date } = req.body;

    try {
        const [rows] = await db.query(
            `SELECT id FROM attendance WHERE id_kelas = ? AND date = ?`,
            [id_kelas, date]
        );

        if (rows.length > 0) {
            res.status(200).json({ exists: true, attendanceId: rows[0].id });
        } else {
            res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking attendance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/kelas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT k.id, 
                   k.nama_kelas, 
                   k.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai, 
                   k.id_tahun_ajaran, 
                   k.tingkatan, 
                   s.nisn AS siswa_nisn,
                   IFNULL(s.nama_siswa, 'Nama Siswa Tidak Ada') AS nama_siswa
            FROM kelas k
            LEFT JOIN pegawai p ON k.nip = p.nip
            LEFT JOIN siswa s ON k.id = s.id_kelas
            WHERE k.id = ?
        `;

        // Menjalankan query dengan parameter ID kelas
        const [result] = await db.execute(query, [id]);

        // Mengecek apakah data ditemukan
        if (result.length > 0) {
            const kelasData = {
                id: result[0].id,
                nama_kelas: result[0].nama_kelas,
                nip: result[0].nip,
                nama_pegawai: result[0].nama_pegawai,
                id_tahun_ajaran: result[0].id_tahun_ajaran,
                tingkatan: result[0].tingkatan,
                siswa: result.map(row => ({
                    nisn: row.siswa_nisn,  // NISN
                    nama_siswa: row.nama_siswa  // Nama Siswa
                }))
            };

            res.status(200).json(kelasData);
        } else {
            res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Kelas:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/no-class', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM siswa WHERE id_kelas IS NULL');
        console.log('Hasil Query:', result); // Tambahkan log ini
        if (result.length === 0) {
            return res.status(404).json({ message: 'Tidak ada siswa tanpa kelas.' });
        }
        res.json({ siswa: result });
    } catch (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

app.put('/api/move/:nisn', async (req, res) => {
    console.log('Rute PUT dipanggil');
    const nisn = req.params.nisn;
    const { id_kelas } = req.body;

    if (!nisn || !id_kelas) {
        return res.status(400).json({ message: 'nisn dan id_kelas wajib ada' });
    }

    const query = 'UPDATE siswa SET id_kelas = ? WHERE nisn = ?';

    try {
        // Menggunakan query() untuk menjalankan query
        const [result] = await db.execute(query, [id_kelas, nisn]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Siswa berhasil dipindahkan ke kelas baru' });
        } else {
            return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        }
    } catch (err) {
        console.error('Gagal memperbarui siswa:', err);
        return res.status(500).json({ message: 'Gagal memperbarui siswa' });
    }
});

app.put('/api/siswa/move/:nisn', async (req, res) => {
    const { nisn } = req.params;


    try {
        // Query untuk memindahkan siswa (menghapus dari kelas)
        const moveQuery = `
            UPDATE siswa 
            SET id_kelas = NULL  
            WHERE nisn = ?`;

        const [result] = await db.execute(moveQuery, [nisn]); // Menunggu query selesai

        // Mengecek apakah ada baris yang terpengaruh
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Siswa berhasil dipindahkan atau dihapus dari kelas!' });
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan dengan NISN tersebut.' });
        }
    } catch (error) {
        // Menangani kesalahan jika terjadi masalah dengan database
        console.error('Error memindahkan siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/siswa/:id_kelas', async (req, res) => {
    try {
        const id_kelas = req.params.id_kelas;
        const [rows] = await db.query(
            `SELECT nisn, nama FROM siswa WHERE id_kelas = ?`,
            [id_kelas]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

app.put('/api/kelas/:id', async (req, res) => {
    const { nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan } = req.body;

    // Validasi jika data tidak ada, ubah menjadi null
    const kelasUpdate = {
        nama_kelas: nama_kelas || null,
        pegawai_id: pegawai_id || null,
        tahun_ajaran_id: tahun_ajaran_id || null,
        tingkatan: tingkatan || null,
    };

    try {
        // Pastikan parameter hanya mengandung data valid
        const result = await db.query(
            `UPDATE kelas 
             SET 
                nama_kelas = ?, 
                nip = ?, 
                id_tahun_ajaran = ?, 
                tingkatan = ?
             WHERE id = ?`,
            [kelasUpdate.nama_kelas, kelasUpdate.pegawai_id, kelasUpdate.tahun_ajaran_id, kelasUpdate.tingkatan, req.params.id]
        );
        res.json({ success: true, message: 'Data kelas berhasil diperbarui.' });
    } catch (error) {
        console.error('Error memperbarui Kelas:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui kelas.' });
    }
});

app.post('/api/kelas', async (req, res) => {
    const { nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan } = req.body;

    console.log('Received data:', req.body);

    // Validasi input
    if (!nama_kelas || !pegawai_id || !tahun_ajaran_id || !tingkatan) {
        return res.status(400).json({ success: false, message: 'Semua kolom harus diisi!' });
    }

    try {
        // Check if pegawai_id exists in the pegawai table
        const checkQuery = `SELECT * FROM pegawai WHERE nip = ?`;
        const [pegawaiResult] = await db.query(checkQuery, [pegawai_id]);

        if (pegawaiResult.length === 0) {
            return res.status(400).json({ success: false, message: 'NIP tidak ditemukan di tabel pegawai!' });
        }

        // If NIP exists, proceed with the insert
        const query = `
            INSERT INTO kelas (nama_kelas, nip, id_tahun_ajaran, tingkatan) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan]);

        console.log('Data successfully inserted:', result);
        res.status(201).json({ success: true, message: 'Kelas berhasil ditambahkan' });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
    }
});

app.get('/api/cek-pegawai-terdaftar', async (req, res) => {
    const { pegawai_id, tahun_ajaran_id } = req.query;

    // Validasi input
    if (!pegawai_id || !tahun_ajaran_id) {
        return res.status(400).json({ success: false, message: 'pegawai_id dan tahun_ajaran_id harus disertakan!' });
    }

    try {
        // Query untuk memeriksa apakah pegawai sudah terdaftar di tahun ajaran yang dipilih
        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM kelas
            WHERE nip = ? AND id_tahun_ajaran = ?
        `;
        const [result] = await db.query(checkQuery, [pegawai_id, tahun_ajaran_id]);

        if (result[0].count > 0) {
            // Pegawai sudah terdaftar di tahun ajaran tersebut
            return res.status(200).json({ isTerdaftar: true });
        } else {
            // Pegawai belum terdaftar di tahun ajaran tersebut
            return res.status(200).json({ isTerdaftar: false });
        }
    } catch (err) {
        console.error('Error checking data:', err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memeriksa data', error: err.message });
    }
});

app.delete('/api/kelas/:id', async (req, res) => {
    const { id } = req.params;  // Mengambil ID dari parameter URL
    console.log('ID yang diterima API:', id);

    // Memastikan ID yang diterima valid
    if (!id) {
        return res.status(400).json({ message: 'ID tidak valid.' });
    }

    try {
        // Query untuk menghapus kelas berdasarkan ID
        const deleteQuery = 'DELETE FROM kelas WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);

        // Mengecek apakah baris yang terpengaruh lebih dari 0
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Kelas berhasil dihapus.' });
        } else {
            // Jika tidak ada kelas yang ditemukan dengan ID tersebut
            res.status(404).json({ message: 'Kelas tidak ditemukan.' });
        }
    } catch (error) {
        // Menangani kesalahan yang terjadi selama proses penghapusan
        console.error("Error deleting Kelas:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/kelas/detail/:id', (req, res) => {
    const kelasId = req.params.id;
    // Fetch class details from the database using kelasId
    // Then return the data
    res.json({ message: "Class details for " + kelasId });
});



app.get('/api/tahun-ajaran', async (req, res) => {
    try {
        const query = 'SELECT * FROM tahun_ajaran'; // Pastikan tabel 'siswa' ada
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data siswa ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/tahun-ajaran', async (req, res) => {
    const { nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai } = req.body;

    // Validasi input (pastikan semua data ada)
    if (!nama_tahun_ajaran || !semester || !tanggal_mulai || !tanggal_selesai) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    // Query SQL untuk menyimpan data tahun ajaran baru
    const query = `
        INSERT INTO tahun_ajaran (nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai)
        VALUES (?, ?, ?, ?)
    `;

    try {
        await db.query(query, [nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai]);
        res.status(201).json({ message: 'Tahun Ajaran berhasil ditambahkan.' });
    } catch (err) {
        console.error('Error inserting tahun ajaran:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan tahun ajaran.' });
    }
});

app.get('/api/tahun-ajaran/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query untuk mendapatkan Tahun Ajaran berdasarkan ID
        const query = 'SELECT * FROM tahun_ajaran WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        // Jika data ditemukan, kirimkan sebagai response
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Tahun Ajaran tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Tahun Ajaran:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.put('/api/tahun-ajaran/:id', async (req, res) => {
    const { id } = req.params;
    const { nama_tahun_ajaran, tanggal_mulai, tanggal_selesai, semester } = req.body;

    try {
        const [result] = await db.execute(
            `UPDATE tahun_ajaran 
             SET nama_tahun_ajaran = ?, tanggal_mulai = ?, tanggal_selesai = ?, semester = ? 
             WHERE id = ?`,
            [nama_tahun_ajaran, tanggal_mulai, tanggal_selesai, semester, id]
        );
        console.log('Data untuk update:', { nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai, id });
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Tahun Ajaran berhasil diperbarui' });
        } else {
            res.status(404).json({ message: 'Tahun Ajaran tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error memperbarui Tahun Ajaran:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});


app.delete('/api/tahun-ajaran/:id', async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    try {
        const deleteQuery = 'DELETE FROM tahun_ajaran WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Tahun ajaran berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Tahun ajaran tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting Tahun Ajaran:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/mading', upload.single('image'), async (req, res) => {
    const { judul, konten, tanggal } = req.body;
    const nip = req.session.user?.id;
    const imagePath = req.file ? '/uploads/' + req.file.filename : null; // Menyimpan path gambar jika ada

    console.log('NIP:', nip);
    console.log('Image Path:', imagePath);

    if (!nip) return res.status(401).json({ message: 'Unauthorized' });
    if (!judul || !konten || !tanggal) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        await db.query(
            'INSERT INTO mading (judul, konten, tanggal, nip, foto) VALUES (?, ?, ?, ?, ?)',
            [judul, konten, tanggal, nip, imagePath] // Menambahkan path gambar ke query
        );
        res.status(201).json({ message: 'Mading added successfully' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to add mading.' });
    }
});

// Get all mading
app.get('/api/mading', async (req, res) => {
    try {
        const searchQuery = req.query.search || ''; // Ambil query pencarian
        let query = 'SELECT * FROM mading';

        // Tambahkan kondisi WHERE hanya jika ada parameter pencarian
        if (searchQuery) {
            query += ' WHERE judul LIKE ?';
        }

        // Tambahkan ORDER BY untuk mengurutkan berdasarkan tanggal terbaru
        query += ' ORDER BY tanggal DESC';

        // Jalankan query dengan aman menggunakan parameterisasi
        const [rows] = await db.query(query, searchQuery ? [`%${searchQuery}%`] : []);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data mading ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data mading:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/mading/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query untuk mendapatkan Tahun Ajaran berdasarkan ID
        const query = 'SELECT * FROM mading WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        // Jika data ditemukan, kirimkan sebagai response
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Mading tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Mading:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.delete('/api/mading/:id', async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    try {
        // Query untuk menghapus data dari tabel tahun_ajaran
        const deleteQuery = 'DELETE FROM mading WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);

        // Cek apakah data berhasil dihapus
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Pengumuman berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Pengumuman ajaran tidak ditemukan.' });
        }
    } catch (error) {
        // Log error untuk debugging
        console.error("Error deleting Pengumumann:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// Rute untuk mengambil detail mading berdasarkan ID
app.get('/api/mading-detail', async (req, res) => {
    try {
      const { id } = req.query; 
      if (!id) {
        return res.status(400).json({ message: "ID tidak diberikan" });
      }
  
      const query = 'SELECT * FROM mading WHERE id = ?';
      const [rows] = await db.query(query, [id]);
  
      if (rows.length > 0) {
        res.status(200).json(rows[0]); 
      } else {
        res.status(404).json({ message: 'Data tidak ditemukan.' });
      }
    } catch (error) {
      console.error('Error saat mengambil detail mading:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

app.get('/api/mading-home', async (req, res) => {
    try {
        const query = 'SELECT * FROM mading ORDER BY tanggal DESC LIMIT 5';
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data mading ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data mading untuk Home:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/save-attendance', async (req, res) => {
    try {
        const { id_kelas, date } = req.body;

        console.log("Data yang diterima:", { id_kelas, date });

        if (!id_kelas || !date) {
            return res.status(400).json({ message: 'Missing required fields: id_kelas or date' });
        }

        // Gunakan ON DUPLICATE KEY UPDATE untuk menangani insert/update
        const query = `
            INSERT INTO attendance (id_kelas, date)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE date = VALUES(date)
        `;

        await db.query(query, [id_kelas, date]);

        // Ambil ID setelah operasi insert/update
        const [rows] = await db.query('SELECT id FROM attendance WHERE id_kelas = ? AND date = ?', [id_kelas, date]);

        if (rows.length > 0) {
            const existingId = rows[0].id;
            console.log("ID yang dihasilkan atau diperbarui:", existingId);
            return res.json({ id: existingId });
        } else {
            return res.status(400).json({ message: 'Failed to retrieve attendance ID' });
        }
    } catch (error) {
        console.error("Error in save-attendance:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint untuk menyimpan detail absensi (tabel attendanceDetails)
app.post('/api/save-attendance-details', async (req, res) => {
    try {
        const { id_kelas, date, absensiData } = req.body;

        if (!id_kelas || !date || !Array.isArray(absensiData)) {
            return res.status(400).json({ message: 'Missing or invalid data' });
        }

        // Cek apakah absensi untuk id_kelas dan tanggal ini sudah ada
        const [existingAttendance] = await db.query(
            'SELECT id FROM attendance WHERE id_kelas = ? AND date = ?',
            [id_kelas, date]
        );

        let attendanceId;
        if (existingAttendance.length > 0) {
            // Jika ada, gunakan ID absensi yang sudah ada
            attendanceId = existingAttendance[0].id;
        } else {
            // Jika belum ada, buat data absensi baru
            const [insertResult] = await db.query(
                'INSERT INTO attendance (id_kelas, date) VALUES (?, ?)',
                [id_kelas, date]
            );
            attendanceId = insertResult.insertId;
        }

        // Masukkan atau perbarui detail absensi
        const values = absensiData.map(item => [attendanceId, item.nisn, item.status]);
        await db.query(
            `
            INSERT INTO attendancedetails (id_attendance, nisn, status)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                status = VALUES(status)
            `,
            [values]
        );

        res.json({
            message: 'Attendance details processed successfully',
        });
    } catch (error) {
        console.error('Error processing attendance details:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

app.put('/api/update-attendance-details', async (req, res) => {
    const { kelasId, date } = req.query;
    const { absensiData } = req.body;

    // Validasi parameter
    if (!kelasId || !date || !Array.isArray(absensiData) || absensiData.length === 0) {
        return res.status(400).json({ message: 'kelasId, date, and absensiData are required.' });
    }

    try {
        // Ambil attendanceId berdasarkan kelasId dan date
        const absensiId = await getAttendanceIdByClassAndDate(kelasId, date);

        // Update status absensi
        const result = await updateStatusAbsensi(absensiId, absensiData);

        if (result.success) {
            return res.json(result);  // Mengirimkan hasil update
        } else {
            return res.status(500).json({
                message: result.message || 'Error updating attendance status',
                error: result.error || 'Unknown error',
            });
        }
    } catch (error) {
        console.error('Error while updating attendance:', error);
        return res.status(500).json({
            message: 'Failed to update attendance status',
            error: error.message,
        });
    }
});

// Endpoint untuk mengambil data absensi (tabel attendanceDetails) dari data-absensi
app.get('/api/attendance-details', async (req, res) => {
    try {
        const { kelasId, date } = req.query;

        // Validasi input
        if (!kelasId || !date) {
            return res.status(400).json({ message: 'ID Kelas atau Tanggal tidak valid' });
        }

        console.log("Mengambil data absensi untuk:", { kelasId, date });

        // Cek data absensi
        const [results] = await db.query(
            `
            SELECT ad.id_attendance, ad.nisn, ad.status, s.nama_siswa
            FROM attendanceDetails AS ad
            INNER JOIN attendance AS a ON ad.id_attendance = a.id
            LEFT JOIN siswa AS s ON s.nisn = ad.nisn
            WHERE a.id_kelas = ? AND a.date = ?;
            `,
            [kelasId, date]
        );

        if (results.length > 0) {
            console.log("Data absensi ditemukan:", results);
            return res.json({ attendanceDetails: results });
        }

        // Jika absensi tidak ditemukan, ambil data siswa saja
        console.log("Data absensi tidak ditemukan, mengambil data siswa.");
        const [siswaResults] = await db.query(
            `
            SELECT s.nisn, s.nama_siswa
            FROM siswa AS s
            WHERE s.id_kelas = ?;
            `,
            [kelasId]
        );

        return res.json({
            attendanceDetails: siswaResults.map(siswa => ({
                id_attendance: null,
                nisn: siswa.nisn,
                nama_siswa: siswa.nama_siswa,
                status: null, // Status kosong karena belum ada absensi
            }))
        });
    } catch (error) {
        console.error("Error fetching attendance details:", error);
        return res.status(500).json({ message: 'Gagal memuat data absensi', error });
    }
});

app.put('/api/update-attendance-details', async (req, res) => {
    const { absensiId, absensiData } = req.body;

    try {
        // Call function to update attendance status
        const result = await updateStatusAbsensi(absensiId, absensiData);

        if (result.success) {
            return res.json(result);  // Return success response
        } else {
            return res.status(500).json({
                message: result.message || 'Error updating attendance status',
                error: result.error || 'Unknown error'
            });
        }
    } catch (error) {
        // Catch any errors that occur during the async operation
        console.error("Error while updating attendance:", error);
        return res.status(500).json({
            message: 'Failed to update attendance status',
            error: error.message
        });
    }
});

//route untuk menampilkan absensi per siswa yg login yang sudah guru wali kelas simpan
app.get('/api/attendance-details-siswa', async (req, res) => {
    try {
        const { nisn, date } = req.query;

        if (!nisn) {
            return res.status(400).json({ message: 'NISN tidak valid' });
        }

        console.log("Mengambil data absensi untuk:", { nisn, date });

        let query = `
            SELECT ad.id_attendance, ad.nisn, ad.status, s.nama_siswa, a.date
            FROM attendanceDetails AS ad
            INNER JOIN attendance AS a ON ad.id_attendance = a.id
            LEFT JOIN siswa AS s ON s.nisn = ad.nisn
            WHERE ad.nisn = ?
        `;

        const params = [nisn];

        // Tambahkan filter tanggal jika parameter `date` disediakan
        if (date) {
            query += ' AND a.date = ?';
            params.push(date);
        }

        query += ' ORDER BY a.date DESC, ad.id DESC';

        const [results] = await db.query(query, params);

        if (results.length > 0) {
            // Format tanggal menjadi DD-MM-YYYY
            const formattedResults = results.map(record => {
                const rawDate = new Date(record.date);
                const formattedDate = [
                    String(rawDate.getDate()).padStart(2, '0'),
                    String(rawDate.getMonth() + 1).padStart(2, '0'),
                    rawDate.getFullYear()
                ].join('-');

                return {
                    ...record,
                    date: formattedDate,
                };
            });

            console.log("Data absensi ditemukan:", formattedResults);
            return res.json({ attendanceDetails: formattedResults });
        } else {
            console.log("Tidak ada data absensi ditemukan.");
            return res.json({ attendanceDetails: [] });
        }
    } catch (error) {
        console.error("Error fetching attendance details:", error);
        return res.status(500).json({ message: 'Gagal memuat data absensi', error });
    }
});

//berada di file lupapassword.html
app.post('/api/reset-password/:role', async (req, res) => {
    const { role } = req.params;
    const { email } = req.body;
  
    if (role !== 'pegawai' && role !== 'siswa') {
      return res.status(400).json({ success: false, message: 'Role tidak valid' });
    }

    if (!email || !role) {
    return res.status(400).json({ success: false, message: 'Email and Role are required' });
  }
  
    const table = role === 'pegawai' ? 'pegawai' : 'siswa';
    const nameColumn = role === 'pegawai' ? 'nama_pegawai' : 'nama_siswa';
  
    try {
      const [results] = await db.execute(`SELECT ${nameColumn} AS name FROM ${table} WHERE email = ?`, [email]);
  
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: 'Email tidak ditemukan' });
      }
  
      const user = results[0];
  
      const token = crypto.randomBytes(20).toString('hex');

      const resetLink = `http://localhost:3000/reset-password/${role}?email=${email}&token=${token}`;
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password',
        text: `Halo ${user.name}, klik link berikut untuk mereset password Anda: ${resetLink}`,
      };
  
      await transporter.sendMail(mailOptions);
  
      return res.json({
        success: true,
        message: `Link reset password telah dikirim ke email ${email} (${user.name})`,
        name: user.name,
        email: email,
      });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  });

  // endpoint untuk menampilkan buat kata sandi baru
  // berada di di file sandi.html
  app.get('/reset-password/:role', async (req, res) => {
    const { role } = req.params;
    const { email } = req.query;
    console.log(`Role: ${role}, Email: ${email}`);
  
    if (!email) {
      return res.status(400).send('Email is required');
    }
  
    const table = role === 'pegawai' ? 'pegawai' : 'siswa';
    const nameColumn = role === 'pegawai' ? 'nama_pegawai' : 'nama_siswa';
  
    try {
      const [results] = await db.execute(`SELECT ${nameColumn} AS name FROM ${table} WHERE email = ?`, [email]);
  
      if (results.length === 0) {
        return res.status(400).send('Email not found');
      }
  
      const user = results[0];
  
      const filePath = path.join(__dirname, 'frontend', 'html', 'sandi.html');
  
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return res.status(500).send('Error loading page');
        }
  
        let htmlContent = data;
        htmlContent = htmlContent
          .replace('<%= role %>', role)
          .replace('<%= email %>', email)
          .replace('<%= name %>', user.name);
  
        res.send(htmlContent); 
      });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).send('Error occurred while processing the request');
    }
  });  

  // endpoint untuk mengubah/update password setelah button reset password di klik
  // berada di file sandi.html
  app.put('/reset-password/:role', async (req, res) => {
    const { role } = req.params;
    const { email, newPassword, confirmPassword } = req.body;
  
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Email, New Password, and Confirm Password are required' });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Password and confirm password must match' });
    }
  
    try {
      // tergantung dari role masing-masing yang membedakan itu yaitu email
      const table = role === 'pegawai' ? 'pegawai' : 'siswa';
  
      // unutk mengupdate password yg membedakan itu email nya, makanya bisa di update
      const updateResult = await db.execute(
        `UPDATE ${table} SET password = ?, last_password_update = NOW() WHERE email = ?`,
        [newPassword, email]
      );
  
      console.log('updateResult:', updateResult);
  
      if (updateResult.changedRows > 0) {
        return res.json({ success: true, message: 'Password berhasil diubah' });
      } else {
        return res.status(400).json({ success: false, message: 'Email tidak ditemukan' });
      }
      
    } catch (error) {
      console.error('Error during password update:', error);
      return res.status(500).json({ success: false, message: 'An error occurred during the password update' });
    }
  });   

app.post('/api/mata-pelajaran', async (req, res) => {
    const { id, nama_pelajaran, nip, id_tahun_ajaran, id_kelas } = req.body;

    console.log('Received data:', req.body);

    // Cek apakah sudah ada mata pelajaran dengan nama_pelajaran di kelas yang sama dan tahun ajaran yang sama
    const checkQuery = `
        SELECT mp.*, p.nama_pegawai FROM mata_pelajaran mp
        JOIN pegawai p ON mp.nip = p.nip
        WHERE mp.nama_mata_pelajaran = ? 
        AND mp.id_kelas = ? 
        AND mp.id_tahun_ajaran = ? 
        AND mp.nip != ? 
    `;

    try {
        // Cek apakah mata pelajaran sudah ada di kelas dan tahun ajaran yang sama
        const [existingMatpel] = await db.query(checkQuery, [nama_pelajaran, id_kelas, id_tahun_ajaran, nip]);

        if (existingMatpel.length > 0) {
            const existingTeacherName = existingMatpel[0].nama_pegawai;  // Nama guru yang sudah ada
            return res.status(400).json({
                success: false,
                message: `Mata pelajaran ini sudah diajarkan oleh guru ${existingTeacherName} di kelas ini.`
            });
        }

        // Jika tidak ada duplikasi, lanjutkan untuk memasukkan data
        const query = `
            INSERT INTO mata_pelajaran (id, nama_mata_pelajaran, nip, id_tahun_ajaran, id_kelas) 
            VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(query, [id, nama_pelajaran, nip, id_tahun_ajaran, id_kelas]);
        console.log('Data successfully inserted');
        return res.status(201).json({ success: true, message: 'Mata Pelajaran berhasil ditambahkan' });

    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
    }
});

app.get('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM  mata_pelajaran WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Matpel tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Matpel:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/mapel', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran || null;
        const kelasId = req.query.kelas_id || null;

        const nipGuru = req.session.user?.id; // Ambil NIP dari session pengguna

        if (!nipGuru) {
            return res.status(400).json({ error: 'NIP pengguna tidak ditemukan dalam session' });
        }

        // Menyusun query
        let query = `
            SELECT mp.id, mp.nama_mata_pelajaran, mp.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai
            FROM mata_pelajaran mp
            LEFT JOIN pegawai p ON mp.nip = p.nip
            WHERE mp.nip = ?
        `;

        const params = [nipGuru];

        if (filterTahunAjaran) {
            query += ' AND mp.id_tahun_ajaran = ?';
            params.push(filterTahunAjaran);
        }

        if (kelasId) {
            query += ' AND mp.id_kelas = ?';
            params.push(kelasId);
        }

        const [rows] = await db.execute(query, params);
        res.json(rows); // Kirim data mata pelajaran yang sudah difilter
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

app.get('/api/mata-pelajaran', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran || null;
        const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : null;

        let query = `
        SELECT mp.id, mp.nama_mata_pelajaran, mp.nip, mp.id_kelas, 
            IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai,
            IFNULL(k.nama_kelas, 'Nama Kelas Tidak Ada') AS nama_kelas
        FROM mata_pelajaran mp
        LEFT JOIN pegawai p ON mp.nip = p.nip
        LEFT JOIN kelas k ON mp.id_kelas = k.id  -- Misalnya id_kelas menghubungkan dengan id di tabel kelas
        `;

        const params = [];
        const conditions = [];

        if (filterTahunAjaran) {
            conditions.push(`mp.id_tahun_ajaran = ?`);
            params.push(filterTahunAjaran);
        }

        if (search) {
            conditions.push(`LOWER(mp.nama_mata_pelajaran) LIKE ? OR LOWER(mp.nip) LIKE ? OR mp.id = ?`);
            params.push(search, search, parseInt(search) || 0);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

app.put('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    const { nama_pelajaran, id_tahun_ajaran, nip } = req.body; // Ambil data dari body request

    // Validasi data input
    if (!nama_pelajaran || !id_tahun_ajaran || !nip) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
        // Query untuk update data
        const [result] = await db.execute(
            `UPDATE mata_pelajaran 
             SET nama_mata_pelajaran = ?, id_tahun_ajaran = ?, nip = ? 
             WHERE id = ?`,
            [nama_pelajaran, id_tahun_ajaran, nip, id]
        );

        // Cek apakah data berhasil diperbarui
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Mata Pelajaran berhasil diperbarui' });
        } else {
            res.status(404).json({ error: 'Mata Pelajaran tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error saat memperbarui data mata pelajaran:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

app.delete('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params;
    console.log('ID yang diterima API:', id);

    if (!id) {
        return res.status(400).json({ message: 'ID tidak valid.' });
    }

    try {
        const deleteQuery = 'DELETE FROM mata_pelajaran WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Mata Pelajaran berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Mata Pelajaran tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting Mata Pelajaran:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/siswa/kelas/:kelasId', async (req, res) => {
    try {
        const { kelasId } = req.params; // Ambil kelasId dari URL

        if (!kelasId) {
            return res.status(400).json({ message: 'Parameter kelas diperlukan.' });
        }

        // Query untuk mencari siswa berdasarkan kelas
        const query = 'SELECT * FROM siswa WHERE id_kelas = ?';
        const [rows] = await db.query(query, [kelasId]); // Gunakan kelasId yang diambil dari URL

        if (rows.length > 0) {
            res.status(200).json(rows); // Kirim data siswa jika ditemukan
        } else {
            res.status(404).json(`{ message: Tidak ada data siswa ditemukan untuk kelas ${kelasId}. }`);
        }
    } catch (error) {
        console.error('Error mengambil data siswa berdasarkan kelas:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/kelas-by-tahun-ajaran', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran_id || null;

        // Mengambil NIP dari session pengguna yang sedang login
        const nipGuru = req.session.user?.id; // Mengambil NIP dari session

        if (!nipGuru) {
            return res.status(403).json({ error: 'Akses ditolak: NIP pengguna tidak ditemukan dalam session' });
        }

        // Menyusun query untuk mengambil kelas berdasarkan nipGuru dan tahun ajaran
        let query = `
            SELECT DISTINCT k.id, k.nama_kelas, k.tingkatan
            FROM kelas k
            JOIN mata_pelajaran mp ON k.id = mp.id_kelas
            WHERE mp.nip = ? 
        `;

        const params = [nipGuru];

        if (filterTahunAjaran) {
            query += ' AND mp.id_tahun_ajaran = ?';  // Only add this part if filterTahunAjaran exists
            params.push(filterTahunAjaran);
        }

        const [rows] = await db.execute(query, params);
        res.json(rows); // Mengirimkan daftar kelas yang sesuai dengan NIP pengguna dan filter lainnya
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

// Endpoint untuk mengambil data mata pelajaran berdasarkan tahun ajaran
app.get('/api/data-mapel', async (req, res) => {
    const { tahun_ajaran_id } = req.query;

    try {
        let query = 'SELECT * FROM mata_pelajaran';
        const params = [];

        // Jika tahun ajaran dipilih, tambahkan kondisi WHERE
        if (tahun_ajaran_id) {
            query += ' WHERE id_tahun_ajaran = ?';
            params.push(tahun_ajaran_id);
        }

        const [rows] = await db.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan.' });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error saat mengambil data mata pelajaran:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});


app.get('/api/get-nilai/:nisn', async (req, res) => {
    const { nisn } = req.params;
    const { jenisNilai, tahunAjaran, kelas, mapel } = req.query;


    if (!tahunAjaran || !kelas || !mapel || !jenisNilai) {
        return res.status(400).json({ error: 'Parameter tidak lengkap' });
    }

    const query = `
        SELECT nisn, grade AS nilai
        FROM grades
        WHERE nisn = ? AND id_tahun_ajaran = ? AND id_kelas = ? AND id_matpel = ? AND gradesType = ?
    `;

    try {
        const [results] = await db.query(query, [nisn, tahunAjaran, kelas, mapel, jenisNilai]);
        res.json(results);
    } catch (error) {
        console.error('Error pada endpoint /api/get-nilai:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

// Misal menggunakan Express.js
app.get('/api/dataMapel/:nip', async (req, res) => {
    const { nip } = req.params;  // Mengambil nip dari path parameter
    const { tahun_ajaran_id } = req.query;  // Mendapatkan tahun ajaran dari query parameter

    if (!tahun_ajaran_id || !nip) {
        return res.status(400).json({ message: 'Tahun ajaran atau NIP tidak valid' });
    }

    try {
        // Query untuk mendapatkan mata pelajaran berdasarkan nip dan tahun ajaran
        const query = `
            SELECT * FROM mapel
            WHERE nip = ? AND id_tahun_ajaran = ?
        `;
        const [rows] = await db.execute(query, [nip, tahun_ajaran_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tidak ada mata pelajaran ditemukan' });
        }

        res.json(rows);  // Mengirimkan data mata pelajaran
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
});

app.get('/api/grades/:kelasId/:matpelId', async (req, res) => {
    const { kelasId, matpelId } = req.params;

    if (!kelasId || !matpelId) {
        return res.status(400).json({ error: 'Kelas ID dan Mata Pelajaran ID harus disertakan.' });
    }

    try {
        // Query data siswa berdasarkan kelas
        const [students] = await db.execute(`
            SELECT nisn, nama_siswa
            FROM siswa
            WHERE id_kelas = ?
        `, [kelasId]);

        if (!students.length) {
            return res.status(404).json({ error: 'Tidak ada siswa ditemukan untuk kelas ini.' });
        }

        // Query nilai siswa berdasarkan kelas dan mata pelajaran
        const [grades] = await db.execute(`
            SELECT g.nisn, g.gradesType, g.grade, g.gradeStatus
            FROM grades g
            WHERE g.id_kelas = ? AND g.id_matpel = ? AND g.gradesType IN ('uts', 'uas', 'tugas');
        `, [kelasId, matpelId]);

        // Gabungkan data nilai ke data siswa
        const gradesMap = grades.reduce((acc, grade) => {
            if (!acc[grade.nisn]) acc[grade.nisn] = { uts: 0, uas: 0, tugas: 0, gradeStatus: '' };

            if (grade.gradesType.toLowerCase() === 'uts') {
                acc[grade.nisn].uts = grade.grade ? Number(grade.grade) : 0;
            } else if (grade.gradesType.toLowerCase() === 'uas') {
                acc[grade.nisn].uas = grade.grade ? Number(grade.grade) : 0;
            } else if (grade.gradesType.toLowerCase() === 'tugas') {
                acc[grade.nisn].tugas = grade.grade ? Number(grade.grade) : 0;
            }

            if (grade.gradeStatus) acc[grade.nisn].gradeStatus = grade.gradeStatus;

            return acc;
        }, {});

        // Gabungkan data siswa dengan data nilai
        const results = students.map(student => {
            const nilai = gradesMap[student.nisn] || { uts: 0, uas: 0, tugas: 0, gradeStatus: '' };
            const nilaiAkhir = parseFloat(((nilai.uts * 0.4) + (nilai.uas * 0.4) + (nilai.tugas * 0.2)).toFixed(2));
            return {
                nisn: student.nisn,
                nama_siswa: student.nama_siswa,
                uts: nilai.uts,
                uas: nilai.uas,
                tugas: nilai.tugas,
                nilai_akhir: Number(nilaiAkhir) || 0,
                gradeStatus: nilai.gradeStatus,
            };
        });

        res.json(results);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ error: 'Gagal memuat data nilai' });
    }
});

app.get('/api/nilai-akhir', async (req, res) => {
    const { nisn, jenisNilai, tahunAjaran, kelas, mapel } = req.query;

    if (!nisn || !jenisNilai || !tahunAjaran || !kelas || !mapel) {
        return res.status(400).json({
            error: "Semua parameter (nisn, jenisNilai, tahunAjaran, kelas, mapel) harus disertakan.",
        });
    }

    try {
        // Ambil ID Kelas dan Mata Pelajaran berdasarkan nama
        const getKelasIdQuery = 'SELECT id FROM kelas WHERE nama_kelas = ?';
        const getMapelIdQuery = 'SELECT id FROM mata_pelajaran WHERE nama_mata_pelajaran = ?';
        
        const [kelasResults] = await db.execute(getKelasIdQuery, [kelas]);
        const [mapelResults] = await db.execute(getMapelIdQuery, [mapel]);

        const kelasId = kelasResults[0]?.id;
        const matpelId = mapelResults[0]?.id;

        if (!kelasId || !matpelId) {
            return res.status(400).json({ error: 'Kelas atau Mata Pelajaran tidak valid.' });
        }

        const query = `
            SELECT g.nisn, s.nama_siswa, g.gradesType, g.grade, g.gradeStatus, 
            FROM grades g
            JOIN siswa s ON g.nisn = s.nisn
            WHERE g.id_kelas = ? AND g.id_matpel = ? AND g.gradesType IN ('uts', 'uas', 'tugas');
        `;
        
        const [results] = await db.execute(query, [kelasId, matpelId]);
        
        // Kelompokkan data berdasarkan NISN
        const nilaiAkhir = results.reduce((acc, row) => {
            const { nisn, nama_siswa, gradesType, grade, gradeStatus  } = row;

            if (!acc[nisn]) {
                acc[nisn] = {
                    nisn,
                    nama_siswa,
                    uts: 0,
                    uas: 0,
                    tugas: 0,
                    nilai_akhir: 0,
                    gradeStatus: gradeStatus || '',
                    
                };
            }

            if (gradesType.toLowerCase() === 'uts') {
                acc[nisn].uts = grade ? Number(grade) : 0;
            } else if (gradesType.toLowerCase() === 'uas') {
                acc[nisn].uas = grade ? Number(grade) : 0;
            } else if (gradesType.toLowerCase() === 'tugas') {
                acc[nisn].tugas = grade ? Number(grade) : 0;
            }

            if (gradeStatus) acc[nisn].gradeStatus = gradeStatus;

            return acc;
        }, {});

        if (Object.keys(nilaiAkhir).length === 0) {
            return res.status(404).json({ error: 'Tidak ada data nilai yang ditemukan.' });
        }

        // Hitung nilai akhir
        const finalResults = Object.values(nilaiAkhir).map(siswa => {
            if (siswa.uts !== 0 && siswa.uas !== 0 && siswa.tugas !== 0) {
                siswa.nilai_akhir = ((siswa.uts * 0.4) + (siswa.uas * 0.4) + (siswa.tugas * 0.2)).toFixed(1);
            } else {
                siswa.nilai_akhir = 0; 
            }
            return siswa;
        });

        res.json(finalResults);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: 'Gagal memuat data nilai' });
    }
});

app.get('/api/mapel/:idKelas', async (req, res) => {
    const { idKelas } = req.params;

    // Query SQL untuk mengambil mata pelajaran berdasarkan id_kelas
    const query = 'SELECT nama_mata_pelajaran, id FROM mata_pelajaran WHERE id_kelas = ?';

    try {
        // Menjalankan query dan menunggu hasilnya
        const [results, fields] = await db.execute(query, [idKelas]);

        // Jika data tidak ditemukan
        if (results.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan untuk kelas ini' });
        }

        res.json(results);

    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

app.post('/api/update-grade-status', async (req, res) => {
    const { nisn, status, mapel_id } = req.body;

    console.log({
        nisn: nisn,
        status: status,
        mapel_id: mapel_id
    });

    if (!nisn || !status || !mapel_id) {
        return res.status(400).json({ message: 'Data tidak lengkap. Pastikan nisn, status, dan mapel_id disertakan.' });
    }
    
    try {
        const query = `
            UPDATE grades
            SET gradeStatus = ?
            WHERE nisn = ? AND id_matpel = ?
        `;

        const [result] = await db.execute(query, [status, nisn, mapel_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data tidak ditemukan atau tidak ada perubahan yang dilakukan.' });
        }

        return res.status(200).json({ message: 'Status berhasil diperbarui.' });
    } catch (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Gagal memperbarui status. Silakan coba lagi.' });
    }
});

app.get('/api/get-grades', async (req, res) => {
    const { nisn, id_matpel } = req.query;

    // Validasi query parameters
    if (!nisn || !id_matpel) {
        return res.status(400).json({ error: 'Parameter nisn dan id_matpel diperlukan dan harus berupa angka.' });
    }

    const query = `
        SELECT g.gradeStatus, 
        FROM grades g
        WHERE g.nisn = ? AND g.id_matpel = ?;
    `;

    try {
        const [results] = await db.execute(query, [nisn, id_matpel]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Data status dan catatan tidak ditemukan.' });
        }

        let status = 'Tidak Diterima'; // Default status jika tidak ada status "Diterima"

        // Cek apakah ada status "Diterima" atau "Lulus"
        for (let row of results) {
            if (row.gradeStatus === 'Diterima' || row.gradeStatus === 'Lulus') {
                status = row.gradeStatus;  // Pilih status pertama yang Diterima atau Lulus
                break;  // Keluar setelah menemukan status Diterima atau Lulus
            }
        }

        // Jika status masih "Tidak Diterima", ambil status yang pertama
        if (status === 'Tidak Diterima' && results.length > 0) {
            status = results[0].gradeStatus;
        }

        // Hasil akhir
        res.json({
            nisn: nisn,
            status: status,
        });

    } catch (err) {
        console.error('Error saat mengeksekusi query:', err);
        res.status(500).json({ error: 'Gagal memuat data status dan catatan.' });
    }
});


app.get('/api/grades/:tahunAjaran', async (req, res) => {
    const { tahunAjaran } = req.params;
    const nisn = req.session.user?.id; // Pastikan ini mengambil NISN dari sesi pengguna

    if (!tahunAjaran) {
        return res.status(400).json({ error: 'Tahun ajaran harus disertakan.' });
    }

    if (!nisn) {
        return res.status(401).json({ error: 'Anda belum login.' });
    }

    try {
        // Ambil kelas siswa berdasarkan NISN
        const [kelasResults] = await db.execute(
            `SELECT kelas.id AS id_kelas 
             FROM siswa 
             JOIN kelas ON siswa.id_kelas = kelas.id 
             WHERE siswa.nisn = ?`,
            [nisn]
        );

        if (kelasResults.length === 0) {
            return res.status(404).json({ error: 'Data kelas tidak ditemukan untuk siswa ini.' });
        }

        const kelasId = kelasResults[0].id_kelas;

        // Query untuk mengambil mata pelajaran sesuai kelas dan tahun ajaran
        const query = `
            SELECT 
                m.nama_mata_pelajaran AS matpel, 
                g.gradesType, 
                g.grade, 
                g.gradeStatus
            FROM mata_pelajaran m
            LEFT JOIN grades g 
                ON m.id = g.id_matpel 
                AND g.id_tahun_ajaran = ? 
                AND g.nisn = ?
            WHERE m.id_kelas = ?;
        `;

        const [results] = await db.execute(query, [tahunAjaran, nisn, kelasId]);

        const nilaiAkhir = results.reduce((acc, row) => {
            const { matpel, gradesType, grade, gradeStatus } = row;

            if (!acc[matpel]) {
                acc[matpel] = {
                    matpel,
                    uts: '-',
                    uas: '-',
                    tugas: '-',
                    nilai_akhir: '-',
                };
            }

            if (gradesType?.toLowerCase() === 'uts') {
                acc[matpel].uts = grade !== null ? Number(grade) : '-';
            } else if (gradesType?.toLowerCase() === 'uas') {
                acc[matpel].uas = grade !== null ? Number(grade) : '-';
            } else if (gradesType?.toLowerCase() === 'tugas') {
                acc[matpel].tugas = grade !== null ? Number(grade) : '-';
            }

            if (gradeStatus?.toLowerCase() === 'setuju') {
                const { uts, uas, tugas } = acc[matpel];
                if (uts !== '-' && uas !== '-' && tugas !== '-') {
                    acc[matpel].nilai_akhir = ((uts * 0.4) + (uas * 0.4) + (tugas * 0.2)).toFixed(1);
                }
            }

            return acc;
        }, {});

        res.json(Object.values(nilaiAkhir));
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: 'Gagal memuat data nilai' });
    }
});

app.get('/api/grades', async (req, res) => {
    const { tahunAjaran, kelasId, matpelId, jenisNilai } = req.query;
   
    try {
        const [students] = await db.execute(`
            SELECT nisn, nama_siswa
            FROM siswa
            WHERE id_kelas = ?
        `, [kelasId]);

        if (!students.length) {
            return res.status(404).json({ error: 'Tidak ada siswa ditemukan untuk kelas ini.' });
        }

        let gradesQuery = `
            SELECT g.nisn, g.gradesType, g.grade, g.gradeStatus
            FROM grades g
            WHERE g.id_kelas = ? AND g.id_matpel = ?`;
        const queryParams = [kelasId, matpelId];

        // meambahkan filter untuk tahun ajaran jika ada
        if (tahunAjaran) {
            gradesQuery += ` AND g.id_tahun_ajaran = ?`;
            queryParams.push(tahunAjaran);
        }

        // menambahkan filter untuk jenis nilai jika ada
        if (jenisNilai) {
            const validGrades = ['uts', 'uas', 'tugas', 'nilai-akhir'];
            if (!validGrades.includes(jenisNilai.toLowerCase())) {
                return res.status(400).json({ error: 'Jenis nilai yang valid: uts, uas, tugas, nilai-akhir' });
            }
            if (jenisNilai.toLowerCase() !== 'nilai-akhir') {
                gradesQuery += ` AND g.gradesType = ?`;
                queryParams.push(jenisNilai.toLowerCase());
            }
        }

        const [grades] = await db.execute(gradesQuery, queryParams);

        // menggabungkan data nilai ke data siswa
        const gradesMap = grades.reduce((acc, grade) => {
            if (!acc[grade.nisn]) acc[grade.nisn] = {};
            acc[grade.nisn][grade.gradesType.toLowerCase()] = grade.grade ? Number(grade.grade) : null;
            acc[grade.nisn].gradeStatus = grade.gradeStatus || '';
            return acc;
        }, {});

        const results = students.map(student => {
            const siswa = {
                nisn: student.nisn,
                nama_siswa: student.nama_siswa,
                uts: gradesMap[student.nisn]?.uts || null,
                uas: gradesMap[student.nisn]?.uas || null,
                tugas: gradesMap[student.nisn]?.tugas || null,
                nilai_akhir: null,
                gradeStatus: gradesMap[student.nisn]?.gradeStatus || '',
            };

            if (siswa.uts !== null && siswa.uas !== null && siswa.tugas !== null) {
                siswa.nilai_akhir = Math.round((siswa.uts + siswa.uas + siswa.tugas) / 3);
            }
            return siswa;
        });

        res.json(results);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/simpan-nilai', async (req, res) => {
    const gradesData = req.body;  // Array berisi data nilai yang diterima dari frontend
    const nip = req.session.user?.id; 

    if (!nip) {
        return res.status(401).json({ message: 'User tidak terautentikasi.' });
    }

    if (!Array.isArray(gradesData) || gradesData.length === 0) {
        return res.status(400).json({ message: 'Tidak ada data nilai yang dikirim.' });
    }

    try {
        for (const gradeData of gradesData) {
            const { nisn, grade, tahunAjaran, kelasId, matpelId, jenisNilai } = gradeData;

            // mengecek apakah nilai sudah ada untuk siswa tersebut
            const checkQuery = `
                SELECT * FROM grades
                WHERE id_tahun_ajaran = ? AND id_kelas = ? AND id_matpel = ? AND gradesType = ? AND nisn = ?
            `;
            const [existingData] = await db.query(checkQuery, [tahunAjaran, kelasId, matpelId, jenisNilai, nisn]);

            if (existingData.length > 0) {
                const updateQuery = `
                    UPDATE grades
                    SET grade = ?, nip = ?
                    WHERE id_tahun_ajaran = ? AND id_kelas = ? AND id_matpel = ? AND gradesType = ? AND nisn = ?
                `;
                await db.query(updateQuery, [grade, nip, tahunAjaran, kelasId, matpelId, jenisNilai, nisn]);
            } else {
                // jika nilai belum ada, disimpan sebagai data baru
                const insertQuery = `
                    INSERT INTO grades (id_tahun_ajaran, id_kelas, id_matpel, gradesType, grade, nisn, nip)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await db.query(insertQuery, [tahunAjaran, kelasId, matpelId, jenisNilai, grade, nisn, nip]);
            }
        }

        res.status(200).json({ message: 'Nilai berhasil disimpan.' });
    } catch (error) {
        console.error('Gagal menyimpan nilai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan nilai.' });
    }
});

app.post('/forgot-password', async (req, res) => {
    const { email, nik } = req.body;
    if (!email || !nik) {
        return res.status(400).json({ error: 'Email dan NIK harus diisi.' });
    }
    
    try {
        const [rows] = await db.query('SELECT * FROM pegawai WHERE email = ? AND nik = ?', [email, nik]);

        if (rows.length > 0) {
            res.status(200).json({ message: 'Data valid. Silakan reset password.' });
        } else {
            res.status(404).json({ error: 'Email dan NIK tidak sesuai.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

// endpoint untuk mendapatkan data absensi berdasarkan kelas dan tanggal
app.get('/api/absensi/:kelasId/:tanggal', async (req, res) => {
    const { kelasId, tanggal } = req.params;
  
    if (!kelasId || !tanggal) {
      return res.status(400).json({ message: 'Parameter kelasId dan tanggal wajib diisi.' });
    }
  
    try {
      const query = 'SELECT * FROM attendance WHERE id_kelas = ? AND date = ?';
      const [rows] = await db.execute(query, [kelasId, tanggal]);
  
      if (rows.length > 0) {
        return res.status(200).json(rows); 
      } else {
        return res.status(204).json({ message: "Tidak ada data absensi untuk tanggal ini" });  
      }
    } catch (error) {
      console.error('Error fetching absensi:', error);
      res.status(500).json({ message: "Gagal memuat data absensi" }); 
    }
  });  

app.post('/api/reset-password/:role', async (req, res) => {
    const { role } = req.params;
    const { email } = req.body;
  
    if (role !== 'pegawai' && role !== 'siswa') {
      return res.status(400).json({ success: false, message: 'Role tidak valid' });
    }

    if (!email || !role) {
    return res.status(400).json({ success: false, message: 'Email and Role are required' });
  }
  
    const table = role === 'pegawai' ? 'pegawai' : 'siswa';
    const nameColumn = role === 'pegawai' ? 'nama_pegawai' : 'nama_siswa';
  
    try {
      const [results] = await db.execute(`SELECT ${nameColumn} AS name FROM ${table} WHERE email = ?`, [email]);
  
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: 'Email tidak ditemukan' });
      }
  
      const user = results[0];
  
      const token = crypto.randomBytes(20).toString('hex');

      const resetLink = `http://localhost:3000/reset-password/${role}?email=${email}&token=${token}`;
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password',
        text: `Halo ${user.name}, klik link berikut untuk mereset password Anda: ${resetLink}`,
      };
  
      await transporter.sendMail(mailOptions);
  
      return res.json({
        success: true,
        message: `Link reset password telah dikirim ke email ${email} (${user.name})`,
        name: user.name,
        email: email,
      });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
});

// endpoint untuk menampilkan buat kata sandi baru
// berada di di file sandi.html
app.get('/reset-password/:role', async (req, res) => {
    const { role } = req.params;
    const { email } = req.query;
    console.log(`Role: ${role}, Email: ${email}`);
  
    if (!email) {
      return res.status(400).send('Email is required');
    }
  
    const table = role === 'pegawai' ? 'pegawai' : 'siswa';
    const nameColumn = role === 'pegawai' ? 'nama_pegawai' : 'nama_siswa';
  
    try {
      const [results] = await db.execute(`SELECT ${nameColumn} AS name FROM ${table} WHERE email = ?`, [email]);
  
      if (results.length === 0) {
        return res.status(400).send('Email not found');
      }
  
      const user = results[0];
  
      const filePath = path.join(__dirname, 'frontend', 'html', 'sandi.html');
  
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return res.status(500).send('Error loading page');
        }
  
        let htmlContent = data;
        htmlContent = htmlContent
          .replace('<%= role %>', role)
          .replace('<%= email %>', email)
          .replace('<%= name %>', user.name);
  
        res.send(htmlContent); 
      });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).send('Error occurred while processing the request');
    }
});  

app.put('/reset-password/:role', async (req, res) => {
    const { role } = req.params;
    const { email, newPassword, confirmPassword } = req.body;
  
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Email, New Password, and Confirm Password are required' });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Password and confirm password must match' });
    }
  
    try {
      // tergantung dari role masing-masing yang membedakan itu yaitu email
      const table = role === 'pegawai' ? 'pegawai' : 'siswa';
  
      // untuk mengupdate password yg membedakan itu email nya, makanya bisa di update
      const updateResult = await db.execute(
        `UPDATE ${table} SET password = ?, last_password_update = NOW() WHERE email = ?`,
        [newPassword, email]
      );
  
      console.log('updateResult:', updateResult);
  
      if (updateResult && updateResult.changedRows > 0) {
        return res.json({ success: true, message: 'Password berhasil diubah' });
    } else if (updateResult && updateResult[0] && updateResult[0].affectedRows > 0) {
        console.log('Password successfully updated');
        return res.status(200).json({ success: true, message: 'Password berhasil diubah' });
    } else {
        console.error('Update failed, affectedRows:', updateResult?.[0]?.affectedRows || updateResult?.changedRows);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui password' });
    }
    
      
    } catch (error) {
      console.error('Error during password update:', error);
      return res.status(500).json({ success: false, message: 'An error occurred during the password update' });
    }
});
  
app.put('/reset-password-after-login', async (req, res) => {
    console.log('Request body:', req.body);

    const loginSebagai = req.session.user ? req.session.user.login_sebagai : null;
    const userId = req.session.user ? req.session.user.id : null;
    console.log('loginSebagai:', loginSebagai, 'userId:', userId); 

    const { newPassword, confirmPassword } = req.body;

    // Validasi password
    if (!newPassword || !confirmPassword) {
        console.log('Missing password or confirmPassword');
        return res.status(400).json({ success: false, message: 'New Password and Confirm Password are required' });
    }

    if (newPassword !== confirmPassword) {
        console.log('Passwords do not match');
        return res.status(400).json({ success: false, message: 'Password and confirm password must match' });
    }

    if (!loginSebagai || !userId) {
        console.log('User session is missing');
        return res.status(400).json({ success: false, message: 'Role and User ID are required' });
    }

    try {
        const table = loginSebagai === 'Pegawai' ? 'pegawai' : 'siswa';
        const idColumn = loginSebagai === 'Pegawai' ? 'nip' : 'nisn';
    
        console.log('Checking user with ID:', userId);
    
        const [user] = await db.execute(
            `SELECT password FROM ${table} WHERE ${idColumn} = ?`,
            [userId]
        );
    
        console.log('User fetched from database:', user);
    
        if (!user || user.length === 0) {
            console.log('User not found');
            return res.status(400).json({ success: false, message: 'Pengguna tidak ditemukan' });
        }
    
        if (user[0].password === newPassword) {
            console.log('New password is the same as the old one');
            return res.status(400).json({ success: false, message: 'Password baru sama dengan yang lama' });
        }
    
        const updateResult = await db.execute(
            `UPDATE ${table} SET password = ?, last_password_update = NOW() WHERE ${idColumn} = ?`,
            [newPassword, userId]
        );
    
        console.log('Update Result:', updateResult);
    
        if (updateResult && updateResult[0] && updateResult[0].affectedRows > 0) {
            console.log('Password successfully updated');
            return res.status(200).json({ success: true, message: 'Password berhasil diubah' });
        } else {
            console.error('Update failed, affectedRows:', updateResult[0]?.affectedRows);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui password' });
        }
    
    } catch (error) {
        console.error('Error during password update:', error);
        return res.status(500).json({ success: false, message: `Terjadi kesalahan: ${error.message}` });
    }
});

app.get('/reset-password-after-login', async (req, res) => {
    const loginSebagai = req.session.user ? req.session.user.login_sebagai : null;
    const userId = req.session.user ? req.session.user.id : null;

    console.log('Login Sebagai:', loginSebagai); 
    console.log('User ID:', userId);

    if (!loginSebagai || !userId) {
        return res.status(400).send('Role and User ID are required');
    }

    try {
        const table = loginSebagai === 'Pegawai' ? 'pegawai' : 'siswa';
        const idColumn = loginSebagai === 'Pegawai' ? 'nip' : 'nisn';
        const nameColumn = loginSebagai === 'Pegawai' ? 'nama_pegawai' : 'nama_siswa';

        const [results] = await db.execute(`SELECT ${nameColumn} AS name FROM ${table} WHERE ${idColumn} = ?`, [userId]);

        if (results.length === 0) {
            return res.status(400).send('User not found');
        }

        const user = results[0];

        const filePath = path.join(__dirname, 'frontend', 'html', 'sandi-stlh-login.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading HTML file:', err);
                return res.status(500).send('Error loading page');
            }

            let htmlContent = data;
            htmlContent = htmlContent
                .replace('<%= role %>', loginSebagai)
                .replace('<%= name %>', user.name);

            res.send(htmlContent);
        });
    } catch (err) {
        console.error('Error occurred while processing the request:', err);
        return res.status(500).send('Error occurred while processing the request');
    }
});

// cek nip, email, dan nik pegawai
app.get('/api/pegawai/check/:field/:value', async (req, res) => {
    try {
        const { field, value } = req.params;

        // memvalidasi field yang diizinkan untuk dicek
        const allowedFields = ['nip', 'email', 'nik']; 
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ message: `Field '${field}' tidak valid untuk pemeriksaan.` });
        }

        // untuk memeriksa keberadaan data
        const query = `SELECT COUNT(*) AS count FROM pegawai WHERE ${field} = ?`;
        const [rows] = await db.execute(query, [value]);

        // Jika ada data yang ditemukan
        if (rows[0].count > 0) {
            return res.status(409).json({ message: `${field} '${value}' sudah terdaftar.` });
        }

        res.status(200).json({ message: `${field} '${value}' belum terdaftar.` });
    } catch (error) {
        console.error('Error memeriksa data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

// cek nisn, email, dan nik siswa
app.get('/api/siswa/check/:field/:value', async (req, res) => {
    try {
        const { field, value } = req.params;

        // memvalidasi field yang diizinkan untuk dicek
        const allowedFields = ['nisn', 'email', 'nik'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ message: `Field '${field}' tidak valid untuk pemeriksaan.` });
        }

        // untuk memeriksa keberadaan data
        const query = `SELECT COUNT(*) AS count FROM siswa WHERE ${field} = ?`;
        const [rows] = await db.execute(query, [value]);

        // jika ada data yang ditemukan
        if (rows[0].count > 0) {
            return res.status(409).json({ message: `${field} '${value}' sudah terdaftar.` });
        }

        res.status(200).json({ message: `${field} '${value}' belum terdaftar.` });
    } catch (error) {
        console.error('Error memeriksa data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});