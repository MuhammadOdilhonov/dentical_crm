"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { FiMoreHorizontal, FiChevronDown, FiTrash2 } from "react-icons/fi"
import { SortableLeadItem } from "../sortableLeadItem/SortableLeadItem"

export function LeadColumn({
    id,
    title,
    count,
    items,
    color,
    onViewDetails,
    onDeleteLead,
    onDeleteColumn,
    onShowMenu,
    onContextMenu,
}) {
    const { setNodeRef } = useDroppable({
        id,
    })
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div className="column" style={{ borderTopColor: color }}>
            <div className="column-header">
                <div className="column-title">
                    <h3>{title}</h3>
                    <span className="count" style={{ backgroundColor: color }}>
                        {count}
                    </span>
                </div>
                <div className="column-actions">
                    <button
                        className={`collapse-btn ${isCollapsed ? "collapsed" : ""}`}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <FiChevronDown />
                    </button>
                    <div className="column-menu-container">
                        <button
                            className="more-icon"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowMenu(!showMenu)
                            }}
                        >
                            <FiMoreHorizontal />
                        </button>
                        {showMenu && (
                            <div className="column-menu">
                                <button
                                    className="column-menu-item delete"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteColumn()
                                        setShowMenu(false)
                                    }}
                                >
                                    <FiTrash2 />
                                    <span>Bo'limni o'chirish</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {!isCollapsed && (
                <div className="item-list" ref={setNodeRef}>
                    <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                        {items.map((item) => (
                            <SortableLeadItem
                                key={item.id}
                                id={item.id}
                                item={item}
                                onViewDetails={(item) => onViewDetails(item, id)}
                                onDeleteLead={() => onDeleteLead(item.id)}
                                onShowMenu={(e, item) => onShowMenu(e, item, id)}
                                onContextMenu={(e, item) => onContextMenu(e, item, id)}
                            />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    )
}
