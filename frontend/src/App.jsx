import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tab, setTab] = useState("add");

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
    training: ""
  });

  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/report");
      setData(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
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
      await axios.post("/api/users", form);

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
        training: ""
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

  // ---------------- PDF (SPECIFIC FLAT) ----------------
  const downloadPDF = (flat) => {
    window.open(`/api/report/pdf/${flat}`, "_blank");
  };

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

          <div className="row">
            <input
              placeholder="Sinking Fund"
              value={form.sinkingFund}
              onChange={(e) => setForm({ ...form, sinkingFund: e.target.value })}
            />
            <input
              placeholder="Maintenance"
              value={form.maintenance}
              onChange={(e) => setForm({ ...form, maintenance: e.target.value })}
            />
          </div>

          <div className="row">
            <input
              placeholder="Municipal Tax"
              value={form.municipalTax}
              onChange={(e) => setForm({ ...form, municipalTax: e.target.value })}
            />
            <input
              placeholder="Water"
              value={form.water}
              onChange={(e) => setForm({ ...form, water: e.target.value })}
            />
          </div>

          <div className="row">
            <input
              placeholder="Electricity"
              value={form.electricity}
              onChange={(e) => setForm({ ...form, electricity: e.target.value })}
            />
            <input
              placeholder="Parking"
              value={form.parking}
              onChange={(e) => setForm({ ...form, parking: e.target.value })}
            />
          </div>

          <div className="row">
            <input
              placeholder="Insurance"
              value={form.insurance}
              onChange={(e) => setForm({ ...form, insurance: e.target.value })}
            />
            <input
              placeholder="Service"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
            />
          </div>

          <div className="row">
            <input
              placeholder="Interest"
              value={form.interest}
              onChange={(e) => setForm({ ...form, interest: e.target.value })}
            />
            <input
              placeholder="Non-Occupancy"
              value={form.nonOccupancy}
              onChange={(e) => setForm({ ...form, nonOccupancy: e.target.value })}
            />
          </div>

          <input
            placeholder="Training"
            value={form.training}
            onChange={(e) => setForm({ ...form, training: e.target.value })}
          />

          <button onClick={addUser}>Save</button>
        </div>
      )}

      {/* ---------------- BULK UPLOAD ---------------- */}
      {tab === "upload" && (
        <div>
          <h2>Bulk Upload</h2>

          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={uploadFile}>Upload CSV</button>
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
                  <th>PDF</th> {/* ✅ Added */}
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((u, i) => (
                    <tr key={i}>
                      <td>{u.name}</td>
                      <td>{u.flat}</td>
                      <td>
                        <button onClick={() => downloadPDF(u.flat)}>
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No data</td>
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