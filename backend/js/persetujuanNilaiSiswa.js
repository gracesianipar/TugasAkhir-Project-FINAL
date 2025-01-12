async function getUserSession() {
    try {
        const response = await fetch("api/session");
        if (!response.ok) throw new Error("Gagal memuat data session");

        const sessionData = await response.json();
        console.log("Data session pengguna:", sessionData);

        return sessionData.nip;
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data session.");
    }
}



function displayKelas(kelasData) {
    console.log("kelasData:", kelasData);
    const kelasInfoDiv = document.getElementById("info-kelas");
    kelasInfoDiv.innerHTML = '';
    if (Array.isArray(kelasData) && kelasData.length > 0) {
        kelasData.forEach(kelas => {
            const namaKelas = document.createElement("p");
            namaKelas.innerHTML = `<strong>Nama Kelas:</strong> ${kelas.nama_kelas}`;

            const tingkatan = document.createElement("p");
            tingkatan.innerHTML = `<strong>Tingkatan:</strong> ${kelas.tingkatan}`;

            const tahunAjaran = document.createElement("p");
            tahunAjaran.innerHTML = `<strong>ID Tahun Ajaran:</strong> ${kelas.id_tahun_ajaran}`;
            const namaTahunAjaran = document.createElement("p");
            namaTahunAjaran.innerHTML = `
            <strong>Tahun Ajaran:</strong> ${kelas.nama_tahun_ajaran || 'Tidak tersedia'} - ${kelas.semester || 'Tidak tersedia'}
        `;
            kelasInfoDiv.appendChild(namaKelas);
            kelasInfoDiv.appendChild(tingkatan);
            kelasInfoDiv.appendChild(tahunAjaran);
            kelasInfoDiv.appendChild(namaTahunAjaran);
        });
    } else {
        const noKelasMessage = document.createElement("p");
        noKelasMessage.textContent = "Anda tidak mengelola kelas manapun.";
        noKelasMessage.classList.add('no-kelas');
        kelasInfoDiv.appendChild(noKelasMessage);
    }

    kelasInfoDiv.classList.remove("hidden");
}

async function fetchKelas() {
    try {
        const nip = await getUserSession();
        if (!nip) throw new Error("NIP pengguna tidak ditemukan.");

        const response = await fetch("/api/kelas");
        if (!response.ok) throw new Error("Gagal memuat data kelas");

        const kelasData = await response.json();
        console.log("Data kelas:", kelasData);

        const filteredKelas = kelasData.filter(kelas => kelas.nip === nip);
        console.log("Kelas yang dikelola oleh pengguna:", filteredKelas);

        displayKelas(filteredKelas);

        if (filteredKelas.length > 0) {
            const kelasId = filteredKelas[0].id;
            await fetchMataPelajaran(kelasId);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data kelas atau nilai.");
    }
}

async function fetchMataPelajaran(kelasId) {
    try {
        const response = await fetch(`/api/mapel/${kelasId}`);
        if (!response.ok) throw new Error("Gagal memuat mata pelajaran");

        const mataPelajaranData = await response.json();
        console.log("Data mata pelajaran:", mataPelajaranData);

        displayMataPelajaran(mataPelajaranData);

    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat mata pelajaran.");
    }
}

function displayMataPelajaran(mataPelajaranData) {
    const mapelSelect = document.getElementById("mapel-filter");
    mapelSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';

    if (Array.isArray(mataPelajaranData) && mataPelajaranData.length > 0) {
        mataPelajaranData.forEach(mapel => {
            const option = document.createElement("option");
            option.value = mapel.id;
            option.textContent = mapel.nama_mata_pelajaran;
            mapelSelect.appendChild(option);
        });
    }
}

async function fetchGrades(kelasId, mapelId) {
    try {
        const response = await fetch(`/api/grades/${kelasId}/${mapelId}`);
        if (!response.ok) throw new Error("Gagal memuat data nilai");

        const gradesData = await response.json();
        console.log("Data nilai:", gradesData);

        // Tampilkan data nilai di tabel
        displayGrades(gradesData);
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data nilai.");
    }
}
function displayGrades(gradesData) {
    const tbody = document.getElementById("nilai-tbody");
    tbody.innerHTML = ''; // Bersihkan tabel sebelumnya

    let showApproveAllButton = false; // Variabel untuk menampilkan tombol Setujui Semua

    if (Array.isArray(gradesData) && gradesData.length > 0) {
        gradesData.forEach(grade => {
            const nilaiAkhir = parseFloat(((grade.uts * 0.4) + (grade.uas * 0.4) + (grade.tugas * 0.2)).toFixed(2));
            const row = document.createElement("tr");

            // NISN
            const nisnCell = document.createElement("td");
            nisnCell.textContent = grade.nisn;
            row.appendChild(nisnCell);

            // Nama Siswa
            const namaSiswaCell = document.createElement("td");
            namaSiswaCell.textContent = grade.nama_siswa || "Tidak tersedia";
            row.appendChild(namaSiswaCell);

            // Nilai UTS, UAS, dan Tugas
            const utsCell = document.createElement("td");
            utsCell.textContent = grade.uts !== null ? grade.uts : '-';
            row.appendChild(utsCell);

            const uasCell = document.createElement("td");
            uasCell.textContent = grade.uas !== null ? grade.uas : '-';
            row.appendChild(uasCell);

            const tugasCell = document.createElement("td");
            tugasCell.textContent = grade.tugas !== null ? grade.tugas : '-';
            row.appendChild(tugasCell);

            const nilaiAkhirCell = document.createElement("td");
            nilaiAkhirCell.textContent = nilaiAkhir;
            row.appendChild(nilaiAkhirCell);

            // Status
            const statusCell = document.createElement("td");
            statusCell.textContent = grade.gradeStatus === "setuju" ? "Disetujui" : "";
            row.appendChild(statusCell);

            if (!grade.gradeStatus || grade.gradeStatus !== "setuju") {
                showApproveAllButton = true; // Ada nilai yang belum disetujui
            }

            tbody.appendChild(row);
        });

        const existingApproveAllButton = document.getElementById("approve-all-button");

        // Hapus tombol lama jika ada
        if (existingApproveAllButton) {
            existingApproveAllButton.remove();
        }

        if (showApproveAllButton) {
            // Buat tombol baru "Setujui Semua"
            const approveAllButton = document.createElement("button");
            approveAllButton.id = "approve-all-button";
            approveAllButton.textContent = "Setuju";
            approveAllButton.style.marginTop = "20px";
            approveAllButton.style.cursor = "pointer";
            approveAllButton.style.position = "absolute";
            approveAllButton.style.right = "20px";
            approveAllButton.style.backgroundColor = "#004D40";
            approveAllButton.style.color = "white";
            approveAllButton.style.padding = "8px 10px";
            approveAllButton.style.border = "none";
            approveAllButton.style.borderRadius = "5px";
            approveAllButton.style.fontSize = "12px";
            approveAllButton.style.transition = "background-color 0.3s";

            // Tambahkan event listener untuk tombol
            approveAllButton.addEventListener("click", () => {
                let missingFields = new Set();
                const mapelId = document.getElementById("mapel-filter").value;

                gradesData.forEach(grade => {
                    if (!grade.uts) {
                        missingFields.add("UTS");
                    }
                    if (!grade.uas) {
                        missingFields.add("UAS");
                    }
                    if (!grade.tugas) {
                        missingFields.add("Tugas");
                    }
                });

                if (missingFields.size > 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Nilai belum lengkap!",
                        text: "Harap isi nilai " + Array.from(missingFields).join(", ") + " sebelum menyetujui.",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#004D40", 
                    });
                    
                } else {
                    let updateSuccessful = true;

                    gradesData.forEach((grade, index) => {
                        grade.gradeStatus = "setuju";

                        fetch("/api/update-grade-status", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                nisn: grade.nisn,
                                status: grade.gradeStatus,
                                mapel_id: mapelId
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message !== "Status berhasil diperbarui.") {
                                updateSuccessful = false;
                            }

                            // Update status UI
                            if (updateSuccessful) {
                                const row = tbody.children[index];
                                const statusCell = row.querySelector("td:nth-child(7)");
                                statusCell.innerHTML = "Disetujui";
                            }
                        })
                        .catch(err => {
                            console.error("Error:", err);
                            updateSuccessful = false;
                        });
                    });

                    Swal.fire({
                        title: updateSuccessful ? "Sukses!" : "Gagal!",
                        text: updateSuccessful
                            ? "Semua nilai berhasil disetujui!"
                            : "Terjadi kesalahan dalam memperbarui status nilai. Silakan coba lagi.",
                        icon: updateSuccessful ? "success" : "error",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#004D40",
                    }).then(() => {
                        if (updateSuccessful) {
                            approveAllButton.style.display = "none";
                        }
                    });
                }
            });

            // Tambahkan tombol ke tabel
            document.getElementById("nilaiTable").appendChild(approveAllButton);
        }
    } else {
        const noDataRow = document.createElement("tr");
        const noDataCell = document.createElement("td");
        noDataCell.colSpan = 8;
        noDataCell.textContent = "Tidak ada data nilai.";
        noDataRow.appendChild(noDataCell);
        tbody.appendChild(noDataRow);
    }
}

document.getElementById("mapel-filter").addEventListener("change", async function () {
    const kelasId = await getSelectedKelasId();
    const mapelId = this.value;

    if (kelasId && mapelId) {
        await fetchGrades(kelasId, mapelId);
    }
});

async function getSelectedKelasId() {
    const nip = await getUserSession();
    const response = await fetch("/api/kelas");
    const kelasData = await response.json();
    const kelas = kelasData.find(k => k.nip === nip);
    return kelas ? kelas.id : null;
}




document.addEventListener("DOMContentLoaded", function () {
    fetchKelas();
});
