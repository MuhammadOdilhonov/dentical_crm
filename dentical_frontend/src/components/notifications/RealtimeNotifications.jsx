"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { FaBell, FaTimes } from "react-icons/fa"
import client, { BaseUrlImg } from "../../api/apiService"

// WebAudio orqali yoqimli "ting" ovozi (fayl talab qilinmaydi)
function playDing() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const now = ctx.currentTime
        const notes = [
            { freq: 880, start: 0, dur: 0.15 },
            { freq: 1318.5, start: 0.12, dur: 0.35 },
        ]
        notes.forEach(({ freq, start, dur }) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = "sine"
            osc.frequency.value = freq
            gain.gain.setValueAtTime(0.001, now + start)
            gain.gain.exponentialRampToValueAtTime(0.25, now + start + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now + start)
            osc.stop(now + start + dur + 0.05)
        })
        setTimeout(() => ctx.close(), 1200)
    } catch (e) {
        // Ovoz chiqmasa ham xabar ko'rsatilaveradi
    }
}

/**
 * Platforma ichida real-time xabarnoma:
 * backenddan WebSocket orqali kelgan har bir xabarni
 * o'ng yuqori burchakda toast qilib ko'rsatadi va "ting" ovozi chiqaradi.
 */
export default function RealtimeNotifications() {
    const [toasts, setToasts] = useState([])
    const socketsRef = useRef([])
    const reconnectRef = useRef(null)

    const recentKeysRef = useRef(new Map())

    const addToast = useCallback((data) => {
        // Bir xil xabar 30 soniya ichida ikki marta chiqmasin (WS + polling)
        const key = `${data.title}|${data.message}`
        const now = Date.now()
        const last = recentKeysRef.current.get(key)
        if (last && now - last < 30000) return
        recentKeysRef.current.set(key, now)

        const id = Date.now() + Math.random()
        // Bir vaqtda ko'pi bilan 2 ta toast ko'rinadi
        setToasts((prev) => [{ id, title: data.title, message: data.message }, ...prev].slice(0, 2))
        playDing()
        // 7 soniyadan keyin avtomatik yopiladi
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id))
        }, 7000)
    }, [])

    const removeToast = (id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return

        const wsBase = BaseUrlImg.replace(/^http/, "ws")
        const endpoints = [
            `${wsBase}/ws/notifications/?token=${token}`,
            `${wsBase}/ws/clinic-notifications/?token=${token}`,
        ]

        const connect = () => {
            socketsRef.current = endpoints.map((url) => {
                let ws
                try {
                    ws = new WebSocket(url)
                } catch {
                    return null
                }
                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data)
                        if (data && (data.title || data.message)) addToast(data)
                    } catch {
                        // noto'g'ri format — e'tiborsiz
                    }
                }
                ws.onclose = () => {
                    // 15 soniyadan keyin qayta ulanish
                    if (!reconnectRef.current) {
                        reconnectRef.current = setTimeout(() => {
                            reconnectRef.current = null
                            connect()
                        }, 15000)
                    }
                }
                return ws
            })
        }

        connect()

        // Zaxira mexanizm: WebSocket ishlamay qolsa ham yangi xabarlar
        // har 15 soniyada tekshirilib toast qilinadi
        const seenIds = new Set()
        let firstPoll = true
        const poll = async () => {
            try {
                const res = await client.get("/clinic-notifications/?page=1")
                const items = res.data?.results || res.data || []
                items.forEach((item) => {
                    if (!seenIds.has(item.id)) {
                        seenIds.add(item.id)
                        // Birinchi yuklashda eski xabarlarni toast qilmaymiz
                        if (!firstPoll && !item.is_read) {
                            addToast({ title: item.title, message: item.message })
                        }
                    }
                })
                firstPoll = false
            } catch {
                // server vaqtincha javob bermasa — keyingi urinishda
            }
        }
        poll()
        const pollTimer = setInterval(poll, 15000)

        return () => {
            clearInterval(pollTimer)
            if (reconnectRef.current) clearTimeout(reconnectRef.current)
            socketsRef.current.forEach((ws) => {
                if (ws) {
                    ws.onclose = null
                    try { ws.close() } catch { /* yopilgan */ }
                }
            })
        }
    }, [addToast])

    if (toasts.length === 0) return null

    return (
        <div className="rt-toast-container">
            {toasts.map((toast) => (
                <div className="rt-toast" key={toast.id}>
                    <div className="rt-toast-icon">
                        <FaBell />
                    </div>
                    <div className="rt-toast-body">
                        <div className="rt-toast-title">{toast.title}</div>
                        <div className="rt-toast-message">{toast.message}</div>
                    </div>
                    <button className="rt-toast-close" onClick={() => removeToast(toast.id)} aria-label="Yopish">
                        <FaTimes />
                    </button>
                </div>
            ))}
        </div>
    )
}
