"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { useParams } from "react-router-dom"
import { OrbitControls, Html, useGLTF, useProgress } from "@react-three/drei"
import * as THREE from "three"
import { useLanguage } from "../../contexts/LanguageContext"
import {
    FaDownload,
    FaInfoCircle,
    FaSearchPlus,
    FaFilePdf,
    FaFileImage,
    FaFileAlt,
    FaFileWord,
    FaFileExcel,
    FaFileCsv,
    FaTooth,
    FaMoneyBillWave,
    FaClinicMedical,
    FaCalendarAlt,
    FaBuilding,
    FaUser,
    FaUserMd,
    FaDoorOpen,
    FaClipboardList,
    FaCommentAlt,
    FaFileAlt as FaFileAltSolid,
    FaQuestionCircle,
    FaGlobe,
} from "react-icons/fa"
import apiPatientDetailReception from "../../api/apiPatientDetailReception"

// Yuklash jarayonini ko'rsatish uchun komponent
const LoadingIndicator = () => {
    const { progress } = useProgress()
    const { t } = useLanguage()
    const angle = progress * 50

    return (
        <Html center>
            <div className="loading-container">
                <div
                    className="circular-progress"
                    style={{
                        backgroundImage: `conic-gradient(#0077cc 0deg, #0077cc ${angle}deg, #e6e6e6 ${angle}deg, #e6e6e6 360deg)`,
                    }}
                >
                    <div className="progress-value">{Math.round(progress)}%</div>
                </div>
                <p className="loading-text">{t("loading_3d_model")}</p>
            </div>
        </Html>
    )
}

// Kamera boshlang'ich ko'rinishi
const InitialCameraSetup = ({ modelType }) => {
    const { camera } = useThree()
    const initialSetupDone = useRef(false)

    useEffect(() => {
        if (!initialSetupDone.current) {
            // Eng uzoq pozitsiya uchun koordinatalar
            camera.position.set(-318.75, 322.48, 638.46)
            camera.lookAt(new THREE.Vector3(0, 0, 0))
            camera.updateProjectionMatrix()
            initialSetupDone.current = true
        }
    }, [camera, modelType])

    return null
}

// Zararlangan qismga fokuslanish animatsiyasi
const FocusOnAffectedParts = ({ modelScene, affectedParts, controlsRef, isAutoFocus }) => {
    const { camera } = useThree()
    const [focusTarget, setFocusTarget] = useState(null)
    const animationRef = useRef({ active: false, progress: 0 })
    const startPosition = useRef(new THREE.Vector3())
    const startTarget = useRef(new THREE.Vector3())

    useEffect(() => {
        if (modelScene && affectedParts.length > 0 && isAutoFocus) {
            const affectedMeshes = []
            const center = new THREE.Vector3()

            modelScene.traverse((child) => {
                if (child.isMesh) {
                    const isAffected = affectedParts.some((affectedPart) => child.name === affectedPart)
                    if (isAffected) {
                        affectedMeshes.push(child)
                        const boundingBox = new THREE.Box3().setFromObject(child)
                        const meshCenter = new THREE.Vector3()
                        boundingBox.getCenter(meshCenter)
                        center.add(meshCenter)
                    }
                }
            })

            if (affectedMeshes.length > 0) {
                center.divideScalar(affectedMeshes.length)
                setFocusTarget(center)
                startPosition.current.copy(camera.position)
                if (controlsRef.current) {
                    startTarget.current.copy(controlsRef.current.target)
                }
                animationRef.current = { active: true, progress: 0 }
            }
        }
    }, [modelScene, affectedParts, camera, controlsRef, isAutoFocus])

    useFrame(() => {
        if (animationRef.current.active && focusTarget && controlsRef.current) {
            animationRef.current.progress += 0.02
            if (animationRef.current.progress >= 1) {
                animationRef.current.active = false
                return
            }
            const eased = easeOutCubic(animationRef.current.progress)
            // Eng yaqin pozitsiyaga fokuslanishda
            const targetPosition = new THREE.Vector3(-430.4, -29.95, 381.08)
            camera.position.lerpVectors(startPosition.current, targetPosition, eased)
            controlsRef.current.target.lerpVectors(startTarget.current, focusTarget, eased)
            controlsRef.current.update()
        }
    })

    const easeOutCubic = (x) => {
        return 1 - Math.pow(1 - x, 3)
    }

    return null
}

// Model komponenti
const Model = ({
    gender,
    affectedParts,
    highlightedTeeth,
    onPartsLoaded,
    modelType,
    onModelLoaded,
    isAutoFocus,
    controlsRef,
}) => {
    let modelPath = "/models/teeeeth.glb"
    if (modelType === "dental") {
        modelPath = "/models/teeeeth.glb"
    } else if (gender === "female") {
        modelPath = "/models/teeeeth.glb"
    }

    const { scene } = useGLTF(modelPath)

    useEffect(() => {
        const parts = []
        scene.traverse((child) => {
            if (child.isMesh) {
                // Faqat 3D modelda mavjud bo'lgan tish nomlarini saqlash
                if (child.name && child.name !== "") {
                    if (!child.material) {
                        child.material = new THREE.MeshStandardMaterial({ color: "white" })
                    }
                    if (!child.userData.originalMaterial) {
                        child.userData.originalMaterial = child.material.clone()
                    }
                    child.castShadow = true
                    child.receiveShadow = true
                    parts.push({ name: child.name, mesh: child })
                }
            }
        })

        // Faqat API dan kelgan tishlar bilan mos kelganlarini highlight qilish
        parts.forEach((part) => {
            if (part.mesh) {
                // Affected parts (organs) highlight
                const isAffected = affectedParts.some((affectedPart) => part.name === affectedPart)

                // Highlighted teeth from dental services
                const isHighlighted = highlightedTeeth.includes(part.name)

                if (isHighlighted) {
                    // Dental service tanlangan tishlar - ko'k rangda
                    const highlightMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color("#2196f3"),
                        emissive: new THREE.Color("#2196f3"),
                        emissiveIntensity: 0.5,
                    })
                    part.mesh.material = highlightMaterial
                } else if (isAffected) {
                    // Affected organs - sariq rangda
                    const affectedMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color("yellow"),
                        emissive: new THREE.Color("yellow"),
                        emissiveIntensity: 0.5,
                    })
                    part.mesh.material = affectedMaterial
                } else {
                    // Normal tishlar - oq rangda
                    part.mesh.material = part.mesh.userData.originalMaterial.clone()
                }
            }
        })

        if (onPartsLoaded) {
            onPartsLoaded(parts)
        }
        if (onModelLoaded) {
            onModelLoaded(scene)
        }

        return () => {
            parts.forEach((part) => {
                if (part.mesh && part.mesh.userData.originalMaterial) {
                    part.mesh.material = part.mesh.userData.originalMaterial.clone()
                }
            })
        }
    }, [scene, affectedParts, highlightedTeeth, onPartsLoaded, onModelLoaded])

    return (
        <>
            <primitive object={scene} />
            {isAutoFocus && (
                <FocusOnAffectedParts
                    modelScene={scene}
                    affectedParts={affectedParts}
                    controlsRef={controlsRef}
                    isAutoFocus={isAutoFocus}
                />
            )}
        </>
    )
}

// Kamera kontrollerini boshqarish
const CameraController = ({ controlsRef, modelType }) => {
    useEffect(() => {
        if (controlsRef.current) {
            // Target pozitsiyasini modelning markaziga sozlash
            controlsRef.current.target.set(0, 0, 0)
            controlsRef.current.update()
        }
    }, [controlsRef, modelType])

    return null
}

// File icon component
const FileIcon = ({ fileType }) => {
    switch (fileType.toLowerCase()) {
        case "pdf":
            return <FaFilePdf />
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "bmp":
        case "tiff":
            return <FaFileImage />
        case "doc":
        case "docx":
            return <FaFileWord />
        case "xls":
        case "xlsx":
            return <FaFileExcel />
        case "csv":
            return <FaFileCsv />
        default:
            return <FaFileAlt />
    }
}

// Get file extension
const getFileExtension = (filename) => {
    return filename.split(".").pop().toLowerCase()
}

// Get file name from URL
const getFileName = (url) => {
    return url.split("/").pop()
}

// Format price with spaces
const formatPrice = (price) => {
    return Number.parseFloat(price).toLocaleString("ru-RU", { minimumFractionDigits: 2 })
}

// Convert teeth number to Node format
const getNodeName = (teethNumber) => {
    return `Node${teethNumber}`
}

// Group dental services by category
const groupServicesByCategory = (services) => {
    const grouped = {}

    if (!services || !Array.isArray(services)) return grouped

    services.forEach((service) => {
        if (!grouped[service.category]) {
            grouped[service.category] = {
                categoryName: service.category_name,
                services: [],
            }
        }
        grouped[service.category].services.push(service)
    })

    return grouped
}

// AppointmentDetails asosiy komponenti
const AppointmentDetails = () => {
    const { id } = useParams()
    const { t, language, changeLanguage, languages } = useLanguage()
    const [appointmentData, setAppointmentData] = useState(null)
    const [partsList, setPartsList] = useState([])
    const controlsRef = useRef()
    const [modelScene, setModelScene] = useState(null)
    const [isAutoFocus, setIsAutoFocus] = useState(false)
    const modelType = "dental"
    const [highlightedTeeth, setHighlightedTeeth] = useState([])
    const [selectedService, setSelectedService] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Masalan, hozirgi appointment ID sini 1 deb belgilaymiz
    const appointmentId = id

    // API orqali appointment maʼlumotlarini yuklab olish
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const data = await apiPatientDetailReception.fetchAppointmentById(appointmentId)
                console.log("API response:", data)

                // Organs array to'g'ri formatda bo'lishini ta'minlash
                let organsArray = []
                if (data.organs) {
                    if (Array.isArray(data.organs)) {
                        organsArray = data.organs
                    } else if (typeof data.organs === "object") {
                        organsArray = Object.values(data.organs)
                    }
                }

                setAppointmentData({
                    ...data,
                    organs: organsArray,
                })
                setLoading(false)
            } catch (error) {
                console.error("Appointment ma'lumotlarini olishda xatolik:", error)
                setError(t("loading_error"))
                setLoading(false)
            }
        }
        fetchData()
    }, [appointmentId, t])

    const handlePartsLoaded = (parts) => {
        setPartsList(parts)
    }

    const handleModelLoaded = (scene) => {
        setModelScene(scene)
    }

    const handleFocusToggle = () => {
        setIsAutoFocus(!isAutoFocus)
        if (!isAutoFocus) {
            // Fokusga olganda yaqin pozitsiyaga o'tish
            setIsAutoFocus(true)
        } else if (controlsRef.current) {
            // Fokusni bekor qilganda uzoq pozitsiyaga qaytarish
            const { camera } = controlsRef.current.object
            camera.position.set(-318.75, 322.48, 638.46)
            controlsRef.current.target.set(0, 0, 0)
            controlsRef.current.update()
            setIsAutoFocus(false)
        }
    }

    // Dental service bosilganda tegishli tishlarni highlight qilish
    const handleServiceClick = (service) => {
        console.log("Service clicked:", service)

        if (selectedService && selectedService.id === service.id) {
            // Agar tanlangan service bosilsa, tanlovni bekor qilish
            setSelectedService(null)
            setHighlightedTeeth([])
        } else {
            // Yangi service tanlash
            setSelectedService(service)

            // Tish raqamini Node formatiga o'tkazish
            const nodeName = getNodeName(service.teeth_number)
            setHighlightedTeeth([nodeName])
        }
    }

    // Download file function
    const downloadFile = (url, filename) => {
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) {
        return (
            <div className="loading-wrapper">
                <div className="loading-spinner"></div>
                <p>{t("loading_data")}</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error-message">
                <FaInfoCircle />
                <p>{error}</p>
            </div>
        )
    }

    if (!appointmentData) {
        return (
            <div className="error-message">
                <FaInfoCircle />
                <p>{t("data_not_found")}</p>
            </div>
        )
    }

    // Dental services ni kategoriyalar bo'yicha guruhlash
    const groupedServices = groupServicesByCategory(appointmentData.dental_services_data)

    

    return (
        <div className="anatomy-viewer">
            {/* Language Switcher - Top Right Corner */}
            <div className="language-switcher-corner">
                <FaGlobe className="language-icon" />
                <select value={language} onChange={(e) => changeLanguage(e.target.value)} className="language-select">
                    {Object.entries(languages).map(([code, name]) => (
                        <option key={code} value={code}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="anatomy-model-container">
                <Canvas
                    camera={{
                        position: [-318.75, 322.48, 638.46],
                        fov: 50,
                        near: 0.1,
                        far: 2000,
                    }}
                    shadows
                >
                    <ambientLight intensity={0.6} />
                    <directionalLight
                        position={[10, 10, 5]}
                        intensity={1.2}
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                    />
                    <pointLight position={[-10, -10, -5]} intensity={0.4} />

                    <Suspense fallback={<LoadingIndicator />}>
                        <Model
                            gender={appointmentData.customer_gender}
                            affectedParts={appointmentData.organs}
                            highlightedTeeth={highlightedTeeth}
                            onPartsLoaded={handlePartsLoaded}
                            onModelLoaded={handleModelLoaded}
                            modelType={modelType}
                            isAutoFocus={isAutoFocus}
                            controlsRef={controlsRef}
                        />
                        <InitialCameraSetup modelType={modelType} />
                    </Suspense>

                    <OrbitControls
                        ref={controlsRef}
                        autoRotate={false}
                        enableDamping
                        dampingFactor={0.05}
                        maxDistance={1000}
                        minDistance={50}
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                    />
                    <CameraController controlsRef={controlsRef} modelType={modelType} />
                </Canvas>

                <button className="focus-button" onClick={handleFocusToggle}>
                    <FaSearchPlus /> {isAutoFocus ? t("cancel_focus") : t("focus_affected_area")}
                </button>
            </div>

            <div className="anatomy-info-panel">
                <div className="anatomy-diagnosis-info">
                    <h3>{t("diagnosis_information")}</h3>

                    <div className="info-section">
                        <h4>
                            <FaCalendarAlt /> {t("appointment_date")}:
                        </h4>
                        <p>
                            {new Date(appointmentData.date).toLocaleDateString()} {appointmentData.time}
                        </p>
                    </div>

                    <div className="info-section">
                        <h4>
                            <FaBuilding /> {t("branch_name")}:
                        </h4>
                        <p>{appointmentData.branch_name}</p>
                    </div>

                    <div className="info-section">
                        <h4>
                            <FaUser /> {t("customer")}:
                        </h4>
                        <p>{appointmentData.customer_name}</p>
                    </div>

                    <div className="info-section">
                        <h4>
                            <FaUserMd /> {t("doctor")}:
                        </h4>
                        <p>{appointmentData.doctor_name}</p>
                    </div>

                    <div className="info-section">
                        <h4>
                            <FaDoorOpen /> {t("cabinet")}:
                        </h4>
                        <p>{appointmentData.room_name}</p>
                    </div>

                    {appointmentData.organs && appointmentData.organs.length > 0 && (
                        <div className="info-section">
                            <h4>
                                <FaTooth /> {t("selected_organs")}:
                            </h4>
                            <div className="selected-parts-list">
                                {appointmentData.organs.map((part, index) => (
                                    <div key={index} className="selected-part-item">
                                        {part}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="info-section">
                        <h4>
                            <FaClipboardList /> {t("diagnosis")}:
                        </h4>
                        <p>{appointmentData.diognosis || t("no_diagnosis_available")}</p>
                    </div>

                    <div className="info-section">
                        <h4>
                            <FaCommentAlt /> {t("comment")}:
                        </h4>
                        <p>{appointmentData.comment || t("no_comment_available")}</p>
                    </div>

                    {/* Dental Services Section */}
                    {appointmentData.dental_services_data && appointmentData.dental_services_data.length > 0 && (
                        <div className="info-section dental-services-section">
                            <h4>
                                <FaTooth /> {t("provided_services")}
                            </h4>

                            {Object.keys(groupedServices).map((categoryId) => (
                                <div key={categoryId} className="service-category">
                                    <h5 className="category-name">
                                        <FaTooth /> {groupedServices[categoryId].categoryName}
                                    </h5>

                                    <div className="services-list">
                                        {groupedServices[categoryId].services.map((service) => (
                                            <div
                                                key={service.id}
                                                className={`service-item ${selectedService && selectedService.id === service.id ? "selected" : ""}`}
                                                onClick={() => handleServiceClick(service)}
                                            >
                                                <div className="service-header">
                                                    <div className="service-name">{service.name}</div>
                                                    <div className="service-tooth">
                                                        {t("tooth")} #{service.teeth_number}
                                                    </div>
                                                </div>

                                                {service.description && <p className="service-description">{service.description}</p>}

                                                <div className="service-details">
                                                    <span className="service-clinic">
                                                        <FaClinicMedical /> {service.clinic_name}
                                                    </span>
                                                    <span className="service-price">
                                                        <FaMoneyBillWave /> {formatPrice(service.amount)} {t("currency")}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="service-instructions">
                                <FaInfoCircle />
                                <p>{t("click_service_to_view")}</p>
                            </div>
                        </div>
                    )}

                    {appointmentData.files && appointmentData.files.length > 0 && (
                        <div className="info-section files-section">
                            <h4>
                                <FaFileAltSolid /> {t("uploaded_files")}:
                            </h4>
                            <div className="files-container">
                                {appointmentData.files.map((file) => {
                                    const fileName = getFileName(file.file)
                                    const fileExt = getFileExtension(fileName)
                                    return (
                                        <button
                                            key={file.id}
                                            className={`file-download-button file-type-${fileExt}`}
                                            onClick={() => downloadFile(file.file, fileName)}
                                        >
                                            <span className="file-icon">
                                                <FileIcon fileType={fileExt} />
                                            </span>
                                            <span className="file-name">{fileName}</span>
                                            <span className="download-icon">
                                                <FaDownload />
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="info-note">
                        <FaInfoCircle />
                        <p>{t("model_note")}</p>
                    </div>
                </div>

                <div className="anatomy-instructions">
                    <h4>
                        <FaQuestionCircle /> {t("instructions")}
                    </h4>
                    <ul>
                        <li>{t("model_instructions_1")}</li>
                        <li>{t("model_instructions_2")}</li>
                        <li>{t("model_instructions_3")}</li>
                        <li>{t("model_instructions_4")}</li>
                        <li>{t("model_instructions_5")}</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AppointmentDetails
