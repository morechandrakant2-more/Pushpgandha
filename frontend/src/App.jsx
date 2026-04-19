import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Login from "./Login";

function App() {

  const API = import.meta.env.VITE_API_URL;

  // ✅ LOGIN STATE
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [token, setToken] = useState(localStorage.getItem("token"));

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
    quarter: "",
    adjustments: "",
    adjustmentRemark: "",
    penaltyCharges: ""

  });

  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/api/report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  // ---------------- ADD USER ----------------
  const addUser = async () => {
  // ---------------- BASIC VALIDATION ----------------
  if (!form.name || !form.flat) {
    alert("Please enter Name and Flat");
    return;
  }

  // ---------------- FIELD LABELS (for UI messages) ----------------
  const fieldLabels = {
    sinkingFund: "Sinking Fund",
    maintenance: "Maintenance",
    municipalTax: "Municipal Tax",
    water: "Water",
    electricity: "Electricity",
    parking: "Parking",
    insurance: "Insurance",
    service: "Service",
    interest: "Interest on Default Dues",
    nonOccupancy: "Non-Occupancy",
    training: "Training",
    adjustments: "Adjustments",
    penaltyCharges: "Penalty Charges"
  };

  const numericFields = Object.keys(fieldLabels);

  let updatedForm = { ...form };

  let emptyFields = [];
  let invalidFields = [];

  // ---------------- VALIDATION LOOP ----------------
  numericFields.forEach((field) => {
    const value = updatedForm[field];

    // Check empty
    if (value === "" || value === null || value === undefined) {
      emptyFields.push(fieldLabels[field]);
    }

    // Check non-number (only if not empty)
    else if (isNaN(value)) {
      invalidFields.push(fieldLabels[field]);
    }

    // Convert to number
    else {
      updatedForm[field] = Number(value);
    }
  });

  // ---------------- HANDLE ERRORS ----------------

  // ❌ Empty fields
  if (emptyFields.length > 0) {
    alert(
      `Please enter values for:\n\n${emptyFields.join(", ")}\n\nIf not applicable, enter 0.`
    );
    return;
  }

  // ❌ Invalid numbers
  if (invalidFields.length > 0) {
    alert(
      `These fields must be numbers:\n\n${invalidFields.join(", ")}`
    );
    return;
  }

  // ---------------- API CALL ----------------
  try {
    await axios.post(`${API}/api/users`, updatedForm, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ Reset form
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
      quarter: "",
      adjustments: "",
      adjustmentRemark: "",
      penaltyCharges: ""
    });

    fetchData();

  } catch (err) {
    console.error("Add user error:", err);
    alert("Failed to save data");
  }
};
  // ---------------- BULK UPLOAD ----------------
  const uploadFile = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API}/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFile(null);
      fetchData();
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // ---------------- PDF ----------------
  const downloadPDF = (flat, year, quarter) => {
    window.open(`${API}/api/report/pdf/${flat}/${year}/${quarter}`, "_blank");
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // ---------------- FILTER ----------------
  const filteredData = data.filter((u) => {
    return (
      (!filter.year || u.year == filter.year) &&
      (!filter.quarter || u.quarter == filter.quarter)
    );
  });


  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn}
                  setToken={setToken}
           />;
  }

  // ---------------- MAIN APP ----------------
  return (
    <div className="container">

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Society Management</h1>
        <button onClick={logout}>Logout</button>
      </div>

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

      {/* FLAT NUMBER */}
  <select
    value={form.flat}
    onChange={(e) => setForm({ ...form, flat: e.target.value })}
  >
    <option value="">Select Flat</option>

    {[...Array(45)].map((_, i) => (
      <option key={i + 1} value={i + 1}>
        {i + 1}
      </option>
    ))}

  </select>
    </div>

    <input
      placeholder="Name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
    />

    <div className="row">
      <input type="number" placeholder="Sinking Fund" value={form.sinkingFund} onChange={(e) => setForm({ ...form, sinkingFund: e.target.value })} />
      <input type="number" placeholder="Maintenance" value={form.maintenance} onChange={(e) => setForm({ ...form, maintenance: e.target.value })} />
    </div>

    <div className="row">
      <input type="number" placeholder="Municipal Tax" value={form.municipalTax} onChange={(e) => setForm({ ...form, municipalTax: e.target.value })} />
      <input type="number" placeholder="Water" value={form.water} onChange={(e) => setForm({ ...form, water: e.target.value })} />
    </div>

    <div className="row">
      <input type="number" placeholder="Electricity" value={form.electricity} onChange={(e) => setForm({ ...form, electricity: e.target.value })} />
      <input type="number" placeholder="Parking" value={form.parking} onChange={(e) => setForm({ ...form, parking: e.target.value })} />
    </div>

    <div className="row">
      <input type="number" placeholder="Insurance" value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })} />
      <input type="number" placeholder="Service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
    </div>

    <div className="row">
      <input type="number" placeholder="Interest on default dues" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} />
      <input type="number" placeholder="Non-Occupancy" value={form.nonOccupancy} onChange={(e) => setForm({ ...form, nonOccupancy: e.target.value })} />
    </div>
    
    <div className="row">
      <input type="number" placeholder="Training" value={form.training} onChange={(e) => setForm({ ...form, training: e.target.value })} />
      <input type="number" placeholder="Penalty Charges" value={form.penaltyCharges} onChange={(e) => setForm({ ...form, penaltyCharges: e.target.value })} />
    </div>

    <div className="row">
    <input placeholder="Remark for Adjustments" value={form.adjustmentRemark} onChange={(e) => setForm({ ...form, adjustmentRemark: e.target.value })} />
    <input type="number" placeholder="Adjustments" value={form.adjustments} onChange={(e) => setForm({ ...form, adjustments: e.target.value })} />
    </div>


    <button onClick={addUser}>Save</button>
  </div>
)}
      {/* ---------------- REPORT ---------------- */}
      {tab === "report" && (
        <div>
          <div className="row">
      <select
        value={filter.year}
        onChange={(e) =>
          setFilter({ ...filter, year: e.target.value })
        }
      >
        <option value="">All Years</option>
        <option value="2026">2026</option>
        <option value="2027">2027</option>
        <option value="2028">2028</option>
      </select>

      <select
        value={filter.quarter}
        onChange={(e) =>
          setFilter({ ...filter, quarter: e.target.value })
        }
      >
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
                          PDF
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

      {/* ---------------- Bulk Entry ---------------- */}
      {tab === "upload" && (
        <div>
          <p>Coming soon...</p>
        </div>
      )}

      {/* ---------------- EXPENSES ---------------- */}
      {tab === "expenses" && (
        <div>
          <p>Coming soon...</p>
        </div>
      )}
    </div>

  );
}

export default App;