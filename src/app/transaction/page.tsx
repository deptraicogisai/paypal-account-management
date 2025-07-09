"use client";
import { useEffect, useRef, useState } from "react";
import { Container, Table, Spinner, Form, Row, Col, Button, Pagination, FormControl, InputGroup } from "react-bootstrap";
import Paging from "../components/paging";
import { BsCalendarDate } from "react-icons/bs";
import { DateRange, DateRangePicker } from 'react-date-range';
import { differenceInCalendarDays, format } from 'date-fns';
import api from "../lib/api";
import transaction from "../lib/paypal/transaction";

const TRANSACTION_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "D", label: "Denied" },
  { value: "P", label: "Pending" },
  { value: "S", label: "Successfully" },
  { value: "V", label: "Refund" },
  // Add more statuses as needed
];

export default function TransactionsPage() {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [message, setMessage] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  // Search form state
  const [startDate, setBeginDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [transactionStatus, setTransactionStatus] = useState<string>("");

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
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {      
      api.setCredential('Aeffc6BWtvabCWmX9NUWOMp-hTRSmaEWY7E8PgVRspQSX5UTDjpy9O9kwZS5xKlRGIKHSSbiqYv7BZqo','EGwNYt4aOZ1HcYoZlxTJK-Vv2Yli9GQuB_SzvfCH8MUtfDjVxczcvi9MGFJItFEAVL2XL1YGhghNNOFH');
      var res = await transaction.getList(range[0].startDate.toString(), range[0].endDate.toString(), currentPage);          
      console.log(res);
      setData(res);
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
  }, [currentPage]);

  // Handler for search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const { startDate, endDate } = range[0];
    if (startDate && endDate) {
      const begin = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - begin.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays > 31) {
        alert("The date range cannot exceed 31 days.");
        return;
      }
      if (begin > end) {
        alert("Begin date cannot be after end date.");
        return;
      }
    }
    setCurrentPage(1);
    fetchTransactions();
  };

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // fetchTransactions depends on currentPage, but setState is async.
    // So, use a useEffect to fetch when currentPage changes.
    // Just update the page here.
  }

  // Handler to reset the search form and show all transactions
  const handleReset = () => {
    setBeginDate("");
    setEndDate("");
    setTransactionStatus("");
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
              <div style={{ position: 'relative', display: 'inline-block' }} ref={wrapperRef}>
                <Form.Label>Search Range Date</Form.Label>
                <InputGroup className="mb-2">
                  <InputGroup.Text id="basic-addon1">
                    <BsCalendarDate />
                  </InputGroup.Text>
                  <Form.Control
                    aria-describedby="basic-addon1"
                    defaultValue={formatted}
                    onClick={() => setOpen(!open)}
                  />
                </InputGroup>
                {open &&
                  (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 999,
                        backgroundColor: '#fff',
                        boxShadow: '0 0 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <DateRange
                        editableDateInputs={true}
                        onChange={handleSelect}
                        months={2}
                        direction="horizontal"
                        showDateDisplay={true}
                        ranges={range}></DateRange>
                    </div>)}
              </div>
            </Col>
            <Col md={2} sm={6} xs={12} className="mb-2 d-flex gap-2">
              <Button type="submit" variant="primary">
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
            {data && data.transactions ? data.total_items : 0} results
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Transaction Id</th>
                <th>Invoice ID</th>
                <th>Amount</th>
                <th>Charged Date</th>
                <th>Payer Info</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data && data.transactions.length > 0 ? (
                data.transactions.map((tx, idx) => (
                  <tr key={tx.transaction_id || idx}>
                    <td>{tx.transaction_id}</td>
                    <td>{tx.invoice_id}</td>
                    <td>{tx.amount}</td>
                    <td>{tx.chargedDate}</td>
                    <td>
                      <ul>
                        <li>{tx.email}</li>
                        <li>{tx.full_name}</li>
                      </ul>
                    </td>
                    <td></td>
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
      <Paging currentPage={currentPage} totalPages={data?.total_pages} onPageChange={handlePageChange}></Paging>

    </Container>
  );
}
