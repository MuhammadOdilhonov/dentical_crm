"use client"
import { useState } from "react"
import { useLanguage } from "../../contexts/LanguageContext"
import { FaQuestionCircle, FaTelegram, FaHeadset, FaBook, FaComments, FaPhoneAlt, FaEnvelope } from "react-icons/fa"

const Help = () => {
    const { t } = useLanguage()
    const [question, setQuestion] = useState("")
    const [selectedFiles, setSelectedFiles] = useState([])
    const [showImagePreview, setShowImagePreview] = useState(false)

    // Toggle filters visibility
    const toggleImagePreview = () => {
        setShowImagePreview(!showImagePreview)
    }

    // Mock frequently asked questions data with images
    const faqs = [
        {
            id: 1,
            question: t("faq_1_question"),
            answer: t("faq_1_answer"),
            image: "/doctor-patient-consultation.png",
        },
        {
            id: 2,
            question: t("faq_2_question"),
            answer: t("faq_2_answer"),
            image: "/secure-medical-records.png",
        },
        {
            id: 3,
            question: t("faq_3_question"),
            answer: t("faq_3_answer"),
            image: "/patient-data-overview.png",
        },
    ]

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files).slice(0, 5) // Limit to 5 files
        setSelectedFiles([...selectedFiles, ...files])
    }

    // Remove file from selection
    const removeFile = (index) => {
        const newFiles = [...selectedFiles]
        newFiles.splice(index, 1)
        setSelectedFiles(newFiles)
    }

    // Redirect to Telegram support
    const redirectToTelegramSupport = () => {
        window.open("https://t.me/your_support_username", "_blank")
    }

    return (
        <div className="help-container">
            <div className="help-header">
                <FaHeadset className="help-header-icon" />
                <h1 className="help-title">Yordam Markazi</h1>
                <p className="help-subtitle">Sizning savollaringizga javob berishdan mamnunmiz</p>
            </div>

            <section className="faq-section">
                <div className="section-header">
                    <FaBook className="section-icon" />
                    <h2>Ko'p beriladigan savollar</h2>
                    <p>Tizim haqida eng ko'p so'raladigan savollar va javoblar</p>
                </div>

                <div className="faq-list">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="faq-item">
                            <div className="faq-image-container">
                                <img src={faq.image || "/placeholder.svg"} alt="FAQ illustration" className="faq-image" />
                            </div>
                            <div className="faq-content">
                                <h3>
                                    <FaQuestionCircle className="faq-icon" /> {faq.question}
                                </h3>
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ask-question-section">
                <div className="section-header">
                    <FaComments className="section-icon" />
                    <h2>Savolingiz bormi?</h2>
                    <p>Savolingizni yozing va bizning mutaxassislarimiz tez orada javob berishadi</p>
                </div>

                <div className="support-options">
                    <div className="support-card" onClick={redirectToTelegramSupport}>
                        <div className="support-icon-container telegram">
                            <FaTelegram className="support-icon" />
                        </div>
                        <h3>Telegram orqali yordam</h3>
                        <p>Bizning Telegram qo'llab-quvvatlash guruhimizga qo'shiling va savollaringizni yuboring</p>
                        <button className="telegram-button">Telegram orqali bog'lanish</button>
                    </div>

                    <div className="support-card">
                        <div className="support-icon-container phone">
                            <FaPhoneAlt className="support-icon" />
                        </div>
                        <h3>Telefon orqali yordam</h3>
                        <p>Ish vaqtida bizga qo'ng'iroq qiling</p>
                        <div className="contact-info">+998 90 123 45 67</div>
                    </div>

                    <div className="support-card">
                        <div className="support-icon-container email">
                            <FaEnvelope className="support-icon" />
                        </div>
                        <h3>Email orqali yordam</h3>
                        <p>Bizga email yuboring, 24 soat ichida javob beramiz</p>
                        <div className="contact-info">support@medcrm.uz</div>
                    </div>
                </div>
            </section>

            <section className="contact-section">
                <div className="section-header">
                    <h2>Bizga bog'laning</h2>
                    <p>Qo'shimcha yordam kerak bo'lsa, bizning qo'llab-quvvatlash jamoamiz doimo yordam berishga tayyor</p>
                </div>

                <div className="contact-info-container">
                    <div className="contact-info-item">
                        <FaPhoneAlt className="contact-icon" />
                        <div>
                            <h4>Telefon raqam</h4>
                            <p>+998 90 123 45 67</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <FaEnvelope className="contact-icon" />
                        <div>
                            <h4>Email</h4>
                            <p>support@medcrm.uz</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <FaTelegram className="contact-icon" />
                        <div>
                            <h4>Telegram</h4>
                            <p>@medcrm_support</p>
                        </div>
                    </div>
                </div>

                <div className="support-hours">
                    <h4>Qo'llab-quvvatlash vaqti</h4>
                    <p>Dushanba - Juma: 9:00 - 18:00</p>
                    <p>Shanba: 10:00 - 15:00</p>
                    <p>Yakshanba: Dam olish kuni</p>
                </div>
            </section>
        </div>
    )
}

export default Help
