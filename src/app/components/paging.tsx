import React from "react";
import { Pagination } from "react-bootstrap";

interface PagingProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxPageButtons?: number;
}

const Paging = ({
    currentPage,
    totalPages,
    onPageChange,
    maxPageButtons = 7,
}: PagingProps) => {
    if (totalPages <= 1) return null;

    const pageItems = [];

    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxPageButtons) {
        const half = Math.floor(maxPageButtons / 2);
        if (currentPage <= half) {
            startPage = 1;
            endPage = maxPageButtons;
        } else if (currentPage + half >= totalPages) {
            startPage = totalPages - maxPageButtons + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - half;
            endPage = currentPage + half;
            if (maxPageButtons % 2 === 0) {
                endPage -= 1;
            }
        }
    }

    // First page
    if (startPage > 1) {
        pageItems.push(
            <Pagination.Item key={1} active={currentPage === 1} onClick={() => onPageChange(1)}>
                1
            </Pagination.Item>
        );
        if (startPage > 2) {
            pageItems.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        }
    }

    // Main page range
    for (let i = startPage; i <= endPage; i++) {
        pageItems.push(
            <Pagination.Item
                key={i}
                active={currentPage === i}
                onClick={() => onPageChange(i)}
            >
                {i}
            </Pagination.Item>
        );
    }

    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageItems.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
        }
        pageItems.push(
            <Pagination.Item
                key={totalPages}
                active={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
            >
                {totalPages}
            </Pagination.Item>
        );
    }

    return (
        <Pagination>
            <Pagination.First
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            />
            <Pagination.Prev
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            />
            {pageItems}
            <Pagination.Next
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            />
            <Pagination.Last
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            />
        </Pagination>
    );
};

export default Paging;
