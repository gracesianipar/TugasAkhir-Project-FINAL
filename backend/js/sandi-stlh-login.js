document.addEventListener("DOMContentLoaded", function () {
    const role = document.getElementById('role').textContent.trim();
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    document.getElementById('resetPasswordForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Validasi kesesuaian password
        if (newPassword.value !== confirmPassword.value) {
            alert('Password dan konfirmasi password tidak cocok!');
            return;
        }

        if (!newPassword.value || !confirmPassword.value) {
            alert('Password dan konfirmasi password tidak boleh kosong!');
            return;
        }

        console.log('New Password:', newPassword.value);  // Debugging
        console.log('Confirm Password:', confirmPassword.value);  // Debugging

        try {
            const response = await fetch('/reset-password-after-login', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newPassword: newPassword.value,
                    confirmPassword: confirmPassword.value
                })
            });

            // Periksa status respons
            if (response.ok) {
                const data = await response.json();
                console.log('Response from server:', data); // Debugging: cek respons dari API

                if (data.success) {
                    Swal.fire({
                        title: 'Sukses!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#004D40'

                    }).then(() => {
                        setTimeout(() => {
                            window.history.back();  // Kembali ke halaman sebelumnya setelah delay
                        }, 300);  // Kembali ke halaman sebelumnya
                    });
                } else {
                    Swal.fire({
                        title: 'Gagal!',
                        text: data.message,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } else {
                Swal.fire({
                    title: 'Terjadi Kesalahan!',
                    text: 'Gagal terhubung ke server, coba lagi nanti.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error during password reset:', error);
            Swal.fire({
                title: 'Terjadi Kesalahan!',
                text: 'Terjadi kesalahan saat mengatur ulang password',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});
