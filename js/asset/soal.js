
// Bank soal Pecah Masalah. Edit file ini untuk menambah atau mengubah soal.
// Dimuat sebelum app.js, jadi STAGES tersedia sebagai variabel global.

/* ===== BANK SOAL (tambah atau ubah soal di sini) =====
   t: choice | pick | group | order
   p: teks soal
   k: penjelasan
   f: 1 = refleksi

   choice: o = opsi, a = indeks benar
   pick: c = kartu, a = indeks benar (larik)
   group: g = kelompok, c = [[teks, indeks kelompok]]
   order: c = langkah, r = [[A, B]] artinya A sebelum B
*/

const STAGES = [
    {
        n: "Kenali",
        alat: "Tombol “Pecah”",
        info: "Masalah besar bisa dipecah menjadi bagian kecil. Pecah sampai setiap bagian bisa langsung dikerjakan.",
        qs: [
            {
                t: "choice",
                p: "Masalah: “Membuat poster kelas untuk lomba kebersihan.” Mana pemecahan yang paling tepat?",
                o: [
                    "Buat poster yang bagus dan menarik",
                    "Tentukan pesan, rancang tata letak, buat gambar dan teks, lalu periksa",
                    "Cetak dulu, isinya dipikirkan belakangan"
                ],
                a: 1,
                k: "Pemecahan yang baik menyebut bagian yang jelas dan berurutan, bukan tujuan yang kabur."
            },
            {
                // Tipe split: n.o = beberapa cara memecah, hanya satu yang punya kids.
                // Node yang punya kids masih bisa dipecah lagi (rekursif).
                t: "split",
                p: "Masalah: “Menyiapkan makan malam untuk keluarga.” Pecah sampai setiap bagian bisa langsung dikerjakan.",
                r: {
                    l: "Menyiapkan makan malam",
                    o: [
                        { l: "Memasak makanan" },
                        {
                            l: "Memilih menu · belanja bahan · memasak · menyajikan",
                            kids: [
                                { l: "Memilih menu" },
                                { l: "Belanja bahan" },
                                {
                                    l: "Memasak",
                                    o: [
                                        { l: "Langsung menyalakan kompor" },
                                        {
                                            l: "Siapkan bahan · olah bahan · masak · cicipi",
                                            kids: [
                                                { l: "Siapkan bahan" },
                                                { l: "Olah bahan" },
                                                { l: "Masak" },
                                                { l: "Cicipi" }
                                            ]
                                        }
                                    ]
                                },
                                { l: "Menyajikan" }
                            ]
                        }
                    ]
                },
                k: "“Memasak makanan” masih terlalu besar dan belum bisa dikerjakan langsung. Setelah dipecah, “Memasak” pun masih bisa dipecah lagi — itu gunanya dekomposisi."
            },
            {
                t: "split",
                p: "Masalah: “Merencanakan lomba kebersihan kelas selama satu minggu.” Pecah sampai setiap bagian bisa langsung dikerjakan.",
                r: {
                    l: "Merencanakan lomba kebersihan",
                    o: [
                        { l: "Bersihkan kelas setiap hari" },
                        {
                            l: "Aturan penilaian · regu dan jadwal · alat · catat dan umumkan hasil",
                            kids: [
                                { l: "Aturan penilaian" },
                                { l: "Regu dan jadwal" },
                                { l: "Alat kebersihan" },
                                { l: "Catat dan umumkan hasil" }
                            ]
                        }
                    ]
                },
                k: "Masalah yang lebih besar perlu dipecah menjadi beberapa bagian yang saling melengkapi, bukan satu perintah umum."
            },
            {
                t: "choice",
                f: 1,
                p: "Refleksi: mengapa masalah besar perlu dipecah?",
                o: [
                    "Supaya setiap bagian lebih mudah dikerjakan dan diperiksa",
                    "Supaya pekerjaan terlihat lebih banyak",
                    "Supaya tidak perlu dikerjakan"
                ],
                a: 0,
                k: "Bagian kecil lebih mudah dipahami, dibagi, dan diperiksa."
            }
        ]
    },

    {
        n: "Kelompokkan",
        alat: "Kotak kelompok",
        info: "Kelompokkan langkah ke dalam sub-masalah yang tepat.",
        qs: [
            {
                t: "group",
                p: "Bazar kelas. Kelompokkan setiap langkah ke bagian yang tepat.",
                g: [
                    "Persiapan",
                    "Pelaksanaan",
                    "Beres-beres"
                ],
                c: [
                    ["Menentukan barang yang dijual", 0],
                    ["Membagi tugas penjaga", 0],
                    ["Menata meja dagangan", 1],
                    ["Melayani pembeli", 1],
                    ["Menghitung uang hasil jualan", 2],
                    ["Membersihkan area bazar", 2]
                ],
                k: "Persiapan sebelum acara, pelaksanaan saat acara, beres-beres sesudahnya."
            },
            {
                t: "group",
                p: "Membuat video pendek. Kelompokkan setiap langkah ke bagian yang tepat.",
                g: [
                    "Sebelum merekam",
                    "Saat merekam",
                    "Setelah merekam"
                ],
                c: [
                    ["Menulis ide cerita", 0],
                    ["Menyiapkan alat rekam", 0],
                    ["Mengambil gambar", 1],
                    ["Merekam suara narasi", 1],
                    ["Memotong dan menyusun klip", 2],
                    ["Menambahkan teks dan musik", 2]
                ],
                k: "Ide dan alat disiapkan lebih dulu, perekaman di tengah, penyuntingan di akhir."
            },
            {
                t: "group",
                p: "Karyawisata ke museum. Kelompokkan setiap langkah ke bagian yang tepat.",
                g: [
                    "Sebelum berangkat",
                    "Selama kunjungan",
                    "Setelah pulang"
                ],
                c: [
                    ["Mengurus izin sekolah", 0],
                    ["Membagi kelompok", 0],
                    ["Mencatat informasi koleksi", 1],
                    ["Mengikuti pemandu", 1],
                    ["Menulis laporan kunjungan", 2],
                    ["Membagikan foto kegiatan", 2]
                ],
                k: "Kelompokkan menurut waktu terjadinya: sebelum, selama, dan sesudah kegiatan."
            },
            {
                t: "choice",
                f: 1,
                p: "Refleksi: apa keuntungan mengelompokkan langkah?",
                o: [
                    "Kita bisa membagi tugas dan melihat bagian yang belum digarap",
                    "Langkah menjadi lebih banyak",
                    "Tidak ada gunanya"
                ],
                a: 0,
                k: "Kelompok membantu membagi pekerjaan dan memeriksa kelengkapan."
            }
        ]
    },

    {
        n: "Perbaiki",
        alat: "Kaca pembesar",
        info: "Temukan langkah yang tidak relevan atau yang hilang.",
        qs: [
            {
                t: "pick",
                p: "Karyawisata kelas. Mana SATU langkah yang tidak relevan?",
                c: [
                    "Menentukan tujuan",
                    "Mengurus izin sekolah",
                    "Menonton film kartun di kelas",
                    "Mengumpulkan iuran",
                    "Menyewa kendaraan"
                ],
                a: [2],
                k: "Menonton film kartun tidak membantu persiapan karyawisata."
            },
            {
                t: "choice",
                p: "Menyiapkan presentasi: menentukan topik, mencari bahan, menyusun slide, lalu tampil. Satu langkah penting belum ada. Apa itu?",
                o: [
                    "Berlatih presentasi",
                    "Membeli makanan ringan",
                    "Mengganti tema ponsel"
                ],
                a: 0,
                k: "Berlatih menjembatani penyusunan slide dan tampil di depan kelas."
            },
            {
                t: "pick",
                p: "Membuat kue ulang tahun. Mana DUA langkah yang tidak relevan?",
                c: [
                    "Menyiapkan bahan",
                    "Mengocok adonan",
                    "Mencuci mobil",
                    "Memanggang",
                    "Mengganti wallpaper"
                ],
                a: [2, 4],
                k: "Mencuci mobil dan mengganti wallpaper tidak ada hubungannya dengan membuat kue."
            },
            {
                t: "choice",
                f: 1,
                p: "Refleksi: bagaimana cara memeriksa sebuah pemecahan masalah?",
                o: [
                    "Mencari langkah yang hilang atau tidak perlu",
                    "Menambah langkah sebanyak mungkin",
                    "Menghapus langkah secara acak"
                ],
                a: 0,
                k: "Pemeriksaan yang baik menilai kelengkapan dan relevansi setiap langkah."
            }
        ]
    },

    {
        n: "Pecah Sendiri",
        alat: "Papan pohon",
        info: "Susun sendiri pemecahan dua lapis. Hati-hati, ada pengecoh.",
        qs: [
            {
                t: "pick",
                p: "Masalah besar: “Mengadakan lomba antarkelas.” Pilih TIGA sub-masalah yang paling tepat.",
                c: [
                    "Menyusun jadwal dan aturan",
                    "Menyiapkan tempat dan perlengkapan",
                    "Mengatur panitia dan peserta",
                    "Mendesain seragam baru",
                    "Membeli kamera baru untuk panitia",
                    "Membeli hadiah untuk diri sendiri"
                ],
                a: [0, 1, 2],
                k: "Sub-masalah yang baik langsung mendukung terlaksananya lomba."
            },
            {
                t: "group",
                p: "Kelompokkan setiap langkah ke sub-masalah yang tepat.",
                g: [
                    "Jadwal dan aturan",
                    "Tempat dan perlengkapan",
                    "Panitia dan peserta"
                ],
                c: [
                    ["Menentukan waktu pertandingan", 0],
                    ["Menulis aturan lomba", 0],
                    ["Meminjam lapangan", 1],
                    ["Menyiapkan bola dan peluit", 1],
                    ["Mendaftar tim peserta", 2],
                    ["Membagi tugas wasit dan panitia", 2]
                ],
                k: "Setiap langkah masuk ke sub-masalah yang paling dekat maknanya."
            },
            {
                t: "pick",
                p: "Masalah besar: “Membuat majalah dinding kelas.” Pilih TIGA sub-masalah yang paling tepat.",
                c: [
                    "Mengumpulkan dan menyeleksi tulisan",
                    "Merancang tata letak dan hiasan",
                    "Memasang dan merawat mading",
                    "Membeli ponsel baru",
                    "Mengecat gedung sekolah",
                    "Membuat lagu kelas"
                ],
                a: [0, 1, 2],
                k: "Isi, tampilan, dan pemasangan adalah tiga bagian utama sebuah mading."
            },
            {
                t: "choice",
                f: 1,
                p: "Refleksi: mana ciri pemecahan masalah yang baik?",
                o: [
                    "Bagiannya jelas, tidak tumpang tindih, dan mencakup seluruh masalah",
                    "Bagiannya sebanyak mungkin",
                    "Hanya satu bagian yang sangat besar"
                ],
                a: 0,
                k: "Pemecahan yang baik lengkap dan setiap bagiannya punya tugas yang jelas."
            }
        ]
    },

    {
        n: "Urutkan",
        alat: "Panah urutan",
        info: "Susun langkah sesuai ketergantungannya. Kadang ada lebih dari satu urutan benar.",
        qs: [
            {
                t: "order",
                p: "Membuat teh manis. Ketuk langkah sesuai urutan pengerjaan.",
                c: [
                    "Merebus air",
                    "Menuang air ke gelas",
                    "Memasukkan teh dan gula ke gelas",
                    "Mengaduk"
                ],
                r: [
                    [0, 1],
                    [2, 1],
                    [1, 3]
                ],
                k: "Air harus matang sebelum dituang dan diaduk sesudahnya. Teh dan gula boleh dimasukkan lebih dulu atau sambil menunggu air."
            },
            {
                t: "order",
                p: "Menyiapkan presentasi kelompok. Ketuk langkah sesuai urutan pengerjaan.",
                c: [
                    "Menentukan topik",
                    "Mencari bahan",
                    "Menyusun slide",
                    "Menulis naskah",
                    "Berlatih presentasi"
                ],
                r: [
                    [0, 1],
                    [1, 2],
                    [1, 3],
                    [2, 4],
                    [3, 4]
                ],
                k: "Topik lebih dulu, lalu bahan. Slide dan naskah boleh bergantian, tetapi keduanya selesai sebelum berlatih."
            },
            {
                t: "order",
                p: "Mencuci dan menjemur pakaian. Ketuk langkah sesuai urutan pengerjaan.",
                c: [
                    "Mengumpulkan pakaian kotor",
                    "Memisahkan pakaian",
                    "Merendam dengan deterjen",
                    "Membilas",
                    "Menyiapkan tempat jemuran",
                    "Menjemur"
                ],
                r: [
                    [0, 1],
                    [1, 2],
                    [2, 3],
                    [3, 5],
                    [4, 5]
                ],
                k: "Tempat jemuran boleh disiapkan kapan saja, asalkan sebelum menjemur."
            },
            {
                t: "choice",
                f: 1,
                p: "Refleksi: mengapa urutan langkah penting?",
                o: [
                    "Beberapa langkah bergantung pada hasil langkah sebelumnya",
                    "Supaya cepat selesai apa pun urutannya",
                    "Urutan tidak pernah penting"
                ],
                a: 0,
                k: "Langkah yang bergantung pada langkah lain harus menunggu hasilnya."
            }
        ]
    }
];
