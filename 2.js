function hitungVoucher(voucher, totalBelanja) {
    let diskon = 0; // Inisialisasi diskon awal sebagai 0
    let uangYangHarusDibayar = totalBelanja; // Inisialisasi uang yang harus dibayar dengan total belanja

    // Menentukan potongan berdasarkan voucher yang digunakan
    if (voucher === "DumbWaysJos") {
        // Jika total belanja minimal Rp 50.000, maka berlaku diskon
        if (totalBelanja >= 50000) {
            // Menghitung diskon dengan rumus: total belanja * 21.1% tapi tidak lebih dari Rp 20.000
            diskon = Math.min(totalBelanja * 0.211, 20000);
        }
    } else if (voucher === "DumbWaysMantap") {
        // Jika total belanja minimal Rp 80.000, maka berlaku diskon
        if (totalBelanja >= 80000) {
            // Menghitung diskon dengan rumus: total belanja * 30% tapi tidak lebih dari Rp 40.000
            diskon = Math.min(totalBelanja * 0.3, 40000);
        }
    }

    // Menghitung uang yang harus dibayar setelah diskon
    uangYangHarusDibayar -= diskon; // Mengurangi total belanja dengan diskon yang didapat

    // Menghitung kembalian
    const kembalian = totalBelanja - uangYangHarusDibayar; // Menghitung kembalian dengan mengurangi total belanja dengan uang yang harus dibayar setelah diskon

    // Menampilkan hasil
    console.log(`Uang yang harus dibayar: ${uangYangHarusDibayar}`); // Menampilkan uang yang harus dibayar setelah diskon
    console.log(`Diskon: ${diskon}`); // Menampilkan jumlah diskon yang didapat
    console.log(`Kembalian: ${kembalian}`); // Menampilkan kembalian yang didapat
}

// Contoh penggunaan fungsi hitungVoucher dengan voucher "DumbWaysJos" dan total belanja Rp 100.000
hitungVoucher("DumbWaysMantap", 100000);