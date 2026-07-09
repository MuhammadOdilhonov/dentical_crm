"use client"

import { useState, useRef, useEffect } from "react"
import {
    FaUsers,
    FaInstagram,
    FaTelegramPlane,
    FaChartLine,
    FaHeadset,
    FaEnvelope,
    FaPhone,
    FaHospital,
    FaArrowDown,
    FaComments,
    FaStar,
    FaRocket,
    FaGem,
    FaLightbulb,
    FaCheckCircle,
    FaArrowRight,
    FaQuoteLeft,
    FaCrown,
    FaFire,
    FaHeart,
    FaShieldAlt,
    FaBolt,
    FaMagic,
    FaInfinity,
    FaYoutube,
    FaCog,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import apiHome from "../../api/apiHome"

export default function Home() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("overview")
    const [showAllFunctions, setShowAllFunctions] = useState(false)
    const [isVisible, setIsVisible] = useState({})
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_number: "",
        clinic_name: "",
    })
    const contactFormRef = useRef(null)

    // Intersection Observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({
                            ...prev,
                            [entry.target.id]: true,
                        }))
                    }
                })
            },
            { threshold: 0.1 },
        )

        const elements = document.querySelectorAll("[data-animate]")
        elements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const contactData = {
                name: formData.name || "User",
                email: formData.email,
                phone_number: formData.phone_number,
                clinic_name: formData.clinic_name,
            }

            await apiHome.sendContactRequest(contactData)

            alert("Ma'lumotlaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz.")

            setFormData({
                name: "",
                email: "",
                phone_number: "",
                clinic_name: "",
            })
        } catch (error) {
            console.error("Error submitting form:", error)
            alert("Ma'lumotlarni yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.")
        }
    }

    const scrollToContactForm = () => {
        contactFormRef.current.scrollIntoView({ behavior: "smooth" })
    }

    const handleShowMore = () => {
        setShowAllFunctions(true)
    }

    const LoginTransition = () => {
        navigate("/login")
    }

    // Stats data
    const stats = [
        { number: "20+", label: "Faol Klinikalar", icon: FaHospital },
        { number: "250+", label: "Baxtli Bemorlar", icon: FaHeart },
        { number: "99.9%", label: "Tizim Ishonchliligi", icon: FaShieldAlt },
        { number: "24/7", label: "Texnik Yordam", icon: FaHeadset },
    ]

    // Features data with modern icons
    const modernFeatures = [
        {
            icon: FaChartLine,
            title: "Ilg'or Tahlil Tizimi",
            description: "Klinika faoliyatini chuqur tahlil qiling va samarali qarorlar qabul qiling",
            gradient: "from-purple-500 to-pink-500",
        },
        {
            icon: FaGem,
            title: "Premium Interfeys",
            description: "Zamonaviy va qulay interfeys bilan barcha ma'lumotlarni oson boshqaring",
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            icon: FaBolt,
            title: "Tez Ishlash",
            description: "Yuqori tezlikda ma'lumotlarni qayta ishlash va natijalarni ko'rsatish",
            gradient: "from-yellow-500 to-orange-500",
        },
        {
            icon: FaShieldAlt,
            title: "Yuqori Xavfsizlik",
            description: "Eng yuqori darajadagi xavfsizlik va ma'lumotlar himoyasi",
            gradient: "from-green-500 to-teal-500",
        },
        {
            icon: FaCog,
            title: "Aqlli Avtomatlashtirish",
            description: "Avtomatik jarayonlar va aqlli yechimlar bilan vaqtingizni tejang",
            gradient: "from-indigo-500 to-purple-500",
        },
        {
            icon: FaInfinity,
            title: "Cheksiz Imkoniyatlar",
            description: "Klinikangiz o'sishi bilan birga tizim ham kengayadi",
            gradient: "from-red-500 to-pink-500",
        },
    ]

    // Function items data with enhanced descriptions
    const functionItems = [
        {
            id: 1,
            title: "🔐 Xavfsiz Kirish Tizimi",
            description:
                "Zamonaviy xavfsizlik tizimi bilan klinikangizga xavfsiz kirish. Har bir foydalanuvchi uchun shaxsiy profil va ruxsatlar tizimi. Ikki bosqichli autentifikatsiya va ma'lumotlar shifrlash bilan to'liq himoya.",
            image: "./images/Dentical_Login.png",
            alt: "Xavfsiz login sahifasi",
            reverse: false,
            badge: "🔒 Xavfsiz",
            color: "from-emerald-400 to-cyan-400",
        },
        {
            id: 2,
            title: "📊 Boshqaruv Paneli",
            description:
                "Klinika faoliyatining barcha ko'rsatkichlarini bir joyda ko'ring. Real vaqt rejimida statistikalar, grafiklar va hisobotlar. Bemor oqimi, daromad tahlili va xodimlar samaradorligini kuzatish imkoniyati.",
            image: "./images/Dentical_Dashboard.png",
            alt: "Boshqaruv paneli interfeysi",
            reverse: true,
            badge: "📈 Tahlil",
            color: "from-violet-400 to-purple-400",
        },
        {
            id: 3,
            title: "🏢 Kabinetlar Boshqaruvi",
            description:
                "Klinikadagi barcha kabinetlarni samarali boshqaring. Xonalar holati, jihozlar nazorati va jadval rejalashtirish. Kabinetlar bandligi va foydalanish statistikasini kuzatish imkoniyati.",
            image: "./images/Dentical_Kabinetlar.png",
            alt: "Kabinetlar boshqaruvi interfeysi",
            reverse: false,
            badge: "🏥 Boshqaruv",
            color: "from-orange-400 to-red-400",
        },
        {
            id: 4,
            title: "👥 Bemorlar Ro'yxati",
            description:
                "Bemorlarni ro'yxatga olish va ma'lumotlarni boshqarish tizimi. Bemor ma'lumotlari, tibbiy tarix va uchrashuvlar jadvali. Qidiruv va filtrlash imkoniyatlari bilan tez topish.",
            image: "./images/Dentical_AdminBemorlarRo`yhat.png",
            alt: "Bemorlar ro'yxati interfeysi",
            reverse: true,
            badge: "👤 Bemorlar",
            color: "from-pink-400 to-rose-400",
        },
        {
            id: 5,
            title: "🦷 3D Tish Modeli",
            description:
                "Tishlarning 3D modelini ko'rish va tahlil qilish imkoniyati. Bemorlar bilan vizual tushuntirish va davolash rejasini ko'rsatish. Interaktiv 3D model bilan aniq diagnostika.",
            image: "./images/Dentical_3DTeeth.png",
            alt: "3D tish modeli interfeysi",
            reverse: false,
            badge: "🦷 3D Model",
            color: "from-teal-400 to-blue-400",
        },
        {
            id: 6,
            title: "📋 Vazifalar Boshqaruvi",
            description:
                "Klinikadagi barcha vazifalarni rejalashtiring va kuzatib boring. Xodimlar o'rtasida vazifalarni taqsimlash va bajarilish holatini nazorat qilish. Eslatmalar va bildirishnomalar tizimi.",
            image: "./images/Dentical_Tasks.png",
            alt: "Vazifalar boshqaruvi interfeysi",
            reverse: true,
            badge: "✅ Vazifalar",
            color: "from-indigo-400 to-purple-400",
        },
        {
            id: 7,
            title: "📅 Shifokor Jadvali",
            description:
                "Shifokorlarning ish jadvalini tuzish va boshqarish. Ish vaqti, dam olish kunlari va maxsus uchrashuvlarni rejalashtirish. Jadval to'qnashuvlarini oldini olish va optimal taqsimlash.",
            image: "./images/Dentical_DoctorJadval.png",
            alt: "Shifokor jadvali interfeysi",
            reverse: false,
            badge: "⏰ Jadval",
            color: "from-green-400 to-emerald-400",
        },
        {
            id: 8,
            title: "📄 Bemorlar Tibbiy Tarixi",
            description:
                "Bemorlarning to'liq tibbiy tarixini saqlash va boshqarish. Oldingi davolashlar, allergiyalar va tibbiy ma'lumotlar. Xavfsiz saqlash va tez qidiruv imkoniyatlari.",
            image: "./images/Dentical_BemorlarTibbiyTarixi.png",
            alt: "Bemorlar tibbiy tarixi interfeysi",
            reverse: true,
            badge: "📋 Tarix",
            color: "from-purple-400 to-pink-400",
        },
    ]

    const visibleFunctions = showAllFunctions ? functionItems : functionItems.slice(0, 5)

    // Testimonials data
    const testimonials = [
        {
            name: "Dr. Aziz Karimov",
            position: "Bosh Stomatolog",
            clinic: "Premium Dental Clinic",
            text: "Dentical tizimi bizning klinikamizni butunlay o'zgartirdi. Endi biz ancha samarali ishlaymiz!",
            rating: 5,
            avatar: "/placeholder.svg?height=80&width=80",
        },
        {
            name: "Nilufar Rahimova",
            position: "Klinika Direktori",
            clinic: "Smart Dental Center",
            text: "Tahlil tizimi bizga klinika faoliyatini yaxshi tushunish imkonini berdi. Bu haqiqatan ham ajoyib!",
            rating: 5,
            avatar: "/placeholder.svg?height=80&width=80",
        },
        {
            name: "Dr. Bobur Toshev",
            position: "Stomatolog",
            clinic: "Future Dental",
            text: "3D tish modeli bemorlarimni hayratda qoldiradi. Bu zamonaviy texnologiya!",
            rating: 5,
            avatar: "/placeholder.svg?height=80&width=80",
        },
    ]

    return (
        <div className="home-container">
            {/* Floating particles background */}
            <div className="particles-bg">
                {[...Array(50)].map((_, i) => (
                    <div key={i} className={`particle particle-${i % 5}`} />
                ))}
            </div>

            {/* Hero Section */}
            <header className="hero-section">
                {/* Floating Contact Bar */}
                <div className="floating-contact-bar">
                    <div className="contact-items">
                        <a href="tel:+998200248333" className="contact-item phone-item">
                            <FaPhone />
                            <span>+998 20 024 83 33</span>
                        </a>
                        <a
                            href="https://t.me/denticaluz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-item telegram-item"
                        >
                            <FaTelegramPlane />
                            <span>@denticaluz</span>
                        </a>
                        <a
                            href="https://www.instagram.com/dentical.crm/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-item instagram-item"
                        >
                            <FaInstagram />
                            <span>@dentical.crm</span>
                        </a>
                        <a
                            href="https://t.me/dentical_crm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-item channel-item"
                        >
                            <FaComments />
                            <span>@dentical_crm</span>
                        </a>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="hero-content">
                    <div className="hero-left" data-animate id="hero-left">
                        <div className="logo-section">
                            <div className="logo-container">
                                <div className="logo-wrapper">
                                    <img src="./images/dentical_logo.png" alt="Dentical Logo" className="logo" />
                                    <div className="logo-glow"></div>
                                </div>
                                <div className="brand-text">
                                    <h1 className="brand-name">
                                        Dentical
                                        {/* <span className="brand-badge">
                                            <FaCrown />
                                            CRM
                                        </span> */}
                                    </h1>
                                    <div className="brand-tagline">Zamonaviy Dental CRM Tizimi</div>
                                </div>
                            </div>
                        </div>

                        <div className="hero-description">
                            <h2 className="hero-title">
                                Klinikangizni
                                <span className="gradient-text"> Yangi Darajaga </span>
                                Olib Chiqing
                            </h2>
                            <p className="hero-subtitle">
                                Zamonaviy texnologiyalar bilan yaratilgan eng ilg'or stomatologiya boshqaruv tizimi. Klinikangizni
                                samarali va professional darajada boshqaring!
                            </p>
                        </div>

                        <div className="hero-features">
                            {[
                                { icon: FaChartLine, text: "Ilg'or Tahlil" },
                                { icon: FaShieldAlt, text: "Xavfsiz Tizim" },
                                { icon: FaCog, text: "Aqlli Boshqaruv" },
                                { icon: FaGem, text: "Premium Tajriba" },
                            ].map((feature, index) => (
                                <div key={index} className="hero-feature">
                                    <div className="feature-icon">
                                        <feature.icon />
                                    </div>
                                    <span>{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="hero-actions">
                            <button className="primary-btn" onClick={LoginTransition}>
                                <FaRocket />
                                Tizimga Kirish
                                <div className="btn-glow"></div>
                            </button>
                            <button className="secondary-btn" onClick={scrollToContactForm}>
                                <FaLightbulb />
                                Batafsil Ma'lumot
                                <FaArrowDown />
                            </button>
                        </div>

                        {/* Floating Stats */}
                        <div className="floating-stats">
                            {stats.map((stat, index) => (
                                <div key={index} className="stat-card">
                                    <div className="stat-icon">
                                        <stat.icon />
                                    </div>
                                    <div className="stat-content">
                                        <div className="stat-number">{stat.number}</div>
                                        <div className="stat-label">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hero-right" data-animate id="hero-right">
                        <div className="hero-visual">
                            <div className="main-image-container">
                                <img src="./images/Dentical_Dashboard.png" alt="Zamonaviy Dashboard" className="main-image" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="scroll-indicator">
                    <div className="scroll-text">Batafsil Ma'lumot</div>
                    <div className="scroll-arrow">
                        <FaArrowDown />
                    </div>
                </div>
            </header>

            {/* Modern Features Section */}
            <section className="modern-features-section" data-animate id="modern-features">
                <div className="section-container">
                    <div className="section-header">
                        <div className="section-badge">
                            <FaMagic />
                            Zamonaviy Texnologiyalar
                        </div>
                        <h2 className="section-title">
                            Nima uchun <span className="gradient-text">Dentical</span> tanlanadi?
                        </h2>
                        <p className="section-subtitle">
                            Eng so'nggi texnologiyalar va professional yondashuvlar bilan yaratilgan yechimlar
                        </p>
                    </div>

                    <div className="features-grid">
                        {modernFeatures.map((feature, index) => (
                            <div key={index} className="feature-card modern-card">
                                <div className={`feature-icon-wrapper bg-gradient-to-r ${feature.gradient}`}>
                                    <feature.icon className="feature-icon" />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-glow"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enhanced Functions Section */}
            <section className="enhanced-functions-section" data-animate id="enhanced-functions">
                <div className="section-container">
                    <div className="section-header">
                        <div className="section-badge">
                            <FaFire />
                            Asosiy Imkoniyatlar
                        </div>
                        <h2 className="section-title">
                            <span className="gradient-text">Tizim</span> Funksiyalari
                        </h2>
                        <p className="section-subtitle">
                            Har bir funksiya professional darajada ishlab chiqilgan va foydalanish uchun qulay
                        </p>
                    </div>

                    <div className="functions-container">
                        {visibleFunctions.map((item, index) => (
                            <div key={item.id} className={`function-item enhanced-item ${item.reverse ? "reverse" : ""}`}>
                                <div className="function-content">
                                    <div className="function-badge">
                                        <span className="badge-text">{item.badge}</span>
                                        <div className="badge-glow"></div>
                                    </div>
                                    <h3 className="function-title">{item.title}</h3>
                                    <p className="function-description">{item.description}</p>
                                    <div className="function-features">
                                        <div className="feature-tag">
                                            <FaCheckCircle />
                                            Professional
                                        </div>
                                        <div className="feature-tag">
                                            <FaCheckCircle />
                                            Tez
                                        </div>
                                        <div className="feature-tag">
                                            <FaCheckCircle />
                                            Xavfsiz
                                        </div>
                                    </div>
                                </div>
                                <div className="function-visual">
                                    <div className="image-container">
                                        <img src={item.image || "/placeholder.svg"} alt={item.alt} className="function-image" />
                                        <div className={`image-gradient bg-gradient-to-r ${item.color}`}></div>
                                        <div className="image-effects">
                                            <div className="effect-1"></div>
                                            <div className="effect-2"></div>
                                            <div className="effect-3"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {!showAllFunctions && (
                            <div className="show-more-section">
                                <button className="show-more-btn cosmic-btn" onClick={handleShowMore}>
                                    <div className="btn-content">
                                        <FaRocket className="btn-icon" />
                                        <span>Ko'proq Funksiyalar</span>
                                        <FaArrowRight className="btn-arrow" />
                                    </div>
                                    <div className="cosmic-glow"></div>
                                </button>
                                <p className="show-more-text">Yana 3 ta ajoyib funksiya sizni kutmoqda!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            {/* <section className="testimonials-section" data-animate id="testimonials">
                <div className="section-container">
                    <div className="section-header">
                        <div className="section-badge">
                            <FaHeart />
                            Mijozlar Fikri
                        </div>
                        <h2 className="section-title">
                            Bizning <span className="gradient-text">Mijozlarimiz</span> Fikri
                        </h2>
                        <p className="section-subtitle">Dentical tizimidan foydalanayotgan klinikalar fikri</p>
                    </div>

                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card">
                                <div className="testimonial-header">
                                    <div className="testimonial-avatar">
                                        <img src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                                        <div className="avatar-glow"></div>
                                    </div>
                                    <div className="testimonial-info">
                                        <h4 className="testimonial-name">{testimonial.name}</h4>
                                        <p className="testimonial-position">{testimonial.position}</p>
                                        <p className="testimonial-clinic">{testimonial.clinic}</p>
                                    </div>
                                </div>
                                <div className="testimonial-content">
                                    <FaQuoteLeft className="quote-icon" />
                                    <p className="testimonial-text">{testimonial.text}</p>
                                    <div className="testimonial-rating">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <FaStar key={i} className="star" />
                                        ))}
                                    </div>
                                </div>
                                <div className="testimonial-glow"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Enhanced Contact Section */}
            <section className="enhanced-contact-section" ref={contactFormRef} data-animate id="enhanced-contact">
                <div className="section-container">
                    <div className="section-header">
                        <div className="section-badge">
                            <FaRocket />
                            Bizga Qo'shiling
                        </div>
                        <h2 className="section-title">
                            Klinikangizni <span className="gradient-text">Rivojlantiring</span>
                        </h2>
                        <p className="section-subtitle">
                            Klinikangizni zamonaviy darajaga olib chiqish uchun bizning mutaxassislarimiz bilan bog'laning
                        </p>
                    </div>

                    <div className="contact-container">
                        <div className="contact-info">
                            <div className="info-header">
                                <h3>🚀 Zamonaviy Klinika Yarating</h3>
                                <p>
                                    Eng so'nggi texnologiyalar va professional yondashuvlar bilan klinikangizni yangi darajaga olib
                                    chiqing. Bizning mutaxassislarimiz sizga har qadamda yordam beradi.
                                </p>
                            </div>

                            <div className="cosmic-features">
                                {[
                                    { icon: FaHeadset, text: "24/7 Yordam" },
                                    { icon: FaShieldAlt, text: "Xavfsiz Tizim" },
                                    { icon: FaChartLine, text: "Professional Tahlil" },
                                    { icon: FaInfinity, text: "Cheksiz Imkoniyatlar" },
                                ].map((feature, index) => (
                                    <div key={index} className="cosmic-feature">
                                        <div className="cosmic-icon">
                                            <feature.icon />
                                        </div>
                                        <span>{feature.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="contact-methods">
                                <a href="tel:+998200248333" className="contact-method phone-method">
                                    <FaPhone />
                                    <span>+998 20 024 83 33</span>
                                </a>
                                <a href="https://t.me/denticaluz" className="contact-method telegram-method">
                                    <FaTelegramPlane />
                                    <span>@denticaluz</span>
                                </a>
                            </div>
                        </div>

                        <div className="contact-form-wrapper">
                            <form className="cosmic-form" onSubmit={handleSubmit}>
                                <div className="form-header">
                                    <h4>🌟 Ro'yxatdan O'ting</h4>
                                    <p>Ma'lumotlaringizni kiriting va biz siz bilan bog'lanamiz</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="name">
                                            <FaUsers />
                                            Ismingiz
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Ismingizni kiriting"
                                            className="cosmic-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">
                                            <FaEnvelope />
                                            Elektron Pochta
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="email@example.com"
                                            className="cosmic-input"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone_number">
                                            <FaPhone />
                                            Telefon Raqam
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone_number"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            placeholder="+998 90 123 45 67"
                                            className="cosmic-input"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="clinic_name">
                                            <FaHospital />
                                            Klinika Nomi
                                        </label>
                                        <input
                                            type="text"
                                            id="clinic_name"
                                            name="clinic_name"
                                            value={formData.clinic_name}
                                            onChange={handleInputChange}
                                            placeholder="Klinika nomini kiriting"
                                            className="cosmic-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="cosmic-submit-btn">
                                    <div className="btn-content">
                                        <FaRocket />
                                        <span>Yuborish</span>
                                        <FaArrowRight />
                                    </div>
                                    <div className="btn-particles">
                                        {[...Array(10)].map((_, i) => (
                                            <div key={i} className="particle" />
                                        ))}
                                    </div>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="cosmic-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src="./images/dentical_logo.png" alt="Dentical" />
                        <span>Dentical CRM</span>
                    </div>
                    <p className="footer-text">Zamonaviy stomatologiya boshqaruv tizimi</p>
                    <div className="footer-social">
                        <a href="https://t.me/denticaluz" className="social-link">
                            <FaTelegramPlane />
                        </a>
                        <a href="https://www.instagram.com/dentical.crm/" className="social-link">
                            <FaInstagram />
                        </a>
                        <a href="https://www.youtube.com/@DenticalCRM" className="social-link">
                            <FaYoutube />
                        </a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 Dentical CRM. Barcha huquqlar himoyalangan. 🚀</p>
                </div>
            </footer>
        </div>
    )
}
