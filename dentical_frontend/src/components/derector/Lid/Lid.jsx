"use client"

import { useState, useEffect, useCallback } from "react"
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import {
    FiSearch,
    FiPlus,
    FiUser,
    FiUsers,
    FiPhone,
    FiBell,
    FiFilter,
    FiSettings,
    FiArchive,
    FiCalendar,
    FiUserPlus,
    FiTrash2,
    FiCheck,
    FiStar,
    FiArrowRight,
} from "react-icons/fi"
import { LeadColumn } from "../../leadColumn/LeadColumn.jsx"
import { LeadItem } from "../../leadItem/LeadItem.jsx"


const branches = ["Barcha filiallar", "Chilonzor", "Yunusobod", "Sergeli", "Mirzo Ulug'bek"]

const initialColumns = [
    {
        id: "yangi-lidlar",
        title: "Yangi lidlar",
        count: 0,
        items: [],
        color: "#6366f1",
    },
    {
        id: "ingliz-tili",
        title: "Ingliz tili",
        count: 3,
        color: "#8b5cf6",
        items: [
            {
                id: "item-1",
                name: "Alisher Karimov",
                phone: "+998 90 123 45 67",
                status: "active",
                source: "Instagram",
                date: "2025-04-05",
                reminder: "2025-05-10",
                notes: "Ingliz tili kursi bilan qiziqdi",
                month: "current",
                branch: "Chilonzor",
            },
            {
                id: "item-2",
                name: "Dilnoza Rakhimova",
                phone: "+998 99 765 43 21",
                status: "active",
                source: "Facebook",
                date: "2025-04-07",
                notes: "IELTS kursi bo'yicha ma'lumot so'radi",
                month: "current",
                branch: "Yunusobod",
            },
            {
                id: "item-3",
                name: "Bobur Saidov",
                phone: "+998 91 234 56 78",
                status: "active",
                source: "Website",
                date: "2025-04-08",
                reminder: "2025-04-15",
                notes: "Speaking kursi bilan qiziqdi",
                month: "current",
                branch: "Sergeli",
            },
        ],
    },
    {
        id: "fronted",
        title: "Frontend",
        count: 7,
        color: "#ec4899",
        items: [
            {
                id: "item-4",
                name: "Kamola Yusupova",
                phone: "+998 90 987 65 43",
                status: "active",
                source: "Telegram",
                date: "2025-03-01",
                notes: "React kursi bo'yicha so'radi",
                month: "previous",
                branch: "Chilonzor",
            },
            {
                id: "item-5",
                name: "Jasur Toshmatov",
                phone: "+998 99 876 54 32",
                status: "active",
                source: "Instagram",
                date: "2025-04-02",
                reminder: "2025-04-20",
                notes: "JavaScript asoslari kursi bilan qiziqdi",
                month: "current",
                branch: "Yunusobod",
            },
            {
                id: "item-6",
                name: "Nilufar Karimova",
                phone: "+998 91 345 67 89",
                status: "active",
                source: "Website",
                date: "2025-04-03",
                notes: "HTML/CSS kursi bo'yicha ma'lumot so'radi",
                month: "current",
                branch: "Sergeli",
            },
            {
                id: "item-7",
                name: "Sardor Alimov",
                phone: "+998 90 234 56 78",
                status: "active",
                source: "Facebook",
                date: "2025-04-04",
                reminder: "2025-04-25",
                notes: "Vue.js kursi bilan qiziqdi",
                month: "current",
                branch: "Chilonzor",
            },
            {
                id: "item-8",
                name: "Madina Rakhimova",
                phone: "+998 99 654 32 10",
                status: "archived",
                source: "Telegram",
                date: "2025-03-05",
                notes: "TypeScript kursi bo'yicha so'radi",
                month: "previous",
                branch: "Yunusobod",
            },
            {
                id: "item-9",
                name: "Timur Khasanov",
                phone: "+998 91 456 78 90",
                status: "active",
                source: "Instagram",
                date: "2025-04-06",
                reminder: "2025-04-30",
                notes: "Next.js kursi bilan qiziqdi",
                month: "current",
                branch: "Sergeli",
            },
            {
                id: "item-10",
                name: "Zarina Usmanova",
                phone: "+998 90 345 67 89",
                status: "archived",
                source: "Website",
                date: "2025-03-07",
                notes: "React Native kursi bo'yicha ma'lumot so'radi",
                month: "previous",
                branch: "Chilonzor",
            },
        ],
    },
]

const DirectorLid = () => {
    const [columns, setColumns] = useState(initialColumns)
    const [searchTerm, setSearchTerm] = useState("")
    const [isArchived, setIsArchived] = useState(false)
    const [showNewLeadModal, setShowNewLeadModal] = useState(false)
    const [showNewColumnModal, setShowNewColumnModal] = useState(false)
    const [showReminderModal, setShowReminderModal] = useState(false)
    const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false)
    const [showLeadMenuModal, setShowLeadMenuModal] = useState(false)
    const [showLeadActionModal, setShowLeadActionModal] = useState(false)
    const [currentLead, setCurrentLead] = useState(null)
    const [currentColumnId, setCurrentColumnId] = useState(null)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const [newLead, setNewLead] = useState({
        department: "",
        source: "",
        name: "",
        phone: "",
        notes: "",
        reminder: "",
        branch: "",
    })
    const [newColumn, setNewColumn] = useState({
        title: "",
        color: "#6366f1",
    })
    const [activeId, setActiveId] = useState(null)
    const [activeItem, setActiveItem] = useState(null)
    const [reminders, setReminders] = useState([])
    const [showReminders, setShowReminders] = useState(false)
    const [filterSource, setFilterSource] = useState("")
    const [filterDate, setFilterDate] = useState("")
    const [filterBranch, setFilterBranch] = useState("Barcha filiallar")
    const [showFilters, setShowFilters] = useState(false)
    const [selectedTab, setSelectedTab] = useState("registered")
    const [actionType, setActionType] = useState("")
    const [scheduleDate, setScheduleDate] = useState("")
    const [reminderDate, setReminderDate] = useState("")
    const [actionNote, setActionNote] = useState("")
    const [showContextMenu, setShowContextMenu] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
    const [contextMenuLead, setContextMenuLead] = useState(null)
    const [showReportModal, setShowReportModal] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    // Check for reminders - using useCallback to prevent infinite loops
    const checkReminders = useCallback(() => {
        const today = new Date().toISOString().split("T")[0]
        const todayReminders = []

        columns.forEach((column) => {
            column.items.forEach((item) => {
                if (item.reminder && item.reminder === today) {
                    todayReminders.push({
                        id: item.id,
                        name: item.name,
                        department: column.title,
                        reminder: item.reminder,
                    })
                }
            })
        })

        setReminders(todayReminders)

        if (todayReminders.length > 0) {
            setShowReminders(true)
        }
    }, [columns])

    // Check reminders on mount and when columns change
    useEffect(() => {
        checkReminders()
    }, [checkReminders])

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showContextMenu) {
                setShowContextMenu(false)
            }
            if (showLeadMenuModal) {
                setShowLeadMenuModal(false)
            }
        }

        document.addEventListener("click", handleClickOutside)
        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [showContextMenu, showLeadMenuModal])

    // Prevent default context menu
    useEffect(() => {
        const handleContextMenu = (e) => {
            // Only prevent context menu on lead items
            if (e.target.closest(".item")) {
                e.preventDefault()
            }
        }

        document.addEventListener("contextmenu", handleContextMenu)
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu)
        }
    }, [])

    const findContainer = (id) => {
        if (columns.find((col) => col.id === id)) return id

        for (const column of columns) {
            const item = column.items.find((item) => item.id === id)
            if (item) return column.id
        }

        return null
    }

    const handleDragStart = (event) => {
        const { active } = event
        setActiveId(active.id)

        // Find the item being dragged
        for (const column of columns) {
            const item = column.items.find((item) => item.id === active.id)
            if (item) {
                setActiveItem(item)
                break
            }
        }
    }

    const handleDragOver = (event) => {
        const { active, over } = event
        if (!over) return

        const activeContainer = findContainer(active.id)
        const overContainer = findContainer(over.id)

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return
        }

        setColumns((prev) => {
            const activeItems = [...prev.find((col) => col.id === activeContainer).items]
            const overItems = [...prev.find((col) => col.id === overContainer).items]

            const activeIndex = activeItems.findIndex((item) => item.id === active.id)
            const overIndex = overItems.findIndex((item) => item.id === over.id)

            let newIndex
            if (over.id in prev) {
                // We're at the root droppable of a container
                newIndex = overItems.length + 1
            } else {
                const isBelowLastItem = over && overIndex === overItems.length - 1
                const modifier = isBelowLastItem ? 1 : 0
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
            }

            const updatedColumns = prev.map((col) => {
                if (col.id === activeContainer) {
                    return {
                        ...col,
                        items: col.items.filter((item) => item.id !== active.id),
                        count: col.items.filter((item) => item.id !== active.id).length,
                    }
                } else if (col.id === overContainer) {
                    const newItems = [...col.items]
                    newItems.splice(newIndex, 0, activeItems[activeIndex])
                    return {
                        ...col,
                        items: newItems,
                        count: newItems.length,
                    }
                } else {
                    return col
                }
            })

            return updatedColumns
        })
    }

    const handleDragEnd = (event) => {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            setActiveItem(null)
            return
        }

        const activeContainer = findContainer(active.id)
        const overContainer = findContainer(over.id)

        if (activeContainer !== overContainer) {
            // If moved to a different container, check if we need to set a reminder
            const activeColumnTitle = columns.find((col) => col.id === activeContainer)?.title
            const overColumnTitle = columns.find((col) => col.id === overContainer)?.title

            // If moving from one month to another (example logic - can be customized)
            if (activeColumnTitle?.includes("April") && overColumnTitle?.includes("May")) {
                setCurrentLead(activeItem)
                setShowReminderModal(true)
            }
        }

        if (!activeContainer || !overContainer) {
            setActiveId(null)
            setActiveItem(null)
            return
        }

        if (activeContainer === overContainer) {
            const activeIndex = columns
                .find((col) => col.id === activeContainer)
                .items.findIndex((item) => item.id === active.id)

            const overIndex = columns.find((col) => col.id === overContainer).items.findIndex((item) => item.id === over.id)

            if (activeIndex !== overIndex) {
                setColumns((prev) => {
                    const updatedColumns = [...prev]
                    const targetColumn = updatedColumns.find((col) => col.id === activeContainer)
                    targetColumn.items = arrayMove(targetColumn.items, activeIndex, overIndex)
                    return updatedColumns
                })
            }
        }

        setActiveId(null)
        setActiveItem(null)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewLead((prev) => ({ ...prev, [name]: value }))
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setCurrentLead((prev) => ({ ...prev, [name]: value }))
    }

    const handleColumnInputChange = (e) => {
        const { name, value } = e.target
        setNewColumn((prev) => ({ ...prev, [name]: value }))
    }

    const handleCreateLead = () => {
        const today = new Date().toISOString().split("T")[0]
        const newItem = {
            id: `item-${Date.now()}`,
            name: newLead.name,
            phone: newLead.phone,
            status: "active",
            source: newLead.source,
            date: today,
            notes: newLead.notes,
            reminder: newLead.reminder || null,
            month: "current",
            branch: newLead.branch,
        }

        // Add to the selected column
        const updatedColumns = columns.map((col) => {
            if (col.id === newLead.department) {
                return {
                    ...col,
                    items: [...col.items, newItem],
                    count: col.items.length + 1,
                }
            }
            return col
        })

        setColumns(updatedColumns)
        setShowNewLeadModal(false)
        setNewLead({
            department: "",
            source: "",
            name: "",
            phone: "",
            notes: "",
            reminder: "",
            branch: "",
        })
    }

    const handleCreateColumn = () => {
        const columnId = newColumn.title.toLowerCase().replace(/\s+/g, "-")

        const newColumnObj = {
            id: columnId,
            title: newColumn.title,
            color: newColumn.color,
            count: 0,
            items: [],
        }

        setColumns([...columns, newColumnObj])
        setShowNewColumnModal(false)
        setNewColumn({
            title: "",
            color: "#6366f1",
        })
    }

    const handleViewLeadDetails = (item, columnId) => {
        setCurrentLead(item)
        setCurrentColumnId(columnId)
        setShowLeadDetailsModal(true)
    }

    const handleContextMenu = (e, item, columnId) => {
        e.preventDefault()
        handleViewLeadDetails(item, columnId)
    }

    const handleLeadContextMenu = (e, item, columnId) => {
        e.preventDefault()
        setContextMenuLead(item)
        setCurrentColumnId(columnId)
        setContextMenuPosition({ x: e.clientX, y: e.clientY })
        setShowContextMenu(true)
    }

    const handleDeleteLead = (itemId, columnId) => {
        const updatedColumns = columns.map((col) => {
            if (col.id === columnId) {
                return {
                    ...col,
                    items: col.items.filter((item) => item.id !== itemId),
                    count: col.items.filter((item) => item.id !== itemId).length,
                }
            }
            return col
        })

        setColumns(updatedColumns)
    }

    const handleUpdateLead = () => {
        const updatedColumns = columns.map((col) => {
            // Find the lead in any column and update it
            if (col.items.some((item) => item.id === currentLead.id)) {
                return {
                    ...col,
                    items: col.items.map((item) => (item.id === currentLead.id ? currentLead : item)),
                }
            }
            return col
        })

        setColumns(updatedColumns)
        setShowLeadDetailsModal(false)
        setCurrentLead(null)
    }

    const handleSetReminder = () => {
        const updatedColumns = columns.map((col) => {
            // Find the lead in any column and update its reminder
            if (col.items.some((item) => item.id === currentLead.id)) {
                return {
                    ...col,
                    items: col.items.map((item) =>
                        item.id === currentLead.id ? { ...item, reminder: currentLead.reminder } : item,
                    ),
                }
            }
            return col
        })

        setColumns(updatedColumns)
        setShowReminderModal(false)
    }

    const handleDeleteColumn = (columnId) => {
        // Check if column has items
        const column = columns.find((col) => col.id === columnId)
        if (column && column.items.length > 0) {
            alert("Bo'lim bo'sh emas! Avval barcha lidlarni boshqa bo'limlarga o'tkazing.")
            return
        }

        setColumns(columns.filter((col) => col.id !== columnId))
    }

    const handleShowLeadMenu = (e, item, columnId) => {
        e.stopPropagation()
        setCurrentLead(item)
        setCurrentColumnId(columnId)
        setMenuPosition({ x: e.clientX, y: e.clientY })
        setShowLeadMenuModal(true)
    }

    const handleArchiveLead = () => {
        const updatedColumns = columns.map((col) => {
            if (col.id === currentColumnId) {
                return {
                    ...col,
                    items: col.items.map((item) => (item.id === currentLead.id ? { ...item, status: "archived" } : item)),
                }
            }
            return col
        })

        setColumns(updatedColumns)
        setShowLeadMenuModal(false)
        setShowLeadActionModal(false)
    }

    const handleSetLeadToNextMonth = () => {
        const updatedColumns = columns.map((col) => {
            if (col.id === currentColumnId) {
                return {
                    ...col,
                    items: col.items.map((item) => (item.id === currentLead.id ? { ...item, month: "next" } : item)),
                }
            }
            return col
        })

        setColumns(updatedColumns)
        setShowLeadMenuModal(false)
        setShowLeadActionModal(false)
    }

    const handleSetLeadToPositive = () => {
        const updatedColumns = columns.map((col) => {
            if (col.id === currentColumnId) {
                return {
                    ...col,
                    items: col.items.map((item) => (item.id === currentLead.id ? { ...item, status: "positive" } : item)),
                }
            }
            return col
        })

        setColumns(updatedColumns)
        setShowLeadMenuModal(false)
        setShowLeadActionModal(false)
    }

    const handleScheduleLead = () => {
        if (!scheduleDate) return

        const updatedColumns = columns.map((col) => {
            if (col.id === currentColumnId) {
                return {
                    ...col,
                    items: col.items.map((item) =>
                        item.id === currentLead.id
                            ? {
                                ...item,
                                scheduledDate: scheduleDate,
                                notes: actionNote ? `${item.notes || ""}\n${actionNote}` : item.notes,
                            }
                            : item,
                    ),
                }
            }
            return col
        })

        setColumns(updatedColumns)
        setShowLeadActionModal(false)
        setScheduleDate("")
        setActionNote("")
    }

    const handleSetLeadReminder = () => {
        if (!reminderDate) return

        const updatedColumns = columns.map((col) => {
            if (col.id === currentColumnId) {
                return {
                    ...col,
                    items: col.items.map((item) =>
                        item.id === currentLead.id
                            ? {
                                ...item,
                                reminder: reminderDate,
                                notes: actionNote ? `${item.notes || ""}\n${actionNote}` : item.notes,
                            }
                            : item,
                    ),
                }
            }
            return col
        })

        setColumns(updatedColumns)
        setShowLeadActionModal(false)
        setReminderDate("")
        setActionNote("")
    }

    const openActionModal = (type) => {
        setActionType(type)
        setShowLeadMenuModal(false)
        setShowLeadActionModal(true)

        // Reset form fields
        setScheduleDate("")
        setReminderDate("")
        setActionNote("")
    }

    const handleCallAction = (phone) => {
        // Open phone dialer with the phone number
        const cleanPhone = phone.replace(/\s+/g, "")
        window.open(`tel:${cleanPhone}`, "_self")
    }

    // Generate financial report
    const generateFinancialReport = () => {
        // Calculate total leads by status
        const totalLeads = columns.reduce((acc, col) => acc + col.items.length, 0)
        const activeLeads = columns.reduce(
            (acc, col) => acc + col.items.filter((item) => item.status === "active").length,
            0,
        )
        const positiveLeads = columns.reduce(
            (acc, col) => acc + col.items.filter((item) => item.status === "positive").length,
            0,
        )
        const archivedLeads = columns.reduce(
            (acc, col) => acc + col.items.filter((item) => item.status === "archived").length,
            0,
        )

        // Calculate leads by source
        const sourceData = {}
        columns.forEach((col) => {
            col.items.forEach((item) => {
                if (item.source) {
                    sourceData[item.source] = (sourceData[item.source] || 0) + 1
                }
            })
        })

        // Calculate leads by branch
        const branchData = {}
        columns.forEach((col) => {
            col.items.forEach((item) => {
                if (item.branch) {
                    branchData[item.branch] = (branchData[item.branch] || 0) + 1
                }
            })
        })

        return {
            totalLeads,
            activeLeads,
            positiveLeads,
            archivedLeads,
            sourceData,
            branchData,
        }
    }

    // Apply filters
    const filteredColumns = columns.map((column) => {
        let filteredItems = column.items

        // Search filter
        if (searchTerm) {
            filteredItems = filteredItems.filter(
                (item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.phone.includes(searchTerm),
            )
        }

        // Source filter
        if (filterSource) {
            filteredItems = filteredItems.filter((item) => item.source === filterSource)
        }

        // Date filter
        if (filterDate) {
            filteredItems = filteredItems.filter((item) => item.date === filterDate)
        }

        // Branch filter
        if (filterBranch !== "Barcha filiallar") {
            filteredItems = filteredItems.filter((item) => item.branch === filterBranch)
        }

        // Archive filter - show only archived items when isArchived is true
        if (isArchived) {
            filteredItems = filteredItems.filter((item) => item.status === "archived")
        } else {
            // Show only non-archived items when isArchived is false
            filteredItems = filteredItems.filter((item) => item.status !== "archived")
        }

        // Tab filter - only apply when not in archive mode
        if (!isArchived) {
            if (selectedTab === "positive") {
                filteredItems = filteredItems.filter((item) => item.status === "positive")
            } else if (selectedTab === "registered") {
                filteredItems = filteredItems.filter((item) => item.status === "active")
            }
        }

        return {
            ...column,
            items: filteredItems,
            filteredCount: filteredItems.length,
        }
    })

    const availableColors = [
        "#6366f1", // Indigo
        "#8b5cf6", // Violet
        "#ec4899", // Pink
        "#f43f5e", // Rose
        "#f97316", // Orange
        "#14b8a6", // Teal
        "#06b6d4", // Cyan
        "#0ea5e9", // Light Blue
        "#8b5cf6", // Purple
        "#d946ef", // Fuchsia
    ]

    return (
        <div className="director-lid">
            <div className="header-lid">
                <div className="header-left">
                    <h1 className="app-title">Lid Boshqaruvi</h1>
                </div>

                <div className="header-center">
                    <div className="search-container">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="header-actions">
                    <button className={`filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter />
                        <span>Filter</span>
                    </button>

                    <div className="archive-toggle">
                        <span>Arxiv</span>
                        <label className="switch">
                            <input type="checkbox" checked={isArchived} onChange={() => setIsArchived(!isArchived)} />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="reminder-icon" onClick={() => setShowReminders(true)}>
                        <FiBell />
                        {reminders.length > 0 && <span className="reminder-badge">{reminders.length}</span>}
                    </div>

                    <button className="report-btn" onClick={() => setShowReportModal(true)}>
                        <FiSettings />
                        <span>HISOBOT</span>
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Manba:</label>
                        <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="filter-select">
                            <option value="">Barcha manbalar</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Telegram">Telegram</option>
                            <option value="Website">Website</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Sana:</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="filter-date"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Filial:</label>
                        <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="filter-select">
                            {branches.map((branch) => (
                                <option key={branch} value={branch}>
                                    {branch}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="clear-filters-btn"
                        onClick={() => {
                            setFilterSource("")
                            setFilterDate("")
                            setFilterBranch("Barcha filiallar")
                        }}
                    >
                        Filterni tozalash
                    </button>
                </div>
            )}

            <div className="navigation">
                <div className="nav-tabs">
                    <div
                        className={`nav-item ${selectedTab === "registered" ? "active" : ""}`}
                        onClick={() => setSelectedTab("registered")}
                    >
                        <FiUsers className="nav-icon" />
                        <span>Ro'yxatdan o'tganlar</span>
                    </div>
                    <div
                        className={`nav-item ${selectedTab === "positive" ? "active" : ""}`}
                        onClick={() => setSelectedTab("positive")}
                    >
                        <FiUser className="nav-icon" />
                        <span>Ijobiy aloqa</span>
                    </div>
                </div>
                <div className="nav-actions">
                    <button className="create-column-btn" onClick={() => setShowNewColumnModal(true)}>
                        <FiPlus />
                        <span>Yangi bo'lim</span>
                    </button>
                    <button className="create-lead-btn" onClick={() => setShowNewLeadModal(true)}>
                        <FiUserPlus />
                        <span>Yangi lid</span>
                    </button>
                </div>
            </div>

            <div className="board-container">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="board">
                        {filteredColumns.map((column) => (
                            <LeadColumn
                                key={column.id}
                                id={column.id}
                                title={column.title}
                                count={column.filteredCount || 0}
                                items={column.items}
                                color={column.color}
                                onViewDetails={(item) => handleViewLeadDetails(item, column.id)}
                                onDeleteLead={(itemId) => handleDeleteLead(itemId, column.id)}
                                onDeleteColumn={() => handleDeleteColumn(column.id)}
                                onShowMenu={(e, item) => handleShowLeadMenu(e, item, column.id)}
                                onContextMenu={(e, item) => handleLeadContextMenu(e, item, column.id)}
                            />
                        ))}
                        <DragOverlay>
                            {activeId && activeItem ? (
                                <div className="item drag-overlay">
                                    <LeadItem item={activeItem} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </div>
                </DndContext>
            </div>

            <div className="footer">
                <button className="call-center-btn" onClick={() => handleCallAction("+998 90 123 45 67")}>
                    <FiPhone />
                    <span>CALL CENTER</span>
                </button>
                <div className="footer-info">
                    <p>Jami lidlar: {columns.reduce((acc, col) => acc + col.items.length, 0)}</p>
                    <p>
                        Bugun:{" "}
                        {columns.reduce(
                            (acc, col) =>
                                acc + col.items.filter((item) => item.date === new Date().toISOString().split("T")[0]).length,
                            0,
                        )}
                    </p>
                </div>
            </div>

            {/* New Lead Modal */}
            {showNewLeadModal && (
                <div className="modal-overlay" onClick={() => setShowNewLeadModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Yangi Lid</h2>
                            <button className="close-btn" onClick={() => setShowNewLeadModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Bo'lim:</label>
                                <select
                                    name="department"
                                    value={newLead.department}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="" disabled>
                                        Bo'limni tanlang
                                    </option>
                                    {columns.map((col) => (
                                        <option key={col.id} value={col.id}>
                                            {col.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Manba:</label>
                                <select
                                    name="source"
                                    value={newLead.source}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="" disabled>
                                        Manbani tanlang
                                    </option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Telegram">Telegram</option>
                                    <option value="Website">Website</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Filial:</label>
                                <select
                                    name="branch"
                                    value={newLead.branch}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="" disabled>
                                        Filialni tanlang
                                    </option>
                                    {branches.slice(1).map((branch) => (
                                        <option key={branch} value={branch}>
                                            {branch}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ism familiya:</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ism familiya"
                                    value={newLead.name}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefon raqami:</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Telefon raqami"
                                    value={newLead.phone}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Eslatma sanasi (ixtiyoriy):</label>
                                <input
                                    type="date"
                                    name="reminder"
                                    value={newLead.reminder}
                                    onChange={handleInputChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Izoh:</label>
                                <textarea
                                    name="notes"
                                    placeholder="Izoh"
                                    value={newLead.notes}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    rows={4}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="create-lead-btn"
                                onClick={handleCreateLead}
                                disabled={!newLead.name || !newLead.phone || !newLead.department || !newLead.source || !newLead.branch}
                            >
                                YARATISH
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Column Modal */}
            {showNewColumnModal && (
                <div className="modal-overlay" onClick={() => setShowNewColumnModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Yangi Bo'lim</h2>
                            <button className="close-btn" onClick={() => setShowNewColumnModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Bo'lim nomi:</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Bo'lim nomi"
                                    value={newColumn.title}
                                    onChange={handleColumnInputChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Bo'lim rangi:</label>
                                <div className="color-picker">
                                    {availableColors.map((color) => (
                                        <div
                                            key={color}
                                            className={`color-option ${newColumn.color === color ? "selected" : ""}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setNewColumn((prev) => ({ ...prev, color }))}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="create-lead-btn" onClick={handleCreateColumn} disabled={!newColumn.title}>
                                YARATISH
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Details Modal */}
            {showLeadDetailsModal && currentLead && (
                <div className="modal-overlay" onClick={() => setShowLeadDetailsModal(false)}>
                    <div className="modal lead-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Lid ma'lumotlari</h2>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowLeadDetailsModal(false)
                                    setCurrentLead(null)
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="lead-details-header">
                                <div className="lead-name-section">
                                    <h3>{currentLead.name}</h3>
                                    <div className="lead-source">
                                        <span className="source-label">Manba:</span>
                                        <span className="source-value">{currentLead.source}</span>
                                    </div>
                                    <div className="lead-source">
                                        <span className="source-label">Filial:</span>
                                        <span className="source-value">{currentLead.branch}</span>
                                    </div>
                                    {currentLead.status === "positive" && (
                                        <div className="lead-status positive">
                                            <FiCheck />
                                            <span>Ijobiy aloqa</span>
                                        </div>
                                    )}
                                    {currentLead.status === "archived" && (
                                        <div className="lead-status archived">
                                            <FiArchive />
                                            <span>Arxivlangan</span>
                                        </div>
                                    )}
                                    {currentLead.month === "previous" && (
                                        <div className="lead-status previous-month">
                                            <FiCalendar />
                                            <span>O'tgan oydan</span>
                                        </div>
                                    )}
                                    {currentLead.month === "next" && (
                                        <div className="lead-status next-month">
                                            <FiCalendar />
                                            <span>Keyingi oyga</span>
                                        </div>
                                    )}
                                </div>
                                <div className="lead-actions">
                                    <button className="lead-action-btn call" onClick={() => handleCallAction(currentLead.phone)}>
                                        <FiPhone />
                                        <span>Qo'ng'iroq</span>
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Telefon raqami:</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={currentLead.phone}
                                    onChange={handleEditInputChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Manba:</label>
                                <select
                                    name="source"
                                    value={currentLead.source || ""}
                                    onChange={handleEditInputChange}
                                    className="form-control"
                                >
                                    <option value="" disabled>
                                        Manbani tanlang
                                    </option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Telegram">Telegram</option>
                                    <option value="Website">Website</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Filial:</label>
                                <select
                                    name="branch"
                                    value={currentLead.branch || ""}
                                    onChange={handleEditInputChange}
                                    className="form-control"
                                >
                                    <option value="" disabled>
                                        Filialni tanlang
                                    </option>
                                    {branches.slice(1).map((branch) => (
                                        <option key={branch} value={branch}>
                                            {branch}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Eslatma sanasi:</label>
                                <input
                                    type="date"
                                    name="reminder"
                                    value={currentLead.reminder || ""}
                                    onChange={handleEditInputChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Izoh:</label>
                                <textarea
                                    name="notes"
                                    value={currentLead.notes || ""}
                                    onChange={handleEditInputChange}
                                    className="form-control"
                                    rows={4}
                                ></textarea>
                            </div>

                            <div className="lead-history">
                                <h4>Tarix</h4>
                                <div className="history-item">
                                    <div className="history-date">{currentLead.date}</div>
                                    <div className="history-action">Lid yaratildi</div>
                                </div>
                                {currentLead.reminder && (
                                    <div className="history-item">
                                        <div className="history-date">{currentLead.reminder}</div>
                                        <div className="history-action">Eslatma belgilangan</div>
                                    </div>
                                )}
                                {currentLead.scheduledDate && (
                                    <div className="history-item">
                                        <div className="history-date">{currentLead.scheduledDate}</div>
                                        <div className="history-action">Rejalashtirish belgilangan</div>
                                    </div>
                                )}
                            </div>

                            <div className="lead-action-buttons">
                                <button className="action-btn positive" onClick={() => openActionModal("positive")}>
                                    <FiStar />
                                    <span>Ijobiy aloqa</span>
                                </button>
                                <button className="action-btn reminder" onClick={() => openActionModal("reminder")}>
                                    <FiBell />
                                    <span>Eslatma</span>
                                </button>
                                <button className="action-btn schedule" onClick={() => openActionModal("schedule")}>
                                    <FiCalendar />
                                    <span>Rejalashtirish</span>
                                </button>
                                <button className="action-btn archive" onClick={() => openActionModal("archive")}>
                                    <FiArchive />
                                    <span>Arxivlash</span>
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="delete-lead-btn"
                                onClick={() => {
                                    handleDeleteLead(currentLead.id, currentColumnId)
                                    setShowLeadDetailsModal(false)
                                }}
                            >
                                O'CHIRISH
                            </button>
                            <button className="update-lead-btn" onClick={handleUpdateLead}>
                                SAQLASH
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reminder Modal */}
            {showReminderModal && currentLead && (
                <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
                    <div className="modal reminder-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Eslatma o'rnatish</h2>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowReminderModal(false)
                                    setCurrentLead(null)
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="reminder-info">
                                <p>Lid boshqa bo'limga o'tkazildi. Eslatma o'rnatishni xohlaysizmi?</p>
                                <p>
                                    <strong>{currentLead.name}</strong> uchun eslatma sanasini tanlang:
                                </p>
                            </div>
                            <div className="form-group">
                                <input
                                    type="date"
                                    name="reminder"
                                    value={currentLead.reminder || ""}
                                    onChange={handleEditInputChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="skip-btn"
                                onClick={() => {
                                    setShowReminderModal(false)
                                    setCurrentLead(null)
                                }}
                            >
                                O'TKAZIB YUBORISH
                            </button>
                            <button className="set-reminder-btn" onClick={handleSetReminder}>
                                ESLATMA O'RNATISH
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reminders List Modal */}
            {showReminders && (
                <div className="modal-overlay" onClick={() => setShowReminders(false)}>
                    <div className="modal reminders-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Bugungi eslatmalar</h2>
                            <button className="close-btn" onClick={() => setShowReminders(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {reminders.length > 0 ? (
                                <div className="reminders-list">
                                    {reminders.map((reminder) => (
                                        <div key={reminder.id} className="reminder-item">
                                            <div className="reminder-icon">
                                                <FiBell />
                                            </div>
                                            <div className="reminder-content">
                                                <h4>{reminder.name}</h4>
                                                <p>Bo'lim: {reminder.department}</p>
                                                <p>Eslatma sanasi: {reminder.reminder}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-reminders">Bugun uchun eslatmalar yo'q</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="close-reminders-btn" onClick={() => setShowReminders(false)}>
                                YOPISH
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Menu Modal */}
            {showLeadMenuModal && currentLead && (
                <div
                    className="lead-menu-modal"
                    style={{ top: menuPosition.y, left: menuPosition.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="lead-menu-item" onClick={() => handleViewLeadDetails(currentLead, currentColumnId)}>
                        <FiUser />
                        <span>Tahrirlash</span>
                    </div>
                    <div className="lead-menu-item" onClick={() => openActionModal("positive")}>
                        <FiStar />
                        <span>Ijobiy aloqa</span>
                    </div>
                    <div className="lead-menu-item" onClick={() => openActionModal("reminder")}>
                        <FiBell />
                        <span>Eslatma</span>
                    </div>
                    <div className="lead-menu-item" onClick={() => openActionModal("schedule")}>
                        <FiCalendar />
                        <span>Rejalashtirish</span>
                    </div>
                    <div className="lead-menu-item" onClick={() => openActionModal("archive")}>
                        <FiArchive />
                        <span>Arxivlash</span>
                    </div>
                    <div
                        className="lead-menu-item delete"
                        onClick={() => {
                            handleDeleteLead(currentLead.id, currentColumnId)
                            setShowLeadMenuModal(false)
                        }}
                    >
                        <FiTrash2 />
                        <span>O'chirish</span>
                    </div>
                </div>
            )}

            {/* Lead Action Modal */}
            {showLeadActionModal && currentLead && (
                <div className="modal-overlay" onClick={() => setShowLeadActionModal(false)}>
                    <div className="modal action-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {actionType === "positive" && "Ijobiy aloqaga o'tkazish"}
                                {actionType === "reminder" && "Eslatma o'rnatish"}
                                {actionType === "schedule" && "Rejalashtirish"}
                                {actionType === "archive" && "Arxivlash"}
                                {actionType === "next-month" && "Keyingi oyga o'tkazish"}
                            </h2>
                            <button className="close-btn" onClick={() => setShowLeadActionModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="action-info">
                                <p>
                                    <strong>{currentLead.name}</strong> uchun {actionType === "positive" && "ijobiy aloqaga o'tkazish"}
                                    {actionType === "reminder" && "eslatma o'rnatish"}
                                    {actionType === "schedule" && "rejalashtirish"}
                                    {actionType === "archive" && "arxivlash"}
                                    {actionType === "next-month" && "keyingi oyga o'tkazish"}
                                </p>
                            </div>

                            {actionType === "reminder" && (
                                <div className="form-group">
                                    <label>Eslatma sanasi:</label>
                                    <input
                                        type="date"
                                        value={reminderDate}
                                        onChange={(e) => setReminderDate(e.target.value)}
                                        className="form-control"
                                        required
                                    />
                                </div>
                            )}

                            {actionType === "schedule" && (
                                <div className="form-group">
                                    <label>Rejalashtirish sanasi:</label>
                                    <input
                                        type="date"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        className="form-control"
                                        required
                                    />
                                </div>
                            )}

                            {(actionType === "reminder" || actionType === "schedule") && (
                                <div className="form-group">
                                    <label>Izoh (ixtiyoriy):</label>
                                    <textarea
                                        value={actionNote}
                                        onChange={(e) => setActionNote(e.target.value)}
                                        className="form-control"
                                        rows={3}
                                        placeholder="Izoh qo'shing..."
                                    ></textarea>
                                </div>
                            )}

                            {(actionType === "positive" || actionType === "archive" || actionType === "next-month") && (
                                <div className="confirmation-message">
                                    <div className="confirmation-icon">
                                        {actionType === "positive" && <FiStar />}
                                        {actionType === "archive" && <FiArchive />}
                                        {actionType === "next-month" && <FiCalendar />}
                                    </div>
                                    <p>
                                        {actionType === "positive" &&
                                            "Lidni ijobiy aloqaga o'tkazmoqchimisiz? Bu lid ijobiy aloqa bo'limiga o'tkaziladi."}
                                        {actionType === "archive" && "Lidni arxivlamoqchimisiz? Bu lid arxiv bo'limiga o'tkaziladi."}
                                        {actionType === "next-month" &&
                                            "Lidni keyingi oyga o'tkazmoqchimisiz? Bu lid keyingi oy uchun belgilanadi."}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowLeadActionModal(false)}>
                                BEKOR QILISH
                            </button>
                            <button
                                className={`confirm-btn ${actionType}`}
                                onClick={() => {
                                    if (actionType === "positive") handleSetLeadToPositive()
                                    else if (actionType === "reminder") handleSetLeadReminder()
                                    else if (actionType === "schedule") handleScheduleLead()
                                    else if (actionType === "archive") handleArchiveLead()
                                    else if (actionType === "next-month") handleSetLeadToNextMonth()
                                }}
                                disabled={(actionType === "reminder" && !reminderDate) || (actionType === "schedule" && !scheduleDate)}
                            >
                                <FiArrowRight />
                                <span>
                                    {actionType === "positive" && "IJOBIY ALOQAGA O'TKAZISH"}
                                    {actionType === "reminder" && "ESLATMA O'RNATISH"}
                                    {actionType === "schedule" && "REJALASHTIRISH"}
                                    {actionType === "archive" && "ARXIVLASH"}
                                    {actionType === "next-month" && "KEYINGI OYGA O'TKAZISH"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay to close lead menu when clicking outside */}
            {showLeadMenuModal && <div className="overlay" onClick={() => setShowLeadMenuModal(false)}></div>}

            {/* Context Menu */}
            {showContextMenu && contextMenuLead && (
                <>
                    <div className="context-menu" style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}>
                        <div
                            className="context-menu-item"
                            onClick={() => {
                                setShowContextMenu(false)
                                handleViewLeadDetails(contextMenuLead, currentColumnId)
                            }}
                        >
                            <FiUser />
                            <span>Tahrirlash</span>
                        </div>
                        <div
                            className="context-menu-item"
                            onClick={() => {
                                setShowContextMenu(false)
                                setCurrentLead(contextMenuLead)
                                openActionModal("positive")
                            }}
                        >
                            <FiStar />
                            <span>Ijobiy aloqa</span>
                        </div>
                        <div
                            className="context-menu-item"
                            onClick={() => {
                                setShowContextMenu(false)
                                setCurrentLead(contextMenuLead)
                                openActionModal("reminder")
                            }}
                        >
                            <FiBell />
                            <span>Eslatma</span>
                        </div>
                        <div
                            className="context-menu-item"
                            onClick={() => {
                                setShowContextMenu(false)
                                setCurrentLead(contextMenuLead)
                                openActionModal("schedule")
                            }}
                        >
                            <FiCalendar />
                            <span>Rejalashtirish</span>
                        </div>
                        <div
                            className="context-menu-item"
                            onClick={() => {
                                setShowContextMenu(false)
                                setCurrentLead(contextMenuLead)
                                openActionModal("archive")
                            }}
                        >
                            <FiArchive />
                            <span>Arxivlash</span>
                        </div>
                        <div
                            className="context-menu-item delete"
                            onClick={() => {
                                setShowContextMenu(false)
                                handleDeleteLead(contextMenuLead.id, currentColumnId)
                            }}
                        >
                            <FiTrash2 />
                            <span>O'chirish</span>
                        </div>
                    </div>
                    <div className="overlay" onClick={() => setShowContextMenu(false)}></div>
                </>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="modal report-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Hisobot</h2>
                            <button className="close-btn" onClick={() => setShowReportModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const report = generateFinancialReport()
                                return (
                                    <div className="report-content">
                                        <div className="report-section">
                                            <h3>Umumiy ma'lumotlar</h3>
                                            <div className="report-stats">
                                                <div className="report-stat-item">
                                                    <div className="stat-icon total">
                                                        <FiUsers />
                                                    </div>
                                                    <div className="stat-info">
                                                        <span className="stat-value">{report.totalLeads}</span>
                                                        <span className="stat-label">Jami lidlar</span>
                                                    </div>
                                                </div>
                                                <div className="report-stat-item">
                                                    <div className="stat-icon active">
                                                        <FiUser />
                                                    </div>
                                                    <div className="stat-info">
                                                        <span className="stat-value">{report.activeLeads}</span>
                                                        <span className="stat-label">Faol lidlar</span>
                                                    </div>
                                                </div>
                                                <div className="report-stat-item">
                                                    <div className="stat-icon positive">
                                                        <FiStar />
                                                    </div>
                                                    <div className="stat-info">
                                                        <span className="stat-value">{report.positiveLeads}</span>
                                                        <span className="stat-label">Ijobiy aloqa</span>
                                                    </div>
                                                </div>
                                                <div className="report-stat-item">
                                                    <div className="stat-icon archived">
                                                        <FiArchive />
                                                    </div>
                                                    <div className="stat-info">
                                                        <span className="stat-value">{report.archivedLeads}</span>
                                                        <span className="stat-label">Arxivlangan</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="report-section">
                                            <h3>Manbalar bo'yicha</h3>
                                            <div className="report-table">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Manba</th>
                                                            <th>Lidlar soni</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(report.sourceData).map(([source, count]) => (
                                                            <tr key={source}>
                                                                <td>{source}</td>
                                                                <td>{count}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="report-section">
                                            <h3>Filiallar bo'yicha</h3>
                                            <div className="report-table">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Filial</th>
                                                            <th>Lidlar soni</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(report.branchData).map(([branch, count]) => (
                                                            <tr key={branch}>
                                                                <td>{branch}</td>
                                                                <td>{count}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                        <div className="modal-footer">
                            <button className="close-reminders-btn" onClick={() => setShowReportModal(false)}>
                                YOPISH
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DirectorLid
