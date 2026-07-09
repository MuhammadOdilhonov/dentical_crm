"use client"

import { useState, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import { useLanguage } from "../../contexts/LanguageContext"
import {
    updateAppointmentWithDiagnosis,
    fetchDentalServiceCategories,
    fetchDentalServices,
} from "../../api/apiAppointments"
import { FaGlobe } from "react-icons/fa"

// Tooltip component
const QuestionMarkTooltip = () => {
    const [showTooltip, setShowTooltip] = useState(false)
    const { t } = useLanguage()

    return (
        <span
            className="question-mark"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            ?
            {showTooltip && (
                <div className="tooltip">
                    <p>{t("instruction_guide")}</p>
                    <ol>
                        <li>{t("instruction_1")}</li>
                        <li>{t("instruction_2")}</li>
                        <li>{t("instruction_3")}</li>
                        <li>{t("instruction_4")}</li>
                        <li>{t("instruction_5")}</li>
                        <li>{t("instruction_6")}</li>
                    </ol>
                </div>
            )}
        </span>
    )
}

// Function to extract tooth number from tooth name
const extractToothNumber = (toothName) => {
    // "Node6" dan "Node" ni olib tashlash va "6" ni qaytarish
    if (!toothName || typeof toothName !== "string") {
        return null
    }

    // "Node" so'zini olib tashlash va qolgan raqamni olish
    const withoutNode = toothName.replace(/^Node/, "")

    // Agar raqam qolgan bo'lsa, uni qaytarish
    if (withoutNode && /^\d+$/.test(withoutNode)) {
        return Number.parseInt(withoutNode, 10)
    }

    return null
}

// 3D Model component with selectable parts
function Model({ url, onSelectOrgan, selectedOrgans, selectedToothServices }) {
    const { scene } = useGLTF(url)

    useEffect(() => {
        // Reset materials on load
        scene.traverse((object) => {
            if (object.isMesh) {
                object.userData.originalMaterial = object.material.clone()
            }
        })
    }, [scene])

    useEffect(() => {
        // Update materials based on selection and services
        scene.traverse((object) => {
            if (object.isMesh) {
                const toothNumber = extractToothNumber(object.name)
                const hasServices =
                    toothNumber && selectedToothServices[toothNumber] && selectedToothServices[toothNumber].length > 0

                if (selectedOrgans.includes(object.name)) {
                    object.material.color.set("#e8e520") // Yellow for current selection
                } else if (hasServices) {
                    object.material.color.set("#10b981") // Green for teeth with services
                } else {
                    // Reset to original material
                    if (object.userData.originalMaterial) {
                        object.material = object.userData.originalMaterial.clone()
                    }
                }
            }
        })
    }, [selectedOrgans, selectedToothServices, scene])

    return (
        <primitive
            object={scene}
            scale={[0.7, 0.7, 0.7]}
            position={[0, -0.6, 0]}
            onClick={(e) => {
                e.stopPropagation()
                if (e.object.name) {
                    onSelectOrgan(e.object.name, e.shiftKey)
                }
            }}
        />
    )
}

export default function AppointmentDetailsResult() {
    const { t, language, changeLanguage, languages } = useLanguage()
    const [diagnosis, setDiagnosis] = useState("")
    const [treatment, setTreatment] = useState("")
    const [selectedOrgans, setSelectedOrgans] = useState([])
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [appointmentId, setAppointmentId] = useState(null)
    const [error, setError] = useState(null)

    // New states for dental services
    const [dentalServiceCategories, setDentalServiceCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("")
    const [availableDentalServices, setAvailableDentalServices] = useState([])
    const [selectedToothServices, setSelectedToothServices] = useState({}) // {toothNumber: [serviceIds]}
    const [currentToothNumber, setCurrentToothNumber] = useState(null)
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [loadingServices, setLoadingServices] = useState(false)

    const fileInputRef = useRef(null)
    const modelRef = useRef(null)

    // Sample 3D model URL
    const modelUrl = "/models/teeeeth.glb"

    // Supported file formats
    const supportedFormats = [".dcm", ".jpg", ".png", ".tif", ".bmp", ".raw", ".nii"]

    // Get appointment ID from URL
    useEffect(() => {
        const pathParts = window.location.pathname.split("/")
        const id = pathParts[pathParts.length - 1]
        if (id && !isNaN(id)) {
            setAppointmentId(Number.parseInt(id))
        }
    }, [])

    // Load dental service categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categories = await fetchDentalServiceCategories()
                console.log("Loaded categories:", categories)
                setDentalServiceCategories(categories.results)
            } catch (error) {
                console.error("Error loading categories:", error)
            }
        }
        loadCategories()
    }, [])

    // Handle organ selection from 3D model
    const handleSelectOrgan = async (organName, isShiftPressed) => {
        console.log("Organ selected:", organName)
        const toothNumber = extractToothNumber(organName)
        console.log("Extracted tooth number:", toothNumber)

        if (!toothNumber) {
            console.log("No tooth number found for:", organName)
            return
        }

        if (!selectedCategory) {
            setError(t("select_category_error"))
            return
        }

        // Add to selected organs for visual feedback
        setSelectedOrgans((prev) => {
            if (prev.includes(organName)) {
                return prev.filter((name) => name !== organName)
            } else {
                return [...prev, organName]
            }
        })

        // Load services for this tooth
        setCurrentToothNumber(toothNumber)
        setLoadingServices(true)

        try {
            console.log("Fetching services for category:", selectedCategory, "tooth:", toothNumber)
            const services = await fetchDentalServices(selectedCategory, toothNumber)
            console.log("Loaded services:", services)
            setAvailableDentalServices(services.results)
            setShowServiceModal(true)
        } catch (error) {
            console.error("Error loading services:", error)
            setError(t("services_loading_error"))
        } finally {
            setLoadingServices(false)
        }
    }

    // Handle category selection
    const handleCategoryChange = (e) => {
        const newCategory = e.target.value
        console.log("Category changed to:", newCategory)
        setSelectedCategory(newCategory)
        setError(null)
    }

    // Handle service selection for current tooth
    const handleServiceSelection = (serviceId, isSelected) => {
        if (!currentToothNumber) return

        console.log("Service selection:", serviceId, "selected:", isSelected, "for tooth:", currentToothNumber)

        setSelectedToothServices((prev) => {
            const currentServices = prev[currentToothNumber] || []
            let newServices

            if (isSelected) {
                // Add service if not already present
                if (!currentServices.includes(serviceId)) {
                    newServices = {
                        ...prev,
                        [currentToothNumber]: [...currentServices, serviceId],
                    }
                } else {
                    newServices = prev
                }
            } else {
                // Remove service
                newServices = {
                    ...prev,
                    [currentToothNumber]: currentServices.filter((id) => id !== serviceId),
                }
            }

            console.log("Updated selectedToothServices:", newServices)
            return newServices
        })
    }

    // Close service modal
    const closeServiceModal = () => {
        setShowServiceModal(false)
        setCurrentToothNumber(null)
        setAvailableDentalServices([])
    }

    // Remove selected organ
    const removeOrgan = (organToRemove) => {
        setSelectedOrgans((prev) => prev.filter((organ) => organ !== organToRemove))

        // Also remove services for this tooth
        const toothNumber = extractToothNumber(organToRemove)
        if (toothNumber) {
            setSelectedToothServices((prev) => {
                const newServices = { ...prev }
                delete newServices[toothNumber]
                return newServices
            })
        }
    }

    // Clear all selections
    const clearAllSelections = () => {
        setSelectedOrgans([])
        setSelectedToothServices({})
    }

    // Get all selected dental service IDs - FIXED VERSION
    const getAllSelectedServiceIds = () => {
        const allServiceIds = []
        console.log("Getting all service IDs from:", selectedToothServices)

        Object.entries(selectedToothServices).forEach(([toothNumber, serviceIds]) => {
            console.log(`Tooth ${toothNumber} has services:`, serviceIds)
            if (Array.isArray(serviceIds) && serviceIds.length > 0) {
                allServiceIds.push(...serviceIds)
            }
        })

        console.log("All collected service IDs:", allServiceIds)
        return allServiceIds
    }

    // Handle save
    const handleSave = async () => {
        if (!appointmentId) {
            setError(t("appointment_id_not_found"))
            return
        }

        try {
            setIsSaving(true)
            setError(null)

            // Prepare organs array
            const organsArray = selectedOrgans.map((organ) => organ)

            // Get all selected dental service IDs
            const dentalServiceIds = getAllSelectedServiceIds()

            console.log("=== SAVING DATA ===")
            console.log("Organs array:", organsArray)
            console.log("Dental service IDs:", dentalServiceIds)
            console.log("Selected tooth services:", selectedToothServices)

            // If there are files, we need to use FormData
            if (selectedFiles.length > 0) {
                const formData = new FormData()

                // Add diagnosis data fields individually
                formData.append("status", "finished")
                formData.append("diognosis", diagnosis)
                formData.append("comment", treatment)

                // Convert organs array to JSON string and append it
                formData.append("organs", JSON.stringify(organsArray))

                // Add dental services - IMPORTANT: Send as array, not JSON string
                dentalServiceIds.forEach((serviceId) => {
                    formData.append("dental_services", serviceId)
                })

                // Add files
                selectedFiles.forEach((file) => {
                    formData.append("uploaded_files", file)
                })

                console.log("Sending FormData with dental_services:", dentalServiceIds)

                // Send data to API
                await updateAppointmentWithDiagnosis(appointmentId, formData)
            } else {
                // No files, just send the JSON data
                const diagnosisData = {
                    status: "finished", // Mark as completed
                    diognosis: diagnosis, // API field name is "diognosis"
                    comment: treatment, // Use treatment as comment
                    organs: organsArray, // Array of selected organs
                    dental_services: dentalServiceIds, // Array of selected dental service IDs
                }

                console.log("Sending JSON data:", diagnosisData)

                await updateAppointmentWithDiagnosis(appointmentId, diagnosisData)
            }

            // Show success modal
            setShowSuccessModal(true)

            // Close the window after 2 seconds
            setTimeout(() => {
                setShowSuccessModal(false)

                // If this is opened from DocSchedule, close the window
                if (window.opener && !window.opener.closed) {
                    window.close()
                }
            }, 2000)
        } catch (err) {
            console.error("Error saving diagnosis:", err)
            setError(t("data_saving_error"))
        } finally {
            setIsSaving(false)
        }
    }

    const handleUploadResults = () => {
        setShowUploadModal(true)
    }

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        setSelectedFiles([...selectedFiles, ...files])
    }

    // Handle drag events
    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        setSelectedFiles([...selectedFiles, ...files])
    }

    // Open file browser
    const openFileBrowser = () => {
        fileInputRef.current.click()
    }

    // Remove file from selection
    const removeFile = (index) => {
        const newFiles = [...selectedFiles]
        newFiles.splice(index, 1)
        setSelectedFiles(newFiles)
    }

    // Upload files
    const uploadFiles = async () => {
        if (selectedFiles.length === 0) return

        try {
            setIsUploading(true)
            setError(null)

            // In a real implementation, you would upload files to server
            // and get back URLs or IDs to include in the diagnosis data

            // For now, we'll simulate a successful upload
            setTimeout(() => {
                setIsUploading(false)
                setShowUploadModal(false)
                setUploadSuccess(true)

                // Show success modal
                setShowSuccessModal(true)

                // Close success modal after 2 seconds
                setTimeout(() => {
                    setShowSuccessModal(false)
                }, 2000)
            }, 1500)
        } catch (err) {
            console.error("Error uploading files:", err)
            setError(t("files_upload_error"))
            setIsUploading(false)
        }
    }

    // Get file icon based on extension
    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase()
        return extension
    }

    // Get selected category name
    const getSelectedCategoryName = () => {
        const category = dentalServiceCategories.find((cat) => cat.id.toString() === selectedCategory.toString())
        return category ? category.name : ""
    }

    return (
        <div className="appointment-details-container">
            {/* Language Switcher - Top Left Corner */}
            <div className="language-switcher-corner-left">
                <FaGlobe className="language-icon" />
                <select value={language} onChange={(e) => changeLanguage(e.target.value)} className="language-select">
                    {Object.entries(languages).map(([code, name]) => (
                        <option key={code} value={code}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>
            {error && <div className="error-message">{error}</div>}

            <div className="model-container">
                <Canvas
                    // MUAMMO SHU YERDA HAM EDI: kamera sozlamalarini AppointmentDetails.jsx ga moslashtirdik
                    camera={{
                        position: [-318.75, 322.48, 638.46], // AppointmentDetails.jsx dagi kabi
                        fov: 50, // AppointmentDetails.jsx dagi kabi
                        near: 0.1,
                        far: 2000,
                    }}
                    shadows // Soyalarni yoqish
                >
                    {/* Yorug'lik sozlamalari - AppointmentDetails.jsx dagi kabi */}
                    <ambientLight intensity={0.6} />
                    <directionalLight
                        position={[10, 10, 5]}
                        intensity={1.2}
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                    />
                    <pointLight position={[-10, -10, -5]} intensity={0.4} />

                    <Model
                        url={modelUrl}
                        onSelectOrgan={handleSelectOrgan}
                        selectedOrgans={selectedOrgans}
                        selectedToothServices={selectedToothServices}
                        ref={modelRef}
                    />

                    {/* OrbitControls sozlamalari - AppointmentDetails.jsx dagi kabi */}
                    <OrbitControls
                        autoRotate={false}
                        enableDamping
                        dampingFactor={0.05}
                        maxDistance={1000}
                        minDistance={50}
                        enableZoom={true}
                        enablePan={true}
                        enableRotate={true}
                    />
                </Canvas>
            </div>

            <div className="details-form">
                <div className="selected-organs-header">
                    <h2>
                        {t("tooth_services")}:{" "}
                        {Object.keys(selectedToothServices).length > 0
                            ? `${Object.keys(selectedToothServices).length} ${t("selected_teeth")}`
                            : t("nothing_selected")}
                        <QuestionMarkTooltip />
                    </h2>
                </div>

                {/* Category Selection */}
                <div className="category-section">
                    <label>{t("select_service_category")}:</label>
                    <select value={selectedCategory} onChange={handleCategoryChange} className="category-dropdown">
                        <option value="">{t("select_category_first")}</option>
                        {dentalServiceCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {selectedCategory && (
                        <div className="selected-category-info">
                            {t("selected_category")}: <strong>{getSelectedCategoryName()}</strong>
                        </div>
                    )}
                </div>

                {/* Selected Teeth Display */}
                {selectedOrgans.length > 0 && (
                    <div className="selected-teeth-section">
                        <h3>{t("selected_teeth_list")}:</h3>
                        <div className="teeth-list">
                            {selectedOrgans.map((organ, index) => {
                                const toothNumber = extractToothNumber(organ)
                                return (
                                    <div key={index} className="selected-tooth-tag">
                                        <span>
                                            {t("tooth")} #{toothNumber}
                                        </span>
                                        <button className="remove-tooth-button" onClick={() => removeOrgan(organ)}>
                                            ×
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Selected Services Display */}
                {Object.keys(selectedToothServices).length > 0 && (
                    <div className="selected-services-section">
                        <h3>{t("selected_services")}:</h3>
                        <div className="services-list">
                            {Object.entries(selectedToothServices).map(
                                ([toothNumber, serviceIds]) =>
                                    serviceIds.length > 0 && (
                                        <div key={toothNumber} className="tooth-services">
                                            <div className="tooth-number">
                                                {t("tooth")} #{toothNumber}
                                            </div>
                                            <div className="service-count">
                                                {serviceIds.length} {t("services_count")}
                                            </div>
                                            <div className="service-ids">ID: {serviceIds.join(", ")}</div>
                                        </div>
                                    ),
                            )}
                        </div>
                    </div>
                )}

                {(selectedOrgans.length > 0 || Object.keys(selectedToothServices).length > 0) && (
                    <div className="clear-selections-container">
                        <button className="clear-selections-button" onClick={clearAllSelections}>
                            {t("clear_all_selections")}
                        </button>
                    </div>
                )}

                <div className="diagnosis-section">
                    <h2>{t("add_diagnosis_treatment")}</h2>

                    <div className="form-group">
                        <label>{t("diagnosis")}:</label>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder={t("enter_diagnosis")}
                            rows={5}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>{t("treatment_solution")}:</label>
                        <textarea
                            value={treatment}
                            onChange={(e) => setTreatment(e.target.value)}
                            placeholder={t("enter_treatment")}
                            rows={5}
                        ></textarea>
                    </div>

                    

                    <div className="button-group">
                        <button
                            className={`upload-button ${uploadSuccess ? "success" : ""}`}
                            onClick={handleUploadResults}
                            disabled={isSaving}
                        >
                            {uploadSuccess ? (
                                <>
                                    <span className="checkmark">✓</span> {t("results_uploaded")}
                                </>
                            ) : (
                                t("upload_results")
                            )}
                        </button>
                        <button className="save-button" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <span className="spinner"></span> {t("saving")}
                                </>
                            ) : (
                                t("save")
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Service Selection Modal */}
            {showServiceModal && (
                <div className="modal-overlay">
                    <div className="service-modal">
                        <div className="modal-header">
                            <h2>
                                {t("tooth")} #{currentToothNumber} {t("services_for_tooth")}
                            </h2>
                            <button className="close-button" onClick={closeServiceModal}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {loadingServices ? (
                                <div className="loading-services">
                                    <span className="spinner"></span>
                                    {t("loading_services")}
                                </div>
                            ) : availableDentalServices.length > 0 ? (
                                <div className="services-grid">
                                    {availableDentalServices.map((service) => (
                                        <div key={service.id} className="service-item">
                                            <label className="service-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedToothServices[currentToothNumber]?.includes(service.id) || false}
                                                    onChange={(e) => handleServiceSelection(service.id, e.target.checked)}
                                                />
                                                <div className="service-info">
                                                    <div className="service-name">{service.name}</div>
                                                    <div className="service-id">ID: {service.id}</div>
                                                    {service.price && (
                                                        <div className="service-price">
                                                            {service.price} {t("currency")}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-services">{t("no_services_available")}</div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="close-modal-button" onClick={closeServiceModal}>
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="upload-modal">
                        <div className="modal-header">
                            <h2>{t("upload_result")}</h2>
                            <button className="close-button" onClick={() => setShowUploadModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div
                                className={`drop-area ${isDragging ? "dragging" : ""}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={openFileBrowser}
                            >
                                <div className="upload-icon">⬆️</div>
                                <p>{t("drag_files_here")}</p>
                                <span className="formats-info">
                                    {t("supported_formats")}: {supportedFormats.join(", ")}
                                </span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    multiple
                                    style={{ display: "none" }}
                                    accept=".dcm,.jpg,.jpeg,.png,.tif,.tiff,.bmp,.raw,.nii"
                                />
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="selected-files">
                                    <h3>
                                        {t("selected_files")} ({selectedFiles.length})
                                    </h3>
                                    <div className="file-list">
                                        {selectedFiles.map((file, index) => (
                                            <div className="file-item" key={index}>
                                                <span className="file-type">{getFileIcon(file.name)}</span>
                                                <span className="file-name">{file.name}</span>
                                                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                                                <button className="remove-button" onClick={() => removeFile(index)}>
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowUploadModal(false)}>
                                {t("cancel")}
                            </button>
                            <button
                                className="upload-button-modal"
                                onClick={uploadFiles}
                                disabled={selectedFiles.length === 0 || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <span className="spinner"></span>
                                        {t("uploading")}
                                    </>
                                ) : (
                                    t("upload")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="success-modal">
                        <div className="success-icon">✓</div>
                        <h2>{t("successfully_saved")}</h2>
                        <p>{t("data_saved_successfully")}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
