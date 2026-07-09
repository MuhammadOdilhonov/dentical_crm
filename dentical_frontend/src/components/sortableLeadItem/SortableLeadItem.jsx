"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { FiMoreHorizontal, FiPhone } from "react-icons/fi"
import { LeadItem } from "../leadItem/LeadItem"

export function SortableLeadItem({ id, item, onViewDetails, onDeleteLead, onShowMenu, onContextMenu }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleRightClick = (e) => {
        e.preventDefault()
        onContextMenu(e)
    }

    const handlePhoneClick = (e) => {
        e.stopPropagation()
        // Handle call action
        window.open(`tel:${item.phone.replace(/\s+/g, "")}`, "_self")
    }

    return (
        <div className="item-wrapper" ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div
                className={`item ${item.month || ""} ${item.status === "positive" ? "positive" : ""} ${item.status === "archived" ? "archived" : ""}`}
                onContextMenu={handleRightClick}
                onClick={() => onViewDetails(item)}
            >
                <LeadItem item={item} />
                <div className="item-actions">
                    <button
                        className="item-action call"
                        onClick={(e) => {
                            e.stopPropagation() // Prevent the card click event
                            handlePhoneClick(e)
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handlePhoneClick(e)
                        }}
                        title="Qo'ng'iroq qilish"
                    >
                        <FiPhone />
                    </button>
                    <button
                        className="item-action more"
                        onClick={(e) => {
                            e.stopPropagation() // Prevent the card click event
                            onShowMenu(e)
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onShowMenu(e)
                        }}
                        title="Ko'proq"
                    >
                        <FiMoreHorizontal />
                    </button>
                </div>
            </div>
        </div>
    )
}
