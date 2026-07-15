"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FaBuilding, FaUsers, FaDoorOpen, FaUserInjured, FaMoneyBillWave,
    FaCalendarCheck, FaArrowLeft, FaArrowRight, FaTimes, FaRocket,
    FaBook, FaCheck, FaLink, FaMapMarkerAlt,
} from "react-icons/fa"

/**
 * Birinchi kirishda chiqadigan onboarding oynasi.
 * Tizimni qaysi KETMA-KETLIKDA to'ldirish kerakligini qadam-baqadam tushuntiradi:
 * Filial → Xodim → Kabinet → Bemor → Xizmat narxlari → Qabul.
 * Har bir qadam bir-biriga bog'liqligini qisqa yoritadi.
 * Bir marta ko'rsatiladi (localStorage), "Keyingisi" bilan yuriladi.
 */

const DIRECTOR_STEPS = [
    {
        icon: <FaRocket />,
        color: "#0ea5e9",
        badge: "Xush kelibsiz!",
        title: "Tizimni to'g'ri ketma-ketlikda boshlang",
        where: null,
        text: "Klinika CRM'da hamma narsa bir-biriga BOG'LANGAN: qabul yaratish uchun shifokor, xona va bemor kerak; shifokor va xona esa filialga bog'lanadi. Shuning uchun tizimni quyidagi tartibda to'ldirish kerak — keyingi 6 qadamda har birini qisqacha tushuntirib beramiz.",
        chain: true,
    },
    {
        icon: <FaBuilding />,
        color: "#2563eb",
        badge: "1-qadam",
        title: "Filial yarating",
        where: "Chap menyu → Sozlamalar → Filial sozlamalari",
        text: "Filial — klinikangizning binosi (manzili). Bu POYDEVOR: xodim qaysi filialda ishlashi, kabinet qaysi filialda joylashgani, qabul qayerda o'tishi — hammasi filialga bog'lanadi. Filial yaratmasangiz, qolgan hech narsani qo'shib bo'lmaydi. Qavatlar sonini ham kiriting — kabinet yaratishda kerak bo'ladi.",
        depends: "Hech narsaga bog'liq emas — birinchi shu yaratiladi.",
    },
    {
        icon: <FaUsers />,
        color: "#7c3aed",
        badge: "2-qadam",
        title: "Xodim qo'shing (shifokor / admin)",
        where: "Chap menyu → Xodimlar",
        text: "Shifokorsiz qabul yaratib bo'lmaydi — bemor albatta shifokorga yoziladi. Xodim qo'shganda uning emailiga login-parol avtomatik boradi, oylik va KPI foizini belgilasangiz, tizim daromadini o'zi hisoblab boradi.",
        depends: "Filialga bog'liq — xodim qaysi filialda ishlashi tanlanadi.",
    },
    {
        icon: <FaDoorOpen />,
        color: "#0891b2",
        badge: "3-qadam",
        title: "Kabinet yarating",
        where: "Chap menyu → Kabinetlar",
        text: "Har bir qabul aniq bitta xonada o'tadi. Kabinet yaratib, unga shifokor biriktirsangiz, tizim xonalar bandligini o'zi kuzatadi — bitta xonaga bir vaqtda ikkita bemor yozilmaydi.",
        depends: "Filial (qavat tanlanadi) va Xodimga (shifokor biriktiriladi) bog'liq.",
    },
    {
        icon: <FaUserInjured />,
        color: "#16a34a",
        badge: "4-qadam",
        title: "Bemor qo'shing",
        where: "Chap menyu → Bemorlar",
        text: "Qabulga faqat ro'yxatdagi bemor yoziladi. Bemor bir marta ro'yxatga olinadi — keyin butun tarixi (qabullari, to'lovlari, qarzlari) kartasida saqlanib boradi va istalgan filialda qabul qilinadi.",
        depends: "Hech narsaga majburiy bog'liq emas, lekin qabul yozish uchun shart.",
    },
    {
        icon: <FaMoneyBillWave />,
        color: "#d97706",
        badge: "5-qadam",
        title: "Xizmat narxlarini kiriting",
        where: "Chap menyu → Xizmat narxlari",
        text: "Bu klinikangizning prays-listi. Shifokor davolash paytida qaysi xizmatni bajarganini tanlaydi — bemor to'lovi va shifokor KPI'si aynan shu narxlardan AVTOMATIK hisoblanadi. Narx kiritilmasa, tizimning pul qismi ishlamaydi.",
        depends: "Kategoriya yaratib, ichiga xizmatlarni narxi bilan qo'shasiz.",
    },
    {
        icon: <FaCalendarCheck />,
        color: "#dc2626",
        badge: "6-qadam",
        title: "Qabul yarating — hammasi birlashadi!",
        where: "Chap menyu → Qabullar",
        text: "Endi hamma narsa tayyor: qabul yaratganda Filial → Bemor → Shifokor → Xona → Sana → Vaqt tanlanadi. Tizim band vaqtlarni o'zi yopadi. Qabul yakunlangach to'lov va KPI avtomatik hisoblanadi. Batafsil yo'riqnoma: Yordam markazi → Qo'llanma.",
        depends: "Oldingi 5 qadamning HAMMASI shu yerda ishlatiladi.",
        last: true,
    },
]

const ADMIN_STEPS = [
    {
        icon: <FaRocket />,
        color: "#0ea5e9",
        badge: "Xush kelibsiz!",
        title: "Kunlik ishlaringiz tartibi",
        where: null,
        text: "Administrator sifatida asosiy ishingiz: bemorni ro'yxatga olish → qabulga yozish → kelganini belgilash → to'lov qabul qilish. Keyingi qadamlarda har birini qisqacha ko'rsatamiz.",
        chain: true,
    },
    {
        icon: <FaUserInjured />,
        color: "#16a34a",
        badge: "1-qadam",
        title: "Bemor qo'shing",
        where: "Chap menyu → Bemorlar",
        text: "Yangi kelgan bemorni avval ro'yxatga olasiz — ro'yxatda bo'lmagan bemorga qabul ochib bo'lmaydi. Bemorning butun tarixi (qabullar, to'lovlar, qarzlar) kartasida saqlanadi.",
        depends: "Hech narsaga bog'liq emas — istalgan payt qo'shasiz.",
    },
    {
        icon: <FaCalendarCheck />,
        color: "#dc2626",
        badge: "2-qadam",
        title: "Qabulga yozing",
        where: "Chap menyu → Jadval",
        text: "Bemorni shifokor qabuliga yozasiz: Filial → Bemor → Shifokor → Xona → Sana → Vaqt. Band vaqtlar avtomatik ko'rinmaydi. Bemor kelganda yashil «✓» tugmasini bosing — kechikish o'zi hisoblanadi.",
        depends: "Bemor ro'yxatda bo'lishi kerak; shifokor va xonani direktor kiritadi.",
    },
    {
        icon: <FaMoneyBillWave />,
        color: "#d97706",
        badge: "3-qadam",
        title: "Dori sotish va to'lovlar",
        where: "Chap menyu → Ombor dorilar / Bemor kartasi",
        text: "Bemorga dori sotsangiz zaxira avtomatik kamayadi. To'lovni bemor kartasidan qo'shasiz — qarz o'zi qayta hisoblanadi. Batafsil: Yordam markazi → Qo'llanma.",
        depends: "Dori omborda bo'lishi va bemor ro'yxatda bo'lishi kerak.",
        last: true,
    },
]

const DOCTOR_STEPS = [
    {
        icon: <FaRocket />,
        color: "#0ea5e9",
        badge: "Xush kelibsiz!",
        title: "Ish kuningiz qanday o'tadi",
        where: null,
        text: "Shifokor sifatida sizga 3 ta bo'lim kerak: Dashboard (bugungi holat), Jadval (qabullaringiz) va Vazifalar. Keyingi qadamlarda qisqacha tanishtiramiz.",
        chain: false,
    },
    {
        icon: <FaCalendarCheck />,
        color: "#dc2626",
        badge: "1-qadam",
        title: "Jadval — qabullaringiz",
        where: "Chap menyu → Jadval",
        text: "Admin bemorni sizga yozadi — qabul shu yerda chiqadi. Davolash tugmasini bossangiz tish xaritasi ochiladi: bajargan xizmatlaringizni tanlaysiz — bemor to'lovi va KPI daromadingiz shundan hisoblanadi.",
        depends: "Xizmatlar ro'yxatini direktor «Xizmat narxlari»da kiritadi.",
    },
    {
        icon: <FaUsers />,
        color: "#7c3aed",
        badge: "2-qadam",
        title: "Vazifalar",
        where: "Chap menyu → Vazifalar",
        text: "Direktor bergan topshiriqlar shu yerda ko'rinadi. Bajargach «Tugatish»ni bosing. O'zingizga ham vazifa yaratishingiz mumkin. Batafsil: Yordam markazi → Qo'llanma.",
        depends: null,
        last: true,
    },
]

const STEPS_BY_ROLE = {
    director: DIRECTOR_STEPS,
    admin: ADMIN_STEPS,
    doctor: DOCTOR_STEPS,
}

const CHAIN = ["Filial", "Xodim", "Kabinet", "Bemor", "Xizmat narxlari", "Qabul"]

export default function OnboardingWizard({ user }) {
    const navigate = useNavigate()
    const role = user?.role
    const steps = STEPS_BY_ROLE[role]
    const storageKey = `onboarding_seen_${user?.id || user?.email || role}`

    const [visible, setVisible] = useState(false)
    const [step, setStep] = useState(0)

    useEffect(() => {
        if (!steps) return
        try {
            if (!localStorage.getItem(storageKey)) {
                setVisible(true)
            }
        } catch (e) {
            // localStorage ishlamasa — oynani ko'rsatmaymiz
        }
    }, [storageKey, steps])

    if (!steps || !visible) return null

    const current = steps[step]
    const isLast = step === steps.length - 1

    const finish = () => {
        try {
            localStorage.setItem(storageKey, "1")
        } catch (e) { /* ignore */ }
        setVisible(false)
    }

    const openGuide = () => {
        finish()
        navigate("/dashboard/help")
    }

    return (
        <div className="ob-overlay">
            <div className="ob-modal" role="dialog" aria-modal="true">
                <button className="ob-skip" onClick={finish} title="Yopish">
                    <FaTimes />
                </button>

                {/* Progress nuqtalari */}
                <div className="ob-progress">
                    {steps.map((s, index) => (
                        <button
                            key={index}
                            className={`ob-dot ${index === step ? "active" : ""} ${index < step ? "done" : ""}`}
                            onClick={() => setStep(index)}
                            aria-label={`${index + 1}-qadam`}
                        >
                            {index < step ? <FaCheck /> : index + 1}
                        </button>
                    ))}
                </div>

                <div className="ob-body" key={step}>
                    <div className="ob-icon" style={{ background: `${current.color}18`, color: current.color }}>
                        {current.icon}
                    </div>
                    <div className="ob-badge" style={{ background: `${current.color}18`, color: current.color }}>
                        {current.badge}
                    </div>
                    <h2 className="ob-title">{current.title}</h2>

                    {current.where && (
                        <div className="ob-where">
                            <FaMapMarkerAlt /> {current.where}
                        </div>
                    )}

                    <p className="ob-text">{current.text}</p>

                    {/* Yaratish ketma-ketligi zanjiri (faqat kirish qadamida) */}
                    {current.chain && role === "director" && (
                        <div className="ob-chain">
                            {CHAIN.map((item, index) => (
                                <div className="ob-chain-item" key={item}>
                                    <span className="ob-chain-num">{index + 1}</span>
                                    <span className="ob-chain-name">{item}</span>
                                    {index < CHAIN.length - 1 && <FaArrowRight className="ob-chain-arrow" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {current.depends && (
                        <div className="ob-depends">
                            <FaLink /> <span>{current.depends}</span>
                        </div>
                    )}
                </div>

                <div className="ob-footer">
                    <button className="ob-btn ob-btn-ghost" onClick={finish}>
                        O'tkazib yuborish
                    </button>
                    <div className="ob-footer-right">
                        {step > 0 && (
                            <button className="ob-btn ob-btn-outline" onClick={() => setStep(step - 1)}>
                                <FaArrowLeft /> Orqaga
                            </button>
                        )}
                        {isLast ? (
                            <>
                                <button className="ob-btn ob-btn-outline" onClick={openGuide}>
                                    <FaBook /> Qo'llanmani ochish
                                </button>
                                <button className="ob-btn ob-btn-primary" onClick={finish}>
                                    Boshladik! <FaRocket />
                                </button>
                            </>
                        ) : (
                            <button className="ob-btn ob-btn-primary" onClick={() => setStep(step + 1)}>
                                Keyingisi <FaArrowRight />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
