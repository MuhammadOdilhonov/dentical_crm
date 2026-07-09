"use client"
import ReactPaginate from "react-paginate"

const Pagination = ({ pageCount, currentPage, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
    // Calculate the range of items being displayed
    const startItem = currentPage * itemsPerPage + 1
    const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems)
    // Handle page click
    const handlePageClick = (event) => {
        onPageChange(event.selected)
    }

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = Number.parseInt(e.target.value, 10)
        onItemsPerPageChange(newItemsPerPage)
    }

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                {totalItems > 0 ? (
                    <span>
                        Ko'rsatilmoqda {startItem}-{endItem} jami {totalItems} ta
                    </span>
                ) : (
                    <span>Ma'lumot topilmadi</span>
                )}
            </div>

            <div className="pagination-controls">
                <div className="items-per-page">
                    <label htmlFor="itemsPerPage">Sahifada:</label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="items-per-page-select"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <ReactPaginate
                    previousLabel={"←"}
                    nextLabel={"→"}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    pageClassName={"pagination-item"}
                    pageLinkClassName={"pagination-link"}
                    previousClassName={"pagination-item"}
                    previousLinkClassName={"pagination-link"}
                    nextClassName={"pagination-item"}
                    nextLinkClassName={"pagination-link"}
                    breakClassName={"pagination-item"}
                    breakLinkClassName={"pagination-link"}
                    activeClassName={"active"}
                    forcePage={currentPage}
                />
            </div>
        </div>
    )
}

export default Pagination
