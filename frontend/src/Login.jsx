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

  // ✅ GET TOKEN
  const token = localStorage.getItem("token");

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
    if (!form.name || !form.flat) {
      alert("Enter name and flat");
      return;
    }

    try {
      await axios.post(`${API}/api/users`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  // ✅ SHOW LOGIN FIRST
  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
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
          <h2>Individual Entry</h2>

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

          <button onClick={addUser}>Save</button>
        </div>
      )}

      {/* ---------------- REPORT ---------------- */}
      {tab === "report" && (
        <div>
          <h2>Reports</h2>

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

    </div>
  );
}

export default App;