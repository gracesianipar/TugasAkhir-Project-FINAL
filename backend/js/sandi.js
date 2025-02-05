document.getElementById('resetPasswordForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const role = document.getElementById('role').innerText.trim();
  console.log("Role yang dikirim ke server:", role);

  const email = document.getElementById('email').innerText.trim();
  console.log("Email yang dikirim ke server:", email);

  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (!role || !email) {
    alert('Role and email are required');
    return;
  }

  try {
    const response = await fetch(`/reset-password/${role}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, confirmPassword })
    });

    const data = await response.json();
    console.log("Response dari server:", data);

    Swal.fire({
        icon: data.success ? 'success' : 'error',
        title: data.success ? 'Berhasil!' : 'Gagal!',
        text: data.success ? 'Password berhasil diubah' : data.message,
        confirmButtonColor: data.success ? '#3085d6' : '#d33',
    });

} catch (error) {
    console.error('Error:', error);
    Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan!',
        text: 'Terjadi kesalahan. Silakan coba lagi.',
        confirmButtonColor: '#d33',
    });
}
});