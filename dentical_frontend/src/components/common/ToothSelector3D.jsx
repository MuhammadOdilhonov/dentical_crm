"use client"

import { Suspense, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Html, useGLTF, useProgress } from "@react-three/drei"
import * as THREE from "three"
import { useLanguage } from "../../contexts/LanguageContext"

// 3D model yuklanish jarayoni indikatori
const SelectorLoadingIndicator = () => {
    const { progress } = useProgress()
    const { t } = useLanguage()
    const angle = progress * 3.6

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

// Tish meshlari "Node{raqam}" (1-32) deb nomlangan — appointmentDetails dagi model bilan bir xil
const TOOTH_NAME_PATTERN = /^Node(\d+)$/

const getToothNumber = (meshName) => {
    const match = TOOTH_NAME_PATTERN.exec(meshName)
    return match ? Number.parseInt(match[1], 10) : null
}

const SelectableTeethModel = ({ selectedTeeth, onToggleTooth }) => {
    const { scene } = useGLTF("/models/teeeeth.glb")
    const hoveredRef = useRef(null)

    // Tanlangan/oddiy tishlarni ranglash
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh && child.name) {
                if (!child.userData.originalMaterial) {
                    if (!child.material) {
                        child.material = new THREE.MeshStandardMaterial({ color: "white" })
                    }
                    child.userData.originalMaterial = child.material.clone()
                }

                const toothNumber = getToothNumber(child.name)
                if (toothNumber && selectedTeeth.includes(toothNumber)) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: new THREE.Color("#2196f3"),
                        emissive: new THREE.Color("#2196f3"),
                        emissiveIntensity: 0.5,
                    })
                } else {
                    child.material = child.userData.originalMaterial.clone()
                }
            }
        })
    }, [scene, selectedTeeth])

    const handleClick = (event) => {
        event.stopPropagation()
        const toothNumber = getToothNumber(event.object.name)
        if (toothNumber) {
            onToggleTooth(toothNumber)
        }
    }

    const handlePointerOver = (event) => {
        event.stopPropagation()
        const toothNumber = getToothNumber(event.object.name)
        if (toothNumber) {
            document.body.style.cursor = "pointer"
            hoveredRef.current = event.object
        }
    }

    const handlePointerOut = () => {
        document.body.style.cursor = "auto"
        hoveredRef.current = null
    }

    return (
        <primitive
            object={scene}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        />
    )
}

/**
 * 3D tish tanlash komponenti.
 * @param {number[]} selectedTeeth - tanlangan tish raqamlari (1-32)
 * @param {(tooth: number) => void} onToggleTooth - tish bosilganda tanlash/bekor qilish
 */
const ToothSelector3D = ({ selectedTeeth, onToggleTooth }) => {
    // Komponent yopilganda cursor tiklanadi
    useEffect(() => {
        return () => {
            document.body.style.cursor = "auto"
        }
    }, [])

    return (
        <div className="tooth-selector-3d">
            <Canvas
                camera={{
                    position: [-318.75, 322.48, 638.46],
                    fov: 50,
                    near: 0.1,
                    far: 2000,
                }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.2} />
                <pointLight position={[-10, -10, -5]} intensity={0.4} />

                <Suspense fallback={<SelectorLoadingIndicator />}>
                    <SelectableTeethModel selectedTeeth={selectedTeeth} onToggleTooth={onToggleTooth} />
                </Suspense>

                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    maxDistance={1000}
                    minDistance={50}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                />
            </Canvas>
        </div>
    )
}

export default ToothSelector3D
