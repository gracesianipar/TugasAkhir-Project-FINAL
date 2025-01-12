const cameraIcon = document.getElementById('camera-icon');
const fileInput = document.getElementById('file-input');
const profileImage = document.getElementById('profile-image');
const uploadForm = document.getElementById('upload-form');
const fileUploadInput = document.getElementById('file-upload');

// Fungsi untuk mengambil data sesi
async function fetchSessionData() {
    try {
        const response = await fetch('/api/session-siswa');
        if (!response.ok) {
            throw new Error('Tidak dapat mengambil data sesi.');
        }

        const user = await response.json();
        console.log('User data:', user);
        console.log('Nama pengguna:', user.name); 

        const nameHeader = document.getElementById('employee-name-header');
        console.log(nameHeader);  // Debugging log
        if (nameHeader) {
            nameHeader.textContent = user.name || 'Tamu';
        }

        const nameMessage = document.getElementById('employee-name-message');
        if (nameMessage) {
            nameMessage.textContent = user.name || 'Tamu'; 
        } else {
            console.error("Elemen dengan ID 'employee-name-message' tidak ditemukan.");
        }
         // Update nama pengguna
        const biodataName = document.getElementById('biodata-name');
        if (biodataName) {
            biodataName.textContent = user.name || 'Tidak tersedia';
        }

        // Update tempat dan tanggal lahir
        const biodataTtl = document.getElementById('biodata-ttl');
        if (biodataTtl) {
            biodataTtl.textContent = `${user.tempat_lahir || 'Tidak tersedia'}, ${user.tanggal_lahir || 'Tidak tersedia'}`;
        }

        // Update jenis kelamin
        const biodataJenisKelamin = document.getElementById('biodata-jenis-kelamin');
        if (biodataJenisKelamin) {
            biodataJenisKelamin.textContent = user.jenis_kelamin || 'Tidak tersedia';
        }

        // Update NISN
        const biodataNisn = document.getElementById('biodata-nisn');
        if (biodataNisn) {
            biodataNisn.textContent = user.nisn || 'Tidak tersedia';
        }

        // Update agama
        const biodataAgama = document.getElementById('biodata-agama');
        if (biodataAgama) {
            biodataAgama.textContent = user.agama || 'Tidak tersedia';
        }

        // Update nama ayah
        const biodataNamaAyah = document.getElementById('biodata-nama-ayah');
        if (biodataNamaAyah) {
            biodataNamaAyah.textContent = user.nama_ayah || 'Tidak tersedia';
        }

        // Update nama ibu
        const biodataNamaIbu = document.getElementById('biodata-nama-ibu');
        if (biodataNamaIbu) {
            biodataNamaIbu.textContent = user.nama_ibu || 'Tidak tersedia';
        }

        // Update nomor HP orang tua
        const biodataNoHpOrtu = document.getElementById('biodata-no-hp-ortu');
        if (biodataNoHpOrtu) {
            biodataNoHpOrtu.textContent = user.no_hp_ortu || 'Tidak tersedia';
        }

        // Update email
        const biodataEmail = document.getElementById('biodata-email');
        if (biodataEmail) {
            biodataEmail.textContent = user.email || 'Tidak tersedia';
        }

        // Update NIK
        const biodataNik = document.getElementById('biodata-nik');
        if (biodataNik) {
            biodataNik.textContent = user.nik || 'Tidak tersedia';
        }

        // Update anak ke
        const biodataAnakKe = document.getElementById('biodata-anak-ke');
        if (biodataAnakKe) {
            biodataAnakKe.textContent = user.anak_ke || 'Tidak tersedia';
        }

        // Update status
        const biodataStatus = document.getElementById('biodata-status');
        if (biodataStatus) {
            biodataStatus.textContent = user.status || 'Tidak tersedia';
        }

        // Update tanggal masuk
        const biodataTanggalMasuk = document.getElementById('biodata-tanggal-masuk');
        if (biodataTanggalMasuk) {
            biodataTanggalMasuk.textContent = user.tanggal_masuk || 'Tidak tersedia';
        }

        // Update last password update
        const biodataLastPasswordUpdate = document.getElementById('biodata-last-password-update');
        if (biodataLastPasswordUpdate) {
            biodataLastPasswordUpdate.textContent = user.last_password_update || 'Tidak tersedia';
        }

        // Update ID Kelas
        const biodataIdKelas = document.getElementById('biodata-id-kelas');
        if (biodataIdKelas) {
            biodataIdKelas.textContent = user.id_kelas || 'Tidak tersedia';
        }
        const profileInitial = document.getElementById('profile-initial');
        if (profileInitial) {
            profileInitial.textContent = user.name?.charAt(0).toUpperCase() || 'T';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat data sesi.');
    }
}

document.addEventListener('DOMContentLoaded', fetchSessionData);

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.content-section');
  
    console.log('Links:', links); // Debugging
    console.log('Sections:', sections); // Debugging
  
    function hideAllSections() {
        sections.forEach(section => {
            console.log('Hiding section:', section.id); // Debugging
            section.classList.add('hidden');
        });
    }
  
    links.forEach(link => {
      link.addEventListener('click', (e) => {
          e.preventDefault();
  
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          hideAllSections();
  
          const target = link.getAttribute('data-target');
          const targetSection = document.getElementById(target);
          if (targetSection) {
              targetSection.classList.remove('hidden');
  
              // Jika target adalah data siswa, panggil fungsi fetchSiswaData()
              if (target === 'data-nilai-siswa') {
                  fetchSiswaData();
              }
          }
      });
  });
  
  
    // Default to show the profile section
    hideAllSections();
    const defaultSection = document.getElementById('siswa-profile'); // Pastikan nama ID sama dengan di HTML
    if (defaultSection) {
        console.log('Default section shown:', defaultSection.id); // Debugging
        defaultSection.classList.remove('hidden');
    } else {
        console.error('Default section not found!'); // Debugging
    }
});
// fungsi untuk mengambil data sesi
async function fetchSessionDataSiswa() {
  try {
      const response = await fetch('/api/session-siswa');
      if (!response.ok) {
          throw new Error('Tidak dapat mengambil data sesi.');
      }

      const user = await response.json();
      console.log('User data:', user);

      const nameHeader = document.getElementById('employee-name-header');
      if (nameHeader) {
          nameHeader.textContent = user.name || 'Tamu';
      }

      const nameMessage = document.getElementById('employee-name-message');
      if (nameMessage) {
          nameMessage.textContent = user.name || 'Tamu';
      }

      const biodataName = document.getElementById('biodata-name');
      if (biodataName) {
          biodataName.textContent = user.name || 'Tidak tersedia';
      }

      const biodataTtl = document.getElementById('biodata-ttl');
      if (biodataTtl) {
          biodataTtl.textContent = `${user.tempat_lahir}, ${user.tanggal_lahir}` || 'Tidak tersedia';
      }

      const biodataNisn = document.getElementById('biodata-nisn');
      if (biodataNisn) {
          biodataNisn.textContent = user.nisn || 'Tidak tersedia';
      }

      const profileInitial = document.getElementById('profile-initial');
      if (profileInitial) {
          profileInitial.textContent = user.name?.charAt(0).toUpperCase() || 'T';
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Gagal memuat data sesi.');
  }
}

document.addEventListener('DOMContentLoaded', fetchSessionDataSiswa);

async function getUserNISN() {
  try {
    const response = await fetch('/api/session-siswa');
    const sessionData = await response.json();
    console.log('NISN dari sesi:', sessionData.nisn);
    return sessionData.nisn;
  } catch (error) {
    console.error('Gagal mengambil NISN:', error);
    return null;
  }
}

function getSelectedDate() {
  const dateInput = document.getElementById('date-input');
  const selectedDate = dateInput ? dateInput.value : null;
  console.log('Tanggal yang dipilih:', selectedDate); 
  return selectedDate;
}


// fungsi untuk mengambil data siswa berdasarkan nisn
async function fetchSiswaData(nisn) {
  try {
      const response = await fetch(`/api/siswa/${nisn}`);
      if (!response.ok) throw new Error("Gagal memuat data siswa");

      const siswaData = await response.json();
      console.log("Data siswa:", siswaData);
      return siswaData;
  } catch (error) {
      console.error("Error saat memuat data siswa:", error);
      throw error;
  }
}

async function fetchAbsensiData() {
  const nisn = await getUserNISN(); 
  const today = getCurrentDate(); 

  if (!nisn) {
      alert('NISN tidak ditemukan. Harap periksa sesi pengguna.');
      return;
  }

  try {
      const response = await fetch(`/api/attendance-details-siswa?nisn=${nisn}&date=${today}`);
      if (!response.ok) throw new Error('Gagal memuat data absensi.');

      const data = await response.json();
      console.log('Data absensi:', data);

      displayAbsensi(data.attendanceDetails);  
  } catch (error) {
      console.error('Error saat memuat data absensi:', error);
      alert(`Gagal memuat data absensi: ${error.message}`);
  }
}

async function fetchAbsensiDataBySiswa() {
  const nisn = await getUserNISN();

  if (!nisn) {
    alert('NISN tidak ditemukan. Harap periksa sesi pengguna.');
    return;
  }

  try {
    // mengambil semua data absensi siswa berdasarkan NISN
    const response = await fetch(`/api/attendance-details-siswa?nisn=${nisn}`);
    if (!response.ok) throw new Error('Gagal memuat data absensi.');

    const absensiData = await response.json();
    console.log('Data absensi lengkap:', absensiData);

    // memfilter duplikasi berdasarkan tanggal
    const uniqueAbsensi = [];
    const seenDates = new Set();

    absensiData.attendanceDetails.forEach(record => {
      if (!seenDates.has(record.date)) {
        uniqueAbsensi.push(record);
        seenDates.add(record.date);
      }
    });

    console.log('Data absensi tanpa duplikasi:', uniqueAbsensi);

    // Mengurutkan data absensi berdasarkan tanggal secara ascending
    uniqueAbsensi.sort((a, b) => {
      const dateA = new Date(a.date); // Ubah tanggal menjadi objek Date
      const dateB = new Date(b.date); // Ubah tanggal menjadi objek Date
      return dateA - dateB; // Urutkan secara ascending
    });

    console.log('Data absensi setelah diurutkan:', uniqueAbsensi);

    // menampilkan semua data absensi tanpa duplikasi dan urut
    displayAbsensi(uniqueAbsensi);

  } catch (error) {
    console.error('Error saat memuat data absensi:', error);
    alert(`Gagal memuat data absensi: ${error.message}`);
  }
}

function displayAbsensi(absensiData) {
  const tableBody = document.getElementById('absensi-table').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ''; 

  absensiData.forEach((data) => {
    const row = document.createElement('tr'); 

    const dateCell = document.createElement('td'); 
    dateCell.textContent = data.date; 
    row.appendChild(dateCell); 

    const statusCell = document.createElement('td'); 
    statusCell.textContent = data.status;
    row.appendChild(statusCell); 

    tableBody.appendChild(row); 
  });
}

// mengambil data absensi ketika halaman selesai dimuat
document.addEventListener('DOMContentLoaded', fetchAbsensiDataBySiswa);

async function fetchClassData(classId) {
  try {
    // Fetching class data
    const response = await fetch(`/api/kelas/${classId}`);
    if (!response.ok) {
      throw new Error('Gagal mengambil data kelas.');
    }

    const classData = await response.json();
    console.log('Data kelas:', classData);

    const classNameElement = document.getElementById('class-name');
    const academicYearElement = document.getElementById('academic-year');
    const semesterElement = document.getElementById('semester');
    const studentNameElement = document.getElementById('student-name');

    // Menambahkan styling langsung dari kelas CSS
    const applyClassInfoStyle = (element) => {
      element.classList.add('class-info');
    };

    if (classNameElement  && academicYearElement && semesterElement && studentNameElement) {
      classNameElement.textContent = `Kelas: ${classData.nama_kelas || 'Tidak Tersedia'}`;

      applyClassInfoStyle(classNameElement);

      const sessionResponse = await fetch('/api/session-siswa');
      if (sessionResponse.ok) {
        const userData = await sessionResponse.json();
        console.log('Data siswa dari sesi:', userData);
        studentNameElement.textContent = `Nama Siswa: ${userData.name || 'Tidak Tersedia'}`;
        applyClassInfoStyle(studentNameElement);
      } else {
        studentNameElement.textContent = 'Nama Siswa Tidak Tersedia';
        studentNameElement.classList.add('error-message'); // Styling error
      }

      const tahunAjaranId = classData.id_tahun_ajaran;

      if (tahunAjaranId) {
        console.log('Mencoba mengambil data tahun ajaran untuk ID:', tahunAjaranId);
        const tahunAjaranResponse = await fetch(`/api/tahun-ajaran/${tahunAjaranId}`);
        if (tahunAjaranResponse.ok) {
          const tahunAjaranData = await tahunAjaranResponse.json();
          console.log('Data Tahun Ajaran:', tahunAjaranData);

          academicYearElement.textContent = `Tahun Ajaran: ${tahunAjaranData.nama_tahun_ajaran || 'Tidak Tersedia'}- ${tahunAjaranData.semester || 'Tidak Tersedia'}`;

          applyClassInfoStyle(academicYearElement);
          applyClassInfoStyle(semesterElement);
        } else {
          academicYearElement.textContent = 'Tahun Ajaran Tidak Ditemukan';
          semesterElement.textContent = 'Semester Tidak Ditemukan';
        }
      } else {
        academicYearElement.textContent = 'Tahun Ajaran Tidak Tersedia';
        semesterElement.textContent = 'Semester Tidak Tersedia';
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal memuat data kelas.');
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  const nisn = await getUserNISN();
  if (nisn) {
      const classId = await getClassIdByNisn(nisn);
      fetchClassData(classId);
  }
});

async function getClassIdByNisn(nisn) {
  try {
      const response = await fetch(`/api/siswa/${nisn}`);
      const studentData = await response.json();
      return studentData.id_kelas; 
  } catch (error) {
      console.error('Error fetching class ID by NISN:', error);
      return null;
  }
}