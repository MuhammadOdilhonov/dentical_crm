import { FiBell, FiStar, FiArchive, FiCalendar, FiMapPin } from "react-icons/fi"

export function LeadItem({ item }) {
    // Format date to display in a more readable format
    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    return (
        <>
            <div className="item-header">
                <h4>{item.name}</h4>
                <div className="item-indicators">
                    {item.reminder && (
                        <div className="indicator reminder" title="Eslatma">
                            <FiBell />
                        </div>
                    )}
                    {item.status === "positive" && (
                        <div className="indicator positive" title="Ijobiy aloqa">
                            <FiStar />
                        </div>
                    )}
                    {item.status === "archived" && (
                        <div className="indicator archived" title="Arxivlangan">
                            <FiArchive />
                        </div>
                    )}
                    {item.month === "next" && (
                        <div className="indicator next-month" title="Keyingi oy">
                            <FiCalendar />
                        </div>
                    )}
                </div>
            </div>
            <p className="item-phone">{item.phone}</p>
            <div className="item-details">
                {item.source && <span className="item-source">{item.source}</span>}
                {item.branch && (
                    <span className="item-branch">
                        <FiMapPin size={12} /> {item.branch}
                    </span>
                )}
                {item.date && <span className="item-date">{formatDate(item.date)}</span>}
            </div>
            {item.notes && <p className="item-notes">{item.notes}</p>}
        </>
    )
}
