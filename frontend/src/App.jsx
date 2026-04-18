import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const API = import.meta.env.VITE_API_URL;
  console.log(import.meta.env.VITE_API_URL);
  const [tab, setTab] = useState("add");

  const [filter, setFilter] = useState({
    year: "",
    quarter: ""
  });

  const [form, setForm] = useState({
    name: "",
    flat: "",
    sinkingFund: "",
    maintenance: "",
    municipalTax: "",
    water: "",
    electricity: "",
    parking: "",
    insurance: "",
    service: "",
    interest: "",
    nonOccupancy: "",
    training: "",
    year: "",
    quarter: ""
  });

  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/report");
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------- ADD USER ----------------
  const addUser = async () => {
    if (!form.name || !form.flat) {
      alert("Enter name and flat");
      return;
    }

    try {
      await axios.post(`${API}/api/users`, form);

      setForm({
        name: "",
        flat: "",
        sinkingFund: "",
        maintenance: "",
        municipalTax: "",
        water: "",
        electricity: "",
        parking: "",
        insurance: "",
        service: "",
        interest: "",
        nonOccupancy: "",
        training: "",
        year: "",
        quarter: ""
      });

      fetchData();
    } catch (err) {
      console.error("Add user error:", err);
    }
  };

  // ---------------- BULK UPLOAD ----------------
  const uploadFile = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/api/upload", formData);
      setFile(null);
      fetchData();
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // ---------------- PDF ----------------
  const downloadPDF = (flat, year, quarter) => {
    window.open(`/api/report/pdf/${flat}/${year}/${quarter}`, "_blank");
  };

  // ✅ FILTERED DATA (FIXED)
  const filteredData = data.filter((u) => {
    return (
      (!filter.year || u.year === filter.year) &&
      (!filter.quarter || u.quarter === filter.quarter)
    );
  });

  return (
    <div className="container">
      <h1>Society Management</h1>

      {/* Tabs */}
      <div className="tabs">
        <button onClick={() => setTab("add")} className={tab === "add" ? "active" : ""}>
          Individual Entry
        </button>

        <button onClick={() => setTab("upload")} className={tab === "upload" ? "active" : ""}>
          Bulk Entry
        </button>

        <button onClick={() => setTab("expenses")} className={tab === "expenses" ? "active" : ""}>
          Expenses
        </button>

        <button onClick={() => setTab("report")} className={tab === "report" ? "active" : ""}>
          Reports
        </button>
      </div>

      {/* ---------------- ADD ---------------- */}
      {tab === "add" && (
        <div>
          <h2>Individual Entry</h2>

          <div className="row">
            <select
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            >
              <option value="">Select Year</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>

            <select
              value={form.quarter}
              onChange={(e) => setForm({ ...form, quarter: e.target.value })}
            >
              <option value="">Select Quarter</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>

          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Flat No"
            value={form.flat}
            onChange={(e) => setForm({ ...form, flat: e.target.value })}
          />

          {/* Rest fields */}
          <div className="row">
            <input placeholder="Sinking Fund" value={form.sinkingFund} onChange={(e) => setForm({ ...form, sinkingFund: e.target.value })} />
            <input placeholder="Maintenance" value={form.maintenance} onChange={(e) => setForm({ ...form, maintenance: e.target.value })} />
          </div>

          <div className="row">
            <input placeholder="Municipal Tax" value={form.municipalTax} onChange={(e) => setForm({ ...form, municipalTax: e.target.value })} />
            <input placeholder="Water" value={form.water} onChange={(e) => setForm({ ...form, water: e.target.value })} />
          </div>

          <div className="row">
            <input placeholder="Electricity" value={form.electricity} onChange={(e) => setForm({ ...form, electricity: e.target.value })} />
            <input placeholder="Parking" value={form.parking} onChange={(e) => setForm({ ...form, parking: e.target.value })} />
          </div>

          <div className="row">
            <input placeholder="Insurance" value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })} />
            <input placeholder="Service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
          </div>

          <div className="row">
            <input placeholder="Interest" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} />
            <input placeholder="Non-Occupancy" value={form.nonOccupancy} onChange={(e) => setForm({ ...form, nonOccupancy: e.target.value })} />
          </div>

          <input placeholder="Training" value={form.training} onChange={(e) => setForm({ ...form, training: e.target.value })} />

          <button onClick={addUser}>Save</button>
        </div>
      )}

      {/* ---------------- REPORT ---------------- */}
      {tab === "report" && (
        <div>
          <h2>Reports</h2>

          <div className="row">
            <select value={filter.year} onChange={(e) => setFilter({ ...filter, year: e.target.value })}>
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>

            <select value={filter.quarter} onChange={(e) => setFilter({ ...filter, quarter: e.target.value })}>
              <option value="">All Quarters</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Flat</th>
                  <th>Year</th>
                  <th>Quarter</th>
                  <th>PDF</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((u, i) => (
                    <tr key={i}>
                      <td>{u.name}</td>
                      <td>{u.flat}</td>
                      <td>{u.year}</td>
                      <td>{u.quarter}</td>
                      <td>
                        <button onClick={() => downloadPDF(u.flat, u.year, u.quarter)}>
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ---------------- EXPENSES ---------------- */}
      {tab === "expenses" && (
        <div>
          <h2>Expenses</h2>
          <p>Coming soon...</p>
        </div>
      )}
    </div>
  );
}

export default App;