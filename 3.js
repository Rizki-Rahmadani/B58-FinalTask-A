// Fungsi untuk melakukan pengurutan array menggunakan metode bubble sort secara rekursif
function recursiveBubbleSort(arr, n = arr.length) {
    // Basis: jika panjang array kurang dari 2, kembalikan array karena array tersebut sudah terurut
    if (n <= 1) {
        return arr;
    }

    // Melakukan satu pass bubble sort untuk mengurutkan array
    for (let i = 0; i < n - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            // Jika elemen saat ini lebih besar dari elemen berikutnya, maka tukar mereka untuk mengurutkan array
            [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
    }

    // Panggil fungsi secara rekursif untuk mengurutkan sisa array setelah satu pass bubble sort
    return recursiveBubbleSort(arr, n - 1);
}

// Fungsi untuk mengurutkan array dan memisahkan angka ganjil dan genap
function sortArray(inputArray) {
    const array = [2, 24, 32, 22, 31, 100, 56, 21, 99, 7, 5, 37, 97, 25, 13, 11];

    // Mengambil elemen dari array yang ada di inputArray
    const selectedArray = inputArray.filter((num) => array.includes(num));

    const sortedArray = recursiveBubbleSort(selectedArray);
    const angkaGanjil = sortedArray.filter((num) => num % 2 !== 0);
    const angkaGenap = sortedArray.filter((num) => num % 2 === 0);

    // Menampilkan hasil
    console.log(`Array: ${sortedArray.join(", ")}`);
    console.log(`Ganjil: ${angkaGanjil.join(", ")}`);
    console.log(`Genap: ${angkaGenap.join(", ")}`);
}

// Contoh penggunaan
sortArray([31, 100, 97, 24, 11, 22]);