"use client";
import { use, useEffect, useRef, useState } from "react";
import { Container, Table, Spinner, Form, Row, Col, Button, Pagination, FormControl, InputGroup } from "react-bootstrap";
import Paging from "@/app/components/paging";
import { BsCalendarDate } from "react-icons/bs";
import { DateRange } from 'react-date-range';
import { differenceInCalendarDays, format } from 'date-fns';
import api from "@/app/lib/api";
import transaction from "@/app/lib/paypal/transaction";
import spHelper from "@/app/lib/supabase/supabaseHelper";
import tracking from "@/app/lib/paypal/tracking";

const TRANSACTION_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "D", label: "Denied" },
  { value: "P", label: "Pending" },
  { value: "S", label: "Successfully" },
  { value: "V", label: "Refund" },
  // Add more statuses as needed
];

const PAGE_SIZE = process.env.NEXT_PUBLIC_PAGE_SIZE;

export default function TransactionsPage({ params }: { params: Promise<{ id: number }> }) {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Search form state
  const [startDate, setBeginDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { id } = use(params); // unwrap the promise properly
  const [range, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  // For filtered results
  const [pagingTransactions, setPagingTransactions] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState<number>();
  const [searchTransactionId, setSearchTransactionId] = useState<string>();
  const [filterTransaction, setFilteredTransactions] = useState<any[]>([]);
  const [dateSearch, setDateSearch] = useState<number>();
  const isSandbox = Number(process.env.NEXT_PUBLIC_SANDBOX);

  const dateSearchOptions = [{
    "label": "Past 30 days",
    "value": 1,
  }, {
    "label": "Past 90 days",
    "value": 2,
  }, {
    "label": new Date().getFullYear(),
    "value": 3,
  }, {
    "label": new Date().getFullYear() - 1,
    "value": 4,
  }];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      var accountDetail = await spHelper.getAccount(id);
      if (isSandbox == 0) {
        api.setCredential(accountDetail.data?.client_id, accountDetail.data?.client_secret);
      }
      else {
        api.setCredential(accountDetail.data?.sandbox_client_id, accountDetail.data?.sandbox_client_secret);
      }
      var data = await transaction.getList(range[0].startDate.toString(), range[0].endDate.toString(), currentPage);
      const pagedItems = data.transactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
      await includeTracking(pagedItems);
      console.log(pagedItems);
      const total = Math.ceil((data?.transactions?.length ?? 0) / PAGE_SIZE);
      setTotalPage(total);
      debugger;
      setPagingTransactions(pagedItems);
      setData(data.transactions);
      setFilteredTransactions(data?.transactions);
    } catch (error) {
      setData([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handler for search form submit
  const handleSearch = async () => {
    var filterTransaction = data.filter(
      (tx) => !searchTransactionId || tx.transaction_id?.toString().toLowerCase().includes(searchTransactionId.toLowerCase())
    );
    const pagedItems = filterTransaction.slice(0, PAGE_SIZE);
    await includeTracking(pagedItems);
    setPagingTransactions(pagedItems);
    setFilteredTransactions(filterTransaction);
    if (!searchTransactionId) {
      setFilteredTransactions(data);
    }
    const total = Math.ceil((filterTransaction.length) / PAGE_SIZE);
    setTotalPage(total);
    setCurrentPage(1);
    // const { startDate, endDate } = range[0];
    // if (startDate && endDate) {
    //   const begin = new Date(startDate);
    //   const end = new Date(endDate);
    //   const diffTime = end.getTime() - begin.getTime();
    //   const diffDays = diffTime / (1000 * 60 * 60 * 24);

    //   if (diffDays > 31) {
    //     alert("The date range cannot exceed 31 days.");
    //     return;
    //   }
    //   if (begin > end) {
    //     alert("Begin date cannot be after end date.");
    //     return;
    //   }
    // }
    // setCurrentPage(1);
    // fetchTransactions();
  };

  const includeTracking = async (items: any[]) => {
    var transaction_ids = items
      .filter(item => !item.tracking)
      .map(item => item.transaction_id);
    var trackings = await tracking.getTracking(transaction_ids);
    // Loop through items and add the corresponding tracking object to each item
    // Instead of mutating items in-place, return a new array with tracking info merged
    const result: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const trackingObj = trackings.find(trk => trk.transaction_id === item.transaction_id);
      items[i] = { ...item, tracking: trackingObj || null };
    }
  }

  const handleSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    const days = differenceInCalendarDays(endDate, startDate);

    if (days > 31) {
      alert("You can only select a range of up to 31 days.");
      return; // prevent update
    }

    ranges.selection.startDate = format(new Date(startDate), 'MM/dd/yyyy');
    ranges.selection.endDate = format(new Date(endDate), 'MM/dd/yyyy');
    setState([ranges.selection]);
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    setCurrentPage(page);
    const pagedItems = filterTransaction.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    await includeTracking(pagedItems);
    setPagingTransactions(pagedItems);
    setLoading(false);
  }

  // Handler to reset the search form and show all transactions
  const handleReset = async () => {
    setSearchTransactionId("");
    setCurrentPage(1);
    await fetchTransactions();
  };

  const formatted = `${format(range[0].startDate, 'MM/dd/yyyy')} - ${format(
    range[0].endDate,
    'MM/dd/yyyy'
  )}`;

  // Inline style for the search form border highlight
  const searchFormStyle: React.CSSProperties = {
    border: "1px solid gray",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
    background: "#f8f9fa"
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Transactions</h2>
      {/* Search Form Section */}
      <div style={searchFormStyle}>
        <Form onSubmit={handleSearch}>
          <Row className="align-items-end">

            <Col md={3} sm={6} xs={12}>
              <Form.Label>Transaction ID</Form.Label>
              <Form.Control
                type="text"
                aria-describedby="basic-addon1"
                value={searchTransactionId || ""}
                onChange={(e) => setSearchTransactionId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Optionally, you can trigger the form submit here if needed
                    // e.currentTarget.form?.requestSubmit();
                    handleSearch();
                  }
                }}
              />
            </Col>
            <Col md={2} sm={6} xs={12} className="mb-2 d-flex gap-2">
              <Button onClick={handleSearch} variant="primary">
                Search
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset}>
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <Spinner animation="border" />
        </div>
      ) : (
        <div>
          <div className="text-end my-2">
            {filterTransaction?.length} results
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Transaction Id</th>
                <th>Invoice ID</th>
                <th>Amount</th>
                <th>Charged Date</th>
                <th>Payer Info</th>
                <th>Tracking</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pagingTransactions && pagingTransactions?.length > 0 ? (
                pagingTransactions.map((tx, idx) => (
                  <tr key={tx.transaction_id || idx}>
                    <td>{tx.transaction_id}</td>
                    <td>{tx.invoice_id}</td>
                    <td>${tx.amount} USD</td>
                    <td>{tx.chargedDate}</td>
                    <td>
                      <ul>
                        <li>{tx.email}</li>
                        <li>{tx.full_name}</li>
                      </ul>
                    </td>
                    <td>
                      {tx.tracking?.tracking_number ? (
                        <>
                          <p>
                            <a
                              href={`https://t.17track.net/en#nums=${tx.tracking?.tracking_number}`}
                              target="_blank"
                              className="tracking_link"
                            >
                              {tx.tracking.tracking_number}
                            </a>
                          </p>
                          <p>
                            Carrier : {tx.tracking?.carrier}
                          </p></>
                      ) : (
                        ""
                      )}
                    </td>
                    <td>{tx.tracking?.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
      <Paging currentPage={currentPage} totalPages={totalPage ?? 0} onPageChange={handlePageChange}></Paging>

    </Container>
  );
}
