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
            
            const namaTahunAjaran = document.createElement("p");
            namaTahunAjaran.innerHTML = `
            <strong>Tahun Ajaran:</strong> ${kelas.nama_tahun_ajaran || 'Tidak tersedia'} - ${kelas.semester || 'Tidak tersedia'}
        `;
            kelasInfoDiv.appendChild(namaKelas);
            kelasInfoDiv.appendChild(tingkatan);
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
    const mapelSelect = document.getElementById("matpel-filter");
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

        // menampilkan data nilai di tabel
        TampilkanNilai(gradesData);
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data nilai.");
    }
}

function TampilkanNilai(gradesData) {
    const tbody = document.getElementById("nilai-tbody");
    tbody.innerHTML = ""; 
    
    // variabel untuk menampilkan tombol setujui semua
    let showApproveAllButton = false;

    if (Array.isArray(gradesData) && gradesData.length > 0) {
        gradesData.forEach((grade) => {
            const nilaiAkhir = parseFloat(((grade.uts * 0.4) + (grade.uas * 0.4) + (grade.tugas * 0.2)).toFixed(2));
            const row = document.createElement("tr");

            // kolom nisn
            const nisnCell = document.createElement("td");
            nisnCell.textContent = grade.nisn;
            row.appendChild(nisnCell);

            // kolom nama siswa
            const namaSiswaCell = document.createElement("td");
            namaSiswaCell.textContent = grade.nama_siswa || "Tidak tersedia";
            row.appendChild(namaSiswaCell);

            // kolom nilai UTS, UAS, dan Tugas
            const utsCell = document.createElement("td");
            utsCell.textContent = grade.uts !== null ? grade.uts : "-";
            row.appendChild(utsCell);

            const uasCell = document.createElement("td");
            uasCell.textContent = grade.uas !== null ? grade.uas : "-";
            row.appendChild(uasCell);

            const tugasCell = document.createElement("td");
            tugasCell.textContent = grade.tugas !== null ? grade.tugas : "-";
            row.appendChild(tugasCell);

            const nilaiAkhirCell = document.createElement("td");
            nilaiAkhirCell.textContent = nilaiAkhir;
            row.appendChild(nilaiAkhirCell);

            // kolom status
            const statusCell = document.createElement("td");
            statusCell.textContent = grade.gradeStatus === "setuju" ? "Disetujui" : "";
            row.appendChild(statusCell);

            if (!grade.gradeStatus || grade.gradeStatus !== "setuju") {
                showApproveAllButton = true; 
            }

            tbody.appendChild(row);
        });

        const existingApproveAllButton = document.getElementById("approve-all-button");

        if (existingApproveAllButton) {
            existingApproveAllButton.remove();
        }

        if (showApproveAllButton) {
            const approveAllButton = document.createElement("button");
            approveAllButton.id = "approve-all-button";
            approveAllButton.textContent = "Setujui";
            approveAllButton.style.marginTop = "28px";
            approveAllButton.style.cursor = "pointer";
            approveAllButton.style.backgroundColor = "#004D40";
            approveAllButton.style.color = "white";
            approveAllButton.style.padding = "8px 16px";
            approveAllButton.style.border = "none";
            approveAllButton.style.borderRadius = "5px";
            approveAllButton.style.fontSize = "14px";
            approveAllButton.style.transition = "background-color 0.3s";
            approveAllButton.style.float = "right"; 

            approveAllButton.addEventListener("click", () => {
                let missingFields = new Set();
                const mapelId = document.getElementById("matpel-filter").value;

                gradesData.forEach((grade) => {
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
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                nisn: grade.nisn,
                                status: grade.gradeStatus,
                                mapel_id: mapelId,
                            }),
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                if (data.message !== "Status berhasil diperbarui.") {
                                    updateSuccessful = false;
                                }

                                if (updateSuccessful) {
                                    const row = tbody.children[index];
                                    const statusCell = row.querySelector("td:nth-child(7)");
                                    statusCell.innerHTML = "Disetujui";
                                }
                            })
                            .catch((err) => {
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

            const approveContainer = document.getElementById("approve-container");
            approveContainer.parentNode.insertBefore(approveAllButton, approveContainer);
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


async function updateStatusInDB(nisn, catatan, status) {
    const mapelId = document.getElementById("matpel-filter").value;

    if (!mapelId) {
        alert("Silakan pilih mata pelajaran");
        return;
    }

    try {
        const response = await fetch(`/api/update-grade-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nisn: nisn,
                catatan: catatan,
                status: status,
                mapel_id: mapelId,
            }),
        });

        if (!response.ok) {
            throw new Error('Gagal memperbarui status nilai.');
        }

        const result = await response.json();
        console.log('Status berhasil diperbarui:', result);
        alert('Status nilai berhasil diperbarui!');
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memperbarui status nilai.');
    }
}

document.getElementById("matpel-filter").addEventListener("change", async function () {
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