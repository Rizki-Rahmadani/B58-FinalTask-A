function isPrime(num) {
    // Jika angka kurang dari 2, maka tidak termasuk bilangan prima.
    if (num < 2) return false;
    // Loop untuk memeriksa faktor dari 2 hingga akar kuadrat dari num.
    for (let i = 2; i <= Math.sqrt(num); i++) {
        // Jika num dapat dibagi habis oleh i, maka num tidak termasuk bilangan prima.
        if (num % i === 0) return false;
    }
    // Jika tidak ditemukan faktor, maka num adalah bilangan prima.
    return true;
}

function cetakPatternSegitiga(baseHeight) {
    let currentNum = 2; // Start checking for primes from 2

    // Loop untuk setiap baris
    for (let i = 1; i <= baseHeight; i++) {
        let row = "";

        // Loop untuk mencetak angka pada setiap baris
        for (let j = 0; j < i; j++) {
            // Loop ini digunakan untuk mencari angka prima berikutnya
            while (!isPrime(currentNum)) {
                currentNum++; // Increment untuk mencari angka berikutnya
            }
            row += currentNum + " "; // Menambahkan angka prima ke dalam baris
            currentNum++; // Increment untuk mencari angka berikutnya setelah menemukan angka prima
        }
        console.log(row.trim()); // Mencetak baris yang telah diisi dengan angka prima
    }
}

// Contoh penggunaan
const baseHeight = 7; // Ganti dengan input pengguna
if (baseHeight > 0 && baseHeight < 10) {
    console.log("DrawSikuSiku", "(", baseHeight, "):");
    cetakPatternSegitiga(baseHeight);
} else {
    console.log("Panjang alas dan tinggi harus antara 0 dan 10.");
}