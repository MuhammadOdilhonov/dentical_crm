"use client"

import { useState, useEffect } from "react"
import {
    FaChartLine, FaUsers, FaTasks, FaDoorOpen, FaCalendarCheck, FaCalendarAlt,
    FaPills, FaChartBar, FaMoneyBillWave, FaCog, FaChevronDown, FaChevronRight,
    FaArrowLeft, FaArrowRight, FaLightbulb, FaLink,
} from "react-icons/fa"

/**
 * Platforma qo'llanmasi — BUTUN EKRANDA ochiladi.
 * Chapda o'zining sidebar'i (yuqorida orqaga qaytish strelkasi),
 * o'ngda tanlangan bo'lim: "Nimaga kerak?" to'liq tushuntirish,
 * bog'liqliklar va qadma-qadam yo'riqnoma.
 * Rolga qarab tegishli bo'limlar chiqadi.
 */

const G = "/images/guide"

const GUIDE = {
    director: [
        {
            id: "dashboard", icon: <FaChartLine />, title: "Dashboard",
            why: [
                "Dashboard — bu klinikangizning «boshqaruv pulti». Direktor sifatida sizga har kuni yuzlab raqamlar kerak bo'ladi: bugun nechta bemor keldi, qancha daromad tushdi, qaysi filial yaxshi ishlayapti, nechta xodim bor. Bularning har birini alohida bo'limlardan qidirib yurish o'rniga, Dashboard hammasini bitta ekranda jamlab beradi.",
                "Bu bo'lim hech narsa YARATMAYDI — u boshqa bo'limlarda kiritilgan ma'lumotlarni yig'ib KO'RSATADI. Shuning uchun Dashboard'dagi raqamlar bo'sh bo'lsa, demak hali filial, xodim, bemor va qabullar kiritilmagan. Tizim to'ldirilgani sari Dashboard ham «jonlanadi».",
            ],
            related: "Bu yerdagi raqamlar Xodimlar, Bemorlar, Qabullar va Hisobotlar bo'limlaridan avtomatik yig'iladi.",
            topics: [
                {
                    id: "overview", title: "Umumiy ko'rinish",
                    image: `${G}/guide-director-dashboard.png`,
                    intro: "Tizimga kirganingizda birinchi ochiladigan sahifa — klinikangizning umumiy holati.",
                    steps: [
                        "Chap menyudan kerakli bo'limni tanlang — har bir bo'lim quyida alohida tushuntirilgan.",
                        "Tepadagi «Barcha filiallar» tugmasi bilan bitta filial yoki hammasini ko'rasiz — barcha raqamlar shunga qarab o'zgaradi.",
                        "Kartalarda: jami xodimlar, shifokorlar, filiallar, mijozlar, daromad/xarajat/foyda.",
                        "O'ng yuqoridagi ismingizni bossangiz — Profil va Chiqish menyusi ochiladi.",
                    ],
                },
            ],
        },
        {
            id: "settings", icon: <FaCog />, title: "Sozlamalar (Filial)",
            why: [
                "Sozlamalar bo'limi — butun tizimning POYDEVORI, chunki FILIAL shu yerda yaratiladi. Filial — bu klinikangizning jismoniy manzili (bino). Bitta klinikada bir yoki bir nechta filial bo'lishi mumkin.",
                "Nega filial birinchi yaratilishi shart? Chunki tizimdagi deyarli hamma narsa filialga «bog'lanadi»: xodim qaysi filialda ishlashi ko'rsatiladi, kabinet qaysi filialning nechanchi qavatida ekani belgilanadi, qabul qaysi filialda o'tishi tanlanadi, moliyaviy hisobotlar filial kesimida chiqadi. Filial yo'q bo'lsa — xodim ham, kabinet ham, qabul ham yaratib bo'lmaydi.",
                "Shu yerda tarifingizni ham ko'rasiz: nechta shifokor, admin va filial qo'sha olishingiz tarif limitiga bog'liq.",
            ],
            related: "Filial yaratilgach: Xodimlar → Kabinetlar → Bemorlar → Xizmat narxlari → Qabullar ketma-ketligida tizimni to'ldirasiz.",
            topics: [
                {
                    id: "branch", title: "Filial qo'shish",
                    image: `${G}/guide-director-settings.png`,
                    intro: "Yangi filial ochish — kabinet va xodimlar shu filialga bog'lanadi.",
                    steps: [
                        "Sozlamalar → «Filial sozlamalari» tabini oching.",
                        "«Filial qo'shish» tugmasini bosing.",
                        "Nom, manzil va telefon raqamini kiriting.",
                        "QAVATLAR SONINI yozing — kabinet yaratganda qavat ro'yxati shundan chiqadi.",
                        "«Saqlash»ni bosing. Kartadagi «Tahrirlash» bilan keyin o'zgartirasiz.",
                    ],
                },
                {
                    id: "tariff", title: "Tarifingizni ko'rish",
                    image: `${G}/guide-director-settings.png`,
                    intro: "Joriy tarif, limitlar va obuna muddati.",
                    steps: [
                        "«Tarifingiz bo'yicha» tabini oching.",
                        "Tarif nomi, narxi, muddati va limitlar (shifokor/admin/filial soni) ko'rinadi.",
                        "Limitga yetsangiz — yangi xodim/filial qo'shib bo'lmaydi, tarifni oshirish kerak.",
                    ],
                },
            ],
        },
        {
            id: "staff", icon: <FaUsers />, title: "Xodimlar",
            why: [
                "Xodimlar bo'limi — jamoangizni boshqarish markazi. Bu yerda shifokor va adminlarni tizimga qo'shasiz. Har bir qo'shilgan xodim o'z EMAILI orqali tizimga kiradi — ya'ni bu bo'lim orqali siz ularga tizimdan «kalit» berasiz.",
                "Nega bu kerak? Birinchidan, SHIFOKORSIZ QABUL YARATIB BO'LMAYDI — bemorni qabulga yozganda albatta shifokor tanlanadi. Ikkinchidan, oylik va KPI shu yerda belgilanadi: shifokor bajargan xizmatlardan necha foiz olishini kiritsangiz, tizim uning daromadini AVTOMATIK hisoblab boradi — qo'lda hisob-kitob kerak emas. Uchinchidan, xodim qaysi filialda ishlashi shu yerda belgilanadi — kabinetga biriktirishda va qabul yaratishda faqat o'sha filial xodimlari chiqadi.",
                "Admin roli esa kundalik ishlarni (bemor yozish, qabul ochish, to'lov olish) sizning o'rningizga bajaradigan xodim uchun.",
            ],
            related: "Xodim qo'shishdan avval FILIAL yaratilgan bo'lishi kerak (Sozlamalar). Xodim qo'shilgach — uni Kabinetga biriktirasiz va Qabullarda shifokor sifatida tanlaysiz. KPI hisoblanishi uchun Xizmat narxlari kiritilgan bo'lishi kerak.",
            topics: [
                {
                    id: "add", title: "Xodim qo'shish",
                    image: `${G}/guide-director-staff-form.png`,
                    intro: "Yangi shifokor yoki admin qo'shish. Login-parol xodim emailiga avtomatik yuboriladi.",
                    steps: [
                        "Xodimlar bo'limida o'ng yuqoridagi «+ Yangi xodim qo'shish» tugmasini bosing.",
                        "Email kiriting — bu xodimning LOGINI bo'ladi va parol shu manzilga boradi.",
                        "Ism, familiya va telefon raqamini yozing.",
                        "Rolni tanlang: Shifokor yoki Admin.",
                        "Ish turini tanlang: «Oylik» (faqat maosh), «KPI» (faqat foiz), «Oylik + KPI» (ikkalasi) yoki «Ish o'rganuvchi» (maoshsiz stajyor). Tanlovga qarab kerakli maydonlar o'zi chiqadi.",
                        "Filialni tanlang — xodim qaysi filialda ishlaydi.",
                        "«Qo'shish» tugmasini bosing. Xodim birinchi kirganda tizim undan parolni almashtirishni so'raydi.",
                    ],
                },
                {
                    id: "edit", title: "Ma'lumotlarini o'zgartirish",
                    image: `${G}/guide-director-staff.png`,
                    intro: "Xodimning oyligi, filiali, holati yoki boshqa ma'lumotlarini yangilash.",
                    steps: [
                        "Jadvaldagi xodim qatorida «Tahrirlash» (qalam) tugmasini bosing.",
                        "Istalgan maydonni o'zgartiring: oylik, KPI, filial, mutaxassislik...",
                        "Holatni «Nofaol» qilsangiz — xodim tizimga kira olmaydi (sabab yozish shart).",
                        "Holatni «Ta'tilda» qilsangiz — ta'til boshlanish/tugash sanasi va sababini kiriting.",
                        "«Saqlash» tugmasini bosing.",
                    ],
                },
                {
                    id: "delete", title: "Xodimni o'chirish",
                    image: `${G}/guide-director-staff.png`,
                    intro: "Ishdan ketgan xodimni tizimdan olib tashlash.",
                    steps: [
                        "Xodim qatoridagi «O'chirish» (chelak) tugmasini bosing.",
                        "Tasdiqlash oynasida «Tasdiqlash»ni bosing.",
                        "Diqqat: bu amal qaytarilmaydi! Vaqtincha to'xtatish uchun o'chirmasdan holatini «Nofaol» qiling.",
                    ],
                },
                {
                    id: "stats", title: "Statistika va KPI",
                    image: `${G}/guide-director-staff.png`,
                    intro: "Xodimlar soni, oylik fondi va shifokorlar KPI daromadi.",
                    steps: [
                        "Sahifa tepasidagi «Statistika» blokida: jami/faol/nofaol/ta'tildagi xodimlar va umumiy oylik fond.",
                        "«Shifokor KPI statistikasi» jadvalida har bir shifokorning KPI foizi va shu oyda ishlab topgan KPI summasi ko'rinadi.",
                        "Xodim qatoridagi ko'z belgisini bossangiz — to'liq ma'lumot va ish jadvali ochiladi.",
                    ],
                },
            ],
        },
        {
            id: "cabinets", icon: <FaDoorOpen />, title: "Kabinetlar",
            why: [
                "Kabinetlar — klinikangizdagi jismoniy xonalar (101-kabinet, jarrohlik xonasi va h.k.). Bu bo'lim xonalaringizni raqamli tizimga «ko'chiradi».",
                "Nega bu kerak? Har bir QABUL aynan bitta xonada o'tadi — qabul yaratganda tizim sizdan xonani tanlashni so'raydi. Kabinet kiritilmagan bo'lsa, qabul yaratib bo'lmaydi. Bundan tashqari, tizim xonalar bandligini kuzatadi: bitta vaqtda bitta xonaga ikkita bemor yozib yuborishning oldini oladi — bu klinikadagi tartibsizlikni yo'qotadi.",
                "Kabinetga doimiy shifokor va hamshira biriktirib qo'yish ham mumkin — shunda kim qaysi xonada ishlashi hammaga aniq bo'ladi. Xona ta'mirga chiqsa, holatini «Ta'mirlash» qilib qo'yasiz — unga qabul yozilmaydi.",
            ],
            related: "Kabinet yaratishdan avval FILIAL bo'lishi shart (qavat tanlanadi). Shifokor biriktirish uchun XODIM qo'shilgan bo'lishi kerak. Kabinet keyin QABUL yaratishda xona sifatida tanlanadi.",
            topics: [
                {
                    id: "add", title: "Kabinet qo'shish",
                    image: `${G}/guide-director-cabinet-form.png`,
                    intro: "Filialga yangi kabinet (xona) qo'shish.",
                    steps: [
                        "«+ Yangi kabinet qo'shish» tugmasini bosing.",
                        "AVVAL filialni tanlang — qavatlar ro'yxati o'sha filialning qavat soniga qarab chiqadi. Filial bo'lmasa shu yerda «Filial yaratish» tugmasi paydo bo'ladi.",
                        "Kabinet nomini yozing (masalan: 101-kabinet).",
                        "Turini tanlang: Terapevtik, Ortopedik, Jarrohlik va h.k.",
                        "Qavatni tanlang va holatini belgilang (Mavjud / Yaratilmoqda / Ta'mirlash).",
                        "Shifokor va hamshira biriktirish IXTIYORIY — keyin ham qo'shsa bo'ladi. Ro'yxatda faqat shu filial xodimlari chiqadi.",
                        "«Qo'shish»ni bosing.",
                    ],
                },
                {
                    id: "status", title: "Holatini o'zgartirish (ta'mir va h.k.)",
                    image: `${G}/guide-director-cabinets.png`,
                    intro: "Kabinet ta'mirga chiqsa yoki qayta ishga tushsa.",
                    steps: [
                        "Jadvaldagi kabinet qatorida «Tahrirlash»ni bosing.",
                        "«Holat» maydonini o'zgartiring: Ta'mirlash / Kabinet mavjud.",
                        "«Saqlash»ni bosing — bu haqda rahbariyatga avtomatik xabarnoma boradi.",
                        "Sahifa tepasida jami / mavjud / ta'mirdagi kabinetlar statistikasi ko'rinib turadi.",
                    ],
                },
            ],
        },
        {
            id: "patients", icon: <FaUsers />, title: "Bemorlar",
            why: [
                "Bemorlar bo'limi — klinikangizning mijozlar bazasi. Har bir bemor bir marta ro'yxatga olinadi va uning BUTUN TARIXI shu yerda saqlanadi: qachon kelgani, qaysi shifokorda davolangani, qancha to'lagani, qancha qarzi borligi, qanday dori olgani.",
                "Nega bu kerak? Birinchidan, QABULGA FAQAT RO'YXATDAGI BEMOR YOZILADI — bemor bazada bo'lmasa, unga qabul ochib bo'lmaydi. Ikkinchidan, qarzlar nazorati: bemor to'lovni to'liq qilmasa, tizim qarzini eslab qoladi va keyingi kelganida ko'rsatadi — birorta so'm yo'qolmaydi. Uchinchidan, bemor kartasi shifokorga davolash tarixini ko'rsatadi — qaysi tish davolangani, qanday xizmatlar qilingani.",
                "Bemor butun klinikaga tegishli — bitta filialda ro'yxatga olingan bemor istalgan filialda qabul qilinaveradi.",
            ],
            related: "Bemor qo'shilgach — unga QABUL yoziladi, TO'LOV qabul qilinadi va u OMBORdan dori sotib olishi mumkin. Qarzlari HISOBOTLARdagi «Qarzdor bemorlar»da ko'rinadi.",
            topics: [
                {
                    id: "add", title: "Bemor qo'shish",
                    image: `${G}/guide-director-patient-form.png`,
                    intro: "Yangi bemorni ro'yxatga olish. Bemor butun klinikaga tegishli — istalgan filialda qabul qilinadi.",
                    steps: [
                        "«+ Yangi bemor qo'shish» tugmasini bosing.",
                        "To'liq ism, yosh, jins va telefon raqamini kiriting.",
                        "Pasport ID va manzilni yozing.",
                        "Filial IXTIYORIY — tanlamasangiz ham bo'ladi, bemor klinika bo'yicha saqlanadi.",
                        "«Qo'shish»ni bosing.",
                    ],
                },
                {
                    id: "detail", title: "Bemor kartasi (ichiga kirish)",
                    image: `${G}/guide-director-patients.png`,
                    intro: "Bemorning to'liq tarixi: qabullar, qarzlar, dori xaridlari.",
                    steps: [
                        "Ro'yxatdagi bemor qatorini bosing — bemor kartasi ochiladi.",
                        "Kartada: shaxsiy va tibbiy ma'lumotlar, qarz xulosasi, barcha qabullari, dori xaridlari.",
                        "«Kelgan filiallari» ustunida bemor qaysi filiallarga borgani ko'rinadi.",
                        "Tepadagi PDF / Excel tugmalari bilan bemor ma'lumotini yuklab olasiz.",
                    ],
                },
                {
                    id: "payment", title: "To'lov qo'shish",
                    image: `${G}/guide-director-patients.png`,
                    intro: "Bemordan to'lov qabul qilish (qabulga bog'lanadi).",
                    steps: [
                        "Bemor kartasini oching va «To'lov qo'shish» tugmasini bosing.",
                        "Qaysi qabul uchun to'lov ekanini tanlang (bemorning qabuli bo'lishi kerak).",
                        "To'langan summani kiriting; kerak bo'lsa chegirma (summa yoki foiz) qo'shing.",
                        "«To'lovni saqlash»ni bosing — qarz avtomatik qayta hisoblanadi.",
                    ],
                },
                {
                    id: "export", title: "PDF / Excel yuklab olish",
                    image: `${G}/guide-director-patients.png`,
                    intro: "Bemorlar ro'yxatini fayl qilib olish.",
                    steps: [
                        "Bemorlar sahifasi tepasidagi «PDF» yoki «Excel» tugmasini bosing.",
                        "Fayl avtomatik yuklab olinadi (barcha bemorlar ro'yxati bilan).",
                    ],
                },
            ],
        },
        {
            id: "services", icon: <FaMoneyBillWave />, title: "Xizmat narxlari",
            why: [
                "Xizmat narxlari — klinikangizning rasmiy PRAYS-LISTI (narxnomasi). Bu yerda har bir xizmat (plomba qo'yish, tish olish, implant...) va uning narxi kiritiladi.",
                "Nega bu MUHIM? Chunki butun moliya shu bo'limga tayanadi: shifokor bemorni davolayotganda tish xaritasida qaysi xizmatni bajarganini TANLAYDI — tizim o'sha xizmat narxini avtomatik oladi va bemorning to'lovini shakllantiradi. Xizmat narxlari kiritilmagan bo'lsa — shifokor davolashda xizmat tanlay olmaydi, to'lov hisoblanmaydi, KPI ham ishlamaydi. Ya'ni narxsiz tizimning pul qismi butunlay to'xtab qoladi.",
                "Nega aynan shu yerda yaratiladi? Chunki narx BIR MARTA kiritiladi va hamma joyda BIR XIL ishlaydi — har bir shifokor o'zicha narx aytmaydi, chegirma va qarzlar aniq hisoblanadi, hisobotlarda daromad to'g'ri chiqadi. Narx o'zgarsa — shu yerda yangilaysiz, tarixi saqlanib qoladi.",
                "Kategoriyalar (Terapiya, Implantologiya...) xizmatlarni tartiblab turadi — shifokor davolashda keraklisini tez topadi.",
            ],
            related: "Xizmatlar shifokor davolash oynasida (tish xaritasida) tanlanadi → undan bemor TO'LOVI hisoblanadi → to'lovdan shifokor KPI'si hisoblanadi → hammasi HISOBOTLARda ko'rinadi.",
            topics: [
                {
                    id: "category", title: "Kategoriya yaratish",
                    image: `${G}/guide-director-services.png`,
                    intro: "Xizmatlarni guruhlash (Terapiya, Implantologiya...).",
                    steps: [
                        "«Kategoriyalar» tugmasini bosing.",
                        "«Yangi kategoriya» → nom kiriting → «Saqlash».",
                        "Kategoriyalarni shu oynada tahrirlash va o'chirish ham mumkin.",
                    ],
                },
                {
                    id: "service", title: "Xizmat va narx qo'shish",
                    image: `${G}/guide-director-services.png`,
                    intro: "Narxlar shu yerda belgilanadi — qabul to'lovi shundan hisoblanadi.",
                    steps: [
                        "«+ Yangi xizmat»ni bosing.",
                        "Nom (masalan: Plomba qo'yish), kategoriya va narxni kiriting.",
                        "«Barcha tishlar uchun yaratish» belgilansa — 32 ta tish uchun alohida yoziladi (tish xaritasida ishlatiladi).",
                        "«Saqlash»ni bosing. Kartadagi tugmalar: ko'rish, tahrirlash, narx tarixi, o'chirish.",
                    ],
                },
            ],
        },
        {
            id: "appointments", icon: <FaCalendarCheck />, title: "Qabullar",
            why: [
                "Qabullar — tizimning YURAGI. Klinikadagi asosiy jarayon aynan shu yerda boshlanadi: bemor shifokor qabuliga yoziladi, keladi, davolanadi va to'laydi.",
                "Nega bu kerak? Qabul yaratganda tizim BARCHA bo'limlarni birlashtiradi: qaysi FILIALda, qaysi BEMOR, qaysi SHIFOKORga, qaysi XONAda, qachon kelishi belgilanadi. Tizim band vaqtlarni o'zi biladi — bitta shifokorga yoki bitta xonaga bir vaqtda ikkita bemor yozilishining oldini oladi. Qog'oz daftardagi chalkashliklar butunlay yo'qoladi.",
                "Qabul holati butun jarayonni kuzatib boradi: Kutilmoqda → Qabul qilingan → Jarayonda → Yakunlangan. Bemor kechiksa, tizim buni avtomatik aniqlaydi va sizga xabar beradi. Yakunlangan qabuldan bemorning to'lovi va shifokorning KPI'si hisoblanadi.",
            ],
            related: "Qabul yaratish uchun 4 ta narsa TAYYOR bo'lishi kerak: Filial (Sozlamalar), Shifokor (Xodimlar), Kabinet va Bemor. To'lov to'g'ri chiqishi uchun Xizmat narxlari ham kiritilgan bo'lsin.",
            topics: [
                {
                    id: "add", title: "Qabul yaratish (6 qadam)",
                    image: `${G}/guide-director-appointment-form.png`,
                    intro: "Bemorni shifokor qabuliga yozish — 6 qadamli oyna.",
                    steps: [
                        "«+ Yangi qabul qo'shish» tugmasini bosing.",
                        "1-qadam: Filial va bemorni tanlang. Bemor ro'yxati BARCHA bemorlarni ko'rsatadi; yo'q bo'lsa «+ Yangi bemor qo'shish» tugmasi chiqadi.",
                        "2-qadam: Shifokorni tanlang (yo'q bo'lsa «+ Shifokor qo'shish» tugmasi).",
                        "3-qadam: Xonani tanlang (yo'q bo'lsa «+ Kabinet qo'shish» tugmasi).",
                        "4-qadam: Sanani tanlang.",
                        "5-qadam: Bo'sh vaqtlardan birini bosing (band vaqtlar ko'rinmaydi).",
                        "6-qadam: Izoh yozing (shikoyat, sabab) va «Qabul qo'shish»ni bosing.",
                    ],
                },
                {
                    id: "manage", title: "Qabulni boshqarish",
                    image: `${G}/guide-director-appointments.png`,
                    intro: "Tasdiqlash, bekor qilish, vaqtini o'zgartirish.",
                    steps: [
                        "Qabul qatoridagi uch nuqta (⋮) tugmasini bosing.",
                        "«Ko'rish» — to'liq ma'lumot; «Tahrirlash» — o'zgartirish; «Vaqtni o'zgartirish» — boshqa vaqtga ko'chirish.",
                        "«Qabul qilish» — bemor kelishini tasdiqlaysiz (holat: Qabul qilingan).",
                        "«Bekor qilish» — qabul bekor bo'ladi; «O'chirish» — butunlay o'chadi.",
                        "Holatlar rangi: sariq — Kutilmoqda, ko'k — Qabul qilingan, yashil — Yakunlangan, qizil — Bekor qilingan.",
                    ],
                },
                {
                    id: "late", title: "Bemor keldi / kechikdi",
                    image: `${G}/guide-admin-schedule.png`,
                    intro: "Bemor kelganini belgilash — kechikish avtomatik hisoblanadi.",
                    steps: [
                        "Bemor klinikaga kelganda qabul qatoridagi yashil «✓» tugmasini bosing.",
                        "Tizim kelgan vaqtni yozib oladi va belgilangan vaqt bilan solishtiradi.",
                        "5 daqiqadan ko'p kechikkan bo'lsa qatorda qizil «⏰ Kechikdi X daq» belgisi chiqadi va sizga xabarnoma keladi.",
                        "Bu statistika qaysi bemorlar doim kechikishini bilishga yordam beradi.",
                    ],
                },
            ],
        },
        {
            id: "tasks", icon: <FaTasks />, title: "Vazifalar",
            why: [
                "Vazifalar — jamoangizga topshiriq berish va bajarilishini nazorat qilish vositasi. Og'zaki aytilgan ish unutiladi, tizimga yozilgan vazifa esa YO'QOLMAYDI.",
                "Nega bu kerak? Siz xodimga vazifa berasiz (masalan: «Hisobotni tayyorla», «Yangi materiallarni qabul qil»), muddat va muhimlik darajasini belgilaysiz — vazifa o'sha xodimning panelida chiqadi. Xodim bajargach «Tugatish» tugmasini bosadi va siz buni kalendarda ko'rasiz. Kim nima qilayotgani, nima kechikayotgani — hammasi bir joyda.",
            ],
            related: "Vazifa berish uchun XODIMLAR bo'limida xodim qo'shilgan bo'lishi kerak (bajaruvchi tanlanadi).",
            topics: [
                {
                    id: "add", title: "Vazifa berish",
                    image: `${G}/guide-director-tasks.png`,
                    intro: "Xodimga muddatli vazifa biriktirish.",
                    steps: [
                        "O'ng yuqoridagi «+» tugmasini bosing (yoki kalendarda kerakli kunni bosing).",
                        "Vazifa sarlavhasi va tavsifini yozing.",
                        "Boshlanish va tugash sana-vaqtini belgilang.",
                        "Muhimlik darajasini tanlang: Kam / O'rta / Yuqori.",
                        "Bajaruvchini tanlang — vazifa o'sha xodimning panelida chiqadi.",
                        "«Vazifa yaratish»ni bosing.",
                    ],
                },
                {
                    id: "manage", title: "Kuzatish va o'zgartirish",
                    image: `${G}/guide-director-tasks.png`,
                    intro: "Vazifalar holatini kalendar orqali kuzatish.",
                    steps: [
                        "Kun / Hafta / Oy / Yil tugmalari bilan kalendar ko'rinishini almashtirasiz; «Ro'yxat ko'rinishi» — jadval shaklida.",
                        "Kalendardagi vazifani bossangiz tafsilotlar ochiladi: tahrirlash, holatini o'zgartirish, o'chirish mumkin.",
                        "Holatlar: Kutilmoqda → Jarayonda → Yakunlangan. Xodim o'zi ham «Tugatish» tugmasi bilan yakunlaydi.",
                        "Qidiruv maydonida vazifani nomi bo'yicha topasiz.",
                    ],
                },
            ],
        },
        {
            id: "medicine", icon: <FaPills />, title: "Ombor dorilar",
            why: [
                "Ombor dorilar — klinikadagi dori-darmon va materiallar hisobini yuritish bo'limi. Qaysi dori qancha qolgani, qachon muddati o'tishi, qancha sotilgani — hammasi shu yerda.",
                "Nega bu kerak? Dori sotilganda zaxira AVTOMATIK kamayadi — qo'lda sanash kerak emas. Zaxira siz belgilagan minimal miqdordan tushib ketsa, tizim OGOHLANTIRADI — «dori tugab qolibdi» degan vaziyat bo'lmaydi. Yaroqlilik muddati yaqinlashgan dorilar ham alohida ko'rsatiladi — eskirgan dori bemorga berilmaydi. Har bir sotuv bemor va shifokorga bog'lanadi — pul hisobotlarda aniq ko'rinadi.",
            ],
            related: "Dori BEMORga sotiladi (Bemorlar bazasidan tanlanadi) va sotuv summasi HISOBOTLARdagi daromadga qo'shiladi.",
            topics: [
                {
                    id: "add", title: "Dori qo'shish",
                    image: `${G}/guide-director-medicine.png`,
                    intro: "Omborga yangi dori kiritish.",
                    steps: [
                        "«Dorilar» tabiga o'ting.",
                        "Avval kategoriya kerak: «Kategoriya qo'shish» bilan yarating (masalan: Og'riq qoldiruvchi).",
                        "«Dori qo'shish»ni bosing: nom, kategoriya, filial, ishlab chiqaruvchi.",
                        "Doza (miqdor + birlik), tannarx va sotish narxini kiriting.",
                        "Zaxira miqdori va MINIMAL miqdorni yozing — zaxira shundan kamaysa tizim ogohlantiradi.",
                        "Yaroqlilik muddatini tanlang — muddati yaqinlashganda hisobotda chiqadi.",
                        "«Saqlash»ni bosing.",
                    ],
                },
                {
                    id: "sell", title: "Dori sotish",
                    image: `${G}/guide-director-medicine.png`,
                    intro: "Bemorga dori sotish — zaxira avtomatik kamayadi.",
                    steps: [
                        "Dori kartasidagi «Sotish» tugmasini bosing.",
                        "Bemorni qidirib tanlang va shifokorni belgilang.",
                        "Miqdorni kiriting; kerak bo'lsa chegirma foizini qo'shing.",
                        "«Saqlash»ni bosing — sotuv tarixga yoziladi, zaxira kamayadi.",
                        "Barcha sotuvlar «Sotuvlar» tabida ko'rinadi.",
                    ],
                },
                {
                    id: "control", title: "Zaxira nazorati",
                    image: `${G}/guide-director-medicine.png`,
                    intro: "Kam qolgan va muddati o'tayotgan dorilar.",
                    steps: [
                        "«Boshqaruv paneli» tabida: jami dorilar, kam zaxiradagilar, muddati o'tganlar, ombor qiymati.",
                        "Dori kartasidagi «Tuzatish» tugmasi bilan zaxirani qo'lda to'g'rilaysiz (inventarizatsiya).",
                        "Qidiruv maydonida nom yoki shtrix-kod bo'yicha topasiz.",
                    ],
                },
            ],
        },
        {
            id: "reports", icon: <FaChartBar />, title: "Hisobotlar",
            why: [
                "Hisobotlar — klinikangizning moliyaviy «rentgeni». Qancha pul kirdi, qancha chiqdi, sof foyda qancha, kim qarzdor — barchasi raqamlar va grafiklar bilan shu yerda.",
                "Nega bu kerak? Daromad bemor to'lovlaridan va dori sotuvlaridan AVTOMATIK yig'iladi — siz hech narsa qo'shib hisoblamaysiz. Xarajatlarni «Kassadan pul olish» orqali kiritasiz (ijara, materiallar, kommunal...) — tizim daromaddan ayirib SOF FOYDANI ko'rsatadi. Davrlar bo'yicha (kun/hafta/oy/yil) solishtirib, klinika o'sayotganini yoki pasayayotganini aniq bilasiz. «Qarzdor bemorlar» ro'yxati esa birorta qarz unutilmasligini ta'minlaydi.",
            ],
            related: "Daromad QABULLARdagi to'lovlar va OMBOR sotuvlaridan keladi. To'lovlar to'g'ri bo'lishi uchun XIZMAT NARXLARI kiritilgan bo'lishi kerak.",
            topics: [
                {
                    id: "finance", title: "Moliyaviy hisobot",
                    image: `${G}/guide-director-reports.png`,
                    intro: "Daromad, xarajat, foyda va rentabellik.",
                    steps: [
                        "«Moliyaviy» tabida davr tanlang: kun / hafta / oy / yil.",
                        "Kartalar: jami daromad (bemor to'lovlaridan), xarajat (kassadan olinganlar), sof foyda, rentabellik %.",
                        "Grafik va jadvalda davrlar bo'yicha taqsimot ko'rinadi.",
                        "«Hisobotni yuklab olish» tugmasi bilan faylga olasiz.",
                    ],
                },
                {
                    id: "withdraw", title: "Kassadan pul olish",
                    image: `${G}/guide-director-reports.png`,
                    intro: "Xarajatlarni qayd etish (ijaraga, materiallarga...).",
                    steps: [
                        "Tepadagi «Kassadan pul olish» tugmasini bosing.",
                        "Summa, sabab va izoh yozing.",
                        "Saqlang — bu xarajat sifatida moliyaviy hisobotga tushadi.",
                        "«Tarix» tugmasida barcha olingan pullar ro'yxati.",
                    ],
                },
                {
                    id: "debtors", title: "Qarzdor bemorlar",
                    image: `${G}/guide-director-reports.png`,
                    intro: "Kim qancha qarz — bir joyda.",
                    steps: [
                        "«Qarzdor bemorlar» tabini oching.",
                        "Har bir bemorning umumiy xizmat summasi, to'lagani va qolgan qarzi ko'rinadi.",
                        "Bemorni bosib kartasiga o'tasiz va u yerdan to'lov qo'shasiz.",
                    ],
                },
            ],
        },
    ],
    admin: [
        {
            id: "dashboard", icon: <FaChartLine />, title: "Dashboard",
            why: [
                "Dashboard — sizning kunlik ish stolingiz. Administrator sifatida kuningiz shu yerdan boshlanadi: bugun nechta bemor kutilmoqda, qaysi shifokorlar band, qanday vazifalar bor — hammasi bitta ekranda.",
                "Bu bo'lim hech narsa yaratmaydi — boshqa bo'limlardagi ma'lumotlarni jamlab ko'rsatadi. Raqam bo'sh bo'lsa, demak hali bemor/qabul kiritilmagan.",
            ],
            related: "Raqamlar Bemorlar, Jadval (Qabullar) va Vazifalar bo'limlaridan avtomatik yig'iladi.",
            topics: [
                {
                    id: "overview", title: "Umumiy ko'rinish",
                    image: `${G}/guide-admin-dashboard.png`,
                    intro: "Administrator paneli — kunlik ish holati.",
                    steps: [
                        "Kartalarda: jami bemorlar, shifokorlar, xonalar, qabullar.",
                        "Haftalik qabullar grafigi va bemorlar taqsimoti.",
                        "«So'nggi bemorlar» va «Kutilayotgan vazifalar» ro'yxatlari — «Ko'rish» bilan ichiga o'tasiz.",
                    ],
                },
            ],
        },
        {
            id: "patients", icon: <FaUsers />, title: "Bemorlar",
            why: [
                "Bemorlar — mijozlar bazasi va sizning asosiy ish qurolingiz. Yangi kelgan bemorni SHU YERDA ro'yxatga olasiz — ro'yxatda bo'lmagan bemorga qabul ochib bo'lmaydi.",
                "Har bir bemorning butun tarixi kartasida saqlanadi: qabullari, to'lovlari, qarzlari, dori xaridlari. Bemor to'lovni to'liq qilmasa, qarzi avtomatik yozilib boradi — keyingi kelganida ko'rasiz.",
            ],
            related: "Bemor qo'shilgach unga JADVALda qabul yoziladi va kartasidan TO'LOV qabul qilinadi.",
            topics: [
                {
                    id: "add", title: "Bemor qo'shish va kartasi",
                    image: `${G}/guide-director-patient-form.png`,
                    intro: "Yangi bemor ro'yxati va uning tarixi.",
                    steps: [
                        "«+ Yangi bemor qo'shish» → ism, yosh, telefon, pasport (filial ixtiyoriy).",
                        "Bemor qatorini bosib kartasiga kirasiz: qabullar, qarzlar, to'lov qo'shish.",
                        "PDF/Excel tugmalari bilan ro'yxatni yuklab olasiz.",
                    ],
                },
            ],
        },
        {
            id: "schedule", icon: <FaCalendarAlt />, title: "Jadval (Qabullar)",
            why: [
                "Jadval — sizning ENG ASOSIY bo'limingiz. Bemorlarni shifokor qabuliga yozish, kelganini belgilash, vaqtini o'zgartirish — kunlik ishingizning 80% shu yerda o'tadi.",
                "Qabul yaratganda tizim filial, bemor, shifokor, xona va vaqtni bog'laydi. Band vaqtlar avtomatik yopiladi — bitta shifokorga bir vaqtda ikkita bemor yozib yuborish MUMKIN EMAS. Bemor kelganda «✓» bosasiz — kechikkan bo'lsa tizim o'zi hisoblab, rahbariyatga xabar beradi.",
            ],
            related: "Qabul yozish uchun BEMOR ro'yxatda bo'lishi kerak; shifokor, xona va filialni direktor kiritadi. Yo'q bo'lsa, qabul oynasida «+ qo'shish» tugmalari chiqadi.",
            topics: [
                {
                    id: "add", title: "Qabul yaratish",
                    image: `${G}/guide-director-appointment-form.png`,
                    intro: "Bemorni qabulga yozish — 6 qadam.",
                    steps: [
                        "«+ Yangi qabul qo'shish»ni bosing.",
                        "Filial → Bemor → Shifokor → Xona → Sana → Vaqt → Izoh ketma-ketligida to'ldiring.",
                        "Ro'yxat bo'sh bo'lsa (masalan bemor yo'q) — pastda «+ qo'shish» tugmasi chiqadi, bosib yaratib qaytasiz.",
                        "Band vaqtlar avtomatik ko'rinmaydi — faqat bo'sh vaqt tanlanadi.",
                    ],
                },
                {
                    id: "arrive", title: "Bemor keldi / kechikdi",
                    image: `${G}/guide-admin-schedule.png`,
                    intro: "Kelgan bemorni belgilash — asosiy kunlik ishingiz.",
                    steps: [
                        "Bemor kelganda qatoridagi yashil «✓» tugmasini bosing.",
                        "Kechikish avtomatik hisoblanadi: 5+ daqiqa bo'lsa qizil «⏰ Kechikdi» belgisi chiqadi va rahbariyatga xabar boradi.",
                        "Uch nuqta (⋮) menyusida: Ko'rish, Tahrirlash, Vaqtni o'zgartirish, Qabul qilish, Bekor qilish.",
                        "Qabul yakunida to'lov qismiga o'tiladi.",
                    ],
                },
            ],
        },
        {
            id: "medicine", icon: <FaPills />, title: "Ombor dorilar",
            why: [
                "Ombor dorilar — dori-darmon hisobi. Bemorga dori sotasiz, zaxira avtomatik kamayadi, kam qolganda tizim ogohlantiradi.",
                "Har bir sotuv bemor va shifokorga bog'lanadi — pul hisobotlarda aniq ko'rinadi, hech narsa yo'qolmaydi.",
            ],
            related: "Dori BEMORLAR bazasidagi bemorga sotiladi; sotuv summasi klinika daromadiga qo'shiladi.",
            topics: [
                {
                    id: "sell", title: "Dori sotish va nazorat",
                    image: `${G}/guide-director-medicine.png`,
                    intro: "Bemorga dori berish va zaxira kuzatuvi.",
                    steps: [
                        "Dori kartasida «Sotish» → bemor, shifokor, miqdor → «Saqlash».",
                        "Zaxira avtomatik kamayadi; kam qolganda boshqaruv panelida ogohlantirish chiqadi.",
                        "«Dori qo'shish» va «Kategoriya qo'shish» bilan omborni to'ldirasiz.",
                    ],
                },
            ],
        },
    ],
    doctor: [
        {
            id: "dashboard", icon: <FaChartLine />, title: "Dashboard",
            why: [
                "Dashboard — kunlik ish stolingiz. Bugun qaysi bemorlar kelishi, qanday vazifalar berilgani — hammasi bitta ekranda. Ish kunini shu yerdan boshlaysiz.",
            ],
            related: "Ma'lumotlar Jadval va Vazifalar bo'limlaridan avtomatik yig'iladi.",
            topics: [
                {
                    id: "overview", title: "Umumiy ko'rinish",
                    image: `${G}/guide-doctor-dashboard.png`,
                    intro: "Kuningiz bir qarashda: qabullar, vazifalar, bemorlar.",
                    steps: [
                        "«Bugungi uchrashuvlar» — vaqti va bemor ismi; «Boshlash» bilan qabulga o'tasiz.",
                        "«Kutilayotgan vazifalar» — sizga berilgan vazifalar; «Tugatish» bilan yakunlaysiz.",
                        "«So'nggi bemorlar» — oxirgi qabul qilgan bemorlaringiz.",
                    ],
                },
            ],
        },
        {
            id: "schedule", icon: <FaCalendarAlt />, title: "Jadval",
            why: [
                "Jadval — sizga yozilgan barcha qabullar ro'yxati. Admin yoki direktor bemorni sizga yozadi — qabul shu yerda paydo bo'ladi.",
                "Qabulni boshlaganingizda tish xaritasi ochiladi: qaysi tishga qanday xizmat qilganingizni tanlaysiz — bemor to'lovi va sizning KPI'ingiz aynan shu tanlovdan hisoblanadi. Shuning uchun xizmatlarni to'g'ri belgilash muhim.",
            ],
            related: "Xizmatlar ro'yxati va narxlari direktor kiritgan XIZMAT NARXLARIdan olinadi; bajargan xizmatlaringizdan KPI daromadingiz hisoblanadi.",
            topics: [
                {
                    id: "view", title: "Qabullaringizni ko'rish",
                    image: `${G}/guide-doctor-schedule.png`,
                    intro: "Sizga yozilgan barcha qabullar.",
                    steps: [
                        "«Jadval / Kun / Hafta» ko'rinishlarini almashtirasiz; «Bugun» — faqat bugungilar.",
                        "Har qatorda: sana, vaqt, filial, bemor, xona, tashxis/izoh.",
                        "Qatordagi davolash tugmasini bosib qabulni boshlaysiz — tish xaritasi va xizmatlar oynasi ochiladi.",
                    ],
                },
            ],
        },
        {
            id: "tasks", icon: <FaTasks />, title: "Vazifalar",
            why: [
                "Vazifalar — direktor sizga bergan topshiriqlar va o'zingiz uchun yozgan ishlar ro'yxati. Bajargach «Tugatish»ni bosasiz — direktor buni o'z panelida ko'radi. Og'zaki topshiriqlar unutiladi, bu yerda hech narsa yo'qolmaydi.",
            ],
            related: "Direktor bergan vazifalar avtomatik shu yerga tushadi; holatini o'zgartirsangiz direktorga ko'rinadi.",
            topics: [
                {
                    id: "manage", title: "Vazifalar bilan ishlash",
                    image: `${G}/guide-doctor-tasks.png`,
                    intro: "Sizga berilgan va o'zingiz yaratgan vazifalar.",
                    steps: [
                        "«+» tugmasi bilan O'ZINGIZGA yangi vazifa yaratasiz.",
                        "Kalendardagi vazifani bosib holatini o'zgartirasiz: Kutilmoqda → Jarayonda → Yakunlangan.",
                        "Direktor bergan vazifalar ham shu yerda ko'rinadi.",
                    ],
                },
            ],
        },
    ],
}

export default function UserGuide({ role = "director", onClose }) {
    const sections = GUIDE[role] || GUIDE.director

    const [openSection, setOpenSection] = useState(sections[0]?.id)
    const [selected, setSelected] = useState({
        sectionId: sections[0]?.id,
        topicId: sections[0]?.topics[0]?.id,
    })
    // onClose berilmagan bo'lsa ham orqaga strelka ishlashi uchun ichki yopilish holati
    const [selfClosed, setSelfClosed] = useState(false)

    const handleClose = () => {
        if (onClose) {
            onClose()
        } else {
            setSelfClosed(true)
        }
    }

    // Fullscreen paytida orqa fon skrollini to'xtatish
    useEffect(() => {
        if (selfClosed) {
            document.body.style.overflow = ""
            return
        }
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = ""
        }
    }, [selfClosed])

    // ESC bosilsa yopish
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                if (onClose) {
                    onClose()
                } else {
                    setSelfClosed(true)
                }
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    const section = sections.find((s) => s.id === selected.sectionId) || sections[0]
    const topic = section?.topics.find((topicItem) => topicItem.id === selected.topicId) || section?.topics[0]

    // Oldingi/keyingi mavzuga o'tish uchun tekis ro'yxat
    const flat = sections.flatMap((s) => s.topics.map((topicItem) => ({ sectionId: s.id, topicId: topicItem.id })))
    const flatIndex = flat.findIndex((f) => f.sectionId === selected.sectionId && f.topicId === selected.topicId)

    const goTo = (index) => {
        const target = flat[index]
        if (!target) return
        setSelected(target)
        setOpenSection(target.sectionId)
        document.querySelector(".gd-content")?.scrollTo({ top: 0, behavior: "smooth" })
    }

    const selectSection = (s) => {
        if (openSection === s.id) {
            setOpenSection(null)
        } else {
            setOpenSection(s.id)
            setSelected({ sectionId: s.id, topicId: s.topics[0]?.id })
            document.querySelector(".gd-content")?.scrollTo({ top: 0 })
        }
    }

    if (selfClosed || !section || !topic) return null

    return (
        <div className="gd-fullscreen">
            {/* Chap navigatsiya: yuqorida orqaga strelka + bo'limlar */}
            <aside className="gd-nav">
                <div className="gd-nav-top">
                    <button className="gd-back-btn" onClick={handleClose} title="Orqaga qaytish" aria-label="Orqaga qaytish">
                        <FaArrowLeft />
                    </button>
                    <div className="gd-nav-title">
                        <span className="gd-nav-title-main">Qo'llanma</span>
                        <span className="gd-nav-title-sub">Tizimdan foydalanish bo'yicha</span>
                    </div>
                </div>

                <div className="gd-nav-list">
                    {sections.map((s) => (
                        <div className="gd-nav-section" key={s.id}>
                            <button
                                className={`gd-nav-header ${openSection === s.id ? "open" : ""}`}
                                onClick={() => selectSection(s)}
                            >
                                <span className="gd-nav-icon">{s.icon}</span>
                                <span className="gd-nav-label">{s.title}</span>
                                {openSection === s.id ? <FaChevronDown /> : <FaChevronRight />}
                            </button>
                            {openSection === s.id && (
                                <div className="gd-nav-topics">
                                    {s.topics.map((topicItem) => (
                                        <button
                                            key={topicItem.id}
                                            className={`gd-nav-topic ${
                                                selected.sectionId === s.id && selected.topicId === topicItem.id ? "active" : ""
                                            }`}
                                            onClick={() => {
                                                setSelected({ sectionId: s.id, topicId: topicItem.id })
                                                document.querySelector(".gd-content")?.scrollTo({ top: 0 })
                                            }}
                                        >
                                            {topicItem.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* O'ng kontent: nimaga kerak + qadamlar + skrinshot */}
            <div className="gd-content">
                <div className="gd-content-inner">
                    <div className="gd-breadcrumb">
                        {section.title} <FaChevronRight size={10} /> <strong>{topic.title}</strong>
                    </div>
                    <h1 className="gd-title">{section.title}</h1>

                    {/* Bo'lim nimaga kerak — to'liq tushuntirish */}
                    {section.why && (
                        <div className="gd-why">
                            <div className="gd-why-head">
                                <FaLightbulb /> Bu bo'lim nimaga kerak?
                            </div>
                            {section.why.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    )}

                    {/* Boshqa bo'limlarga bog'liqligi */}
                    {section.related && (
                        <div className="gd-related">
                            <FaLink /> <span><strong>Bog'liqligi:</strong> {section.related}</span>
                        </div>
                    )}

                    <h2 className="gd-topic-title">{topic.title}</h2>
                    <p className="gd-intro">{topic.intro}</p>

                    <div className="gd-image-wrap">
                        <img src={topic.image} alt={topic.title} loading="lazy" />
                    </div>

                    <h3 className="gd-steps-title">Qadma-qadam:</h3>
                    <ol className="gd-steps">
                        {topic.steps.map((step, index) => (
                            <li key={index}>
                                <span className="gd-step-num">{index + 1}</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>

                    <div className="gd-pager">
                        <button disabled={flatIndex <= 0} onClick={() => goTo(flatIndex - 1)}>
                            <FaArrowLeft /> Oldingi
                        </button>
                        <span>{flatIndex + 1} / {flat.length}</span>
                        <button disabled={flatIndex >= flat.length - 1} onClick={() => goTo(flatIndex + 1)}>
                            Keyingi <FaArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
