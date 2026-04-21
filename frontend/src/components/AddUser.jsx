import { useState } from "react";
import { addUserAPI } from "../services/api";

function AddUser({ token, fetchData }) {
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

  const handleSubmit = async () => {
    if (!form.name || !form.flat) {
      alert("Name & Flat required");
      return;
    }

    try {
      await addUserAPI(form, token);
      alert("Saved successfully ✅");

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
      console.error(err);
      alert("Failed to save data ❌");
    }
  };

  return (
    <div>

      {/* Year + Quarter */}
      <div className="row">
        <select
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        >
          <option value="">Year</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>

        <select
          value={form.quarter}
          onChange={(e) => setForm({ ...form, quarter: e.target.value })}
        >
          <option value="">Quarter</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>

        <select
        value={form.flat}
        onChange={(e) => setForm({ ...form, flat: e.target.value })}
      >
        <option value="">Flat</option>
        {[...Array(45)].map((_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}</option>
        ))}
      </select>
      </div>

      {/* Name + Flat */}
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      {/* Charges */}
      <div className="row">
        <input type="number" placeholder="Sinking Fund"
          value={form.sinkingFund}
          onChange={(e) => setForm({ ...form, sinkingFund: e.target.value })}
        />
        <input type="number" placeholder="Maintenance"
          value={form.maintenance}
          onChange={(e) => setForm({ ...form, maintenance: e.target.value })}
        />
      </div>

      <div className="row">
        <input type="number" placeholder="Municipal Tax"
          value={form.municipalTax}
          onChange={(e) => setForm({ ...form, municipalTax: e.target.value })}
        />
        <input type="number" placeholder="Water"
          value={form.water}
          onChange={(e) => setForm({ ...form, water: e.target.value })}
        />
      </div>

      <div className="row">
        <input type="number" placeholder="Electricity"
          value={form.electricity}
          onChange={(e) => setForm({ ...form, electricity: e.target.value })}
        />
        <input type="number" placeholder="Parking"
          value={form.parking}
          onChange={(e) => setForm({ ...form, parking: e.target.value })}
        />
      </div>

      <div className="row">
        <input type="number" placeholder="Insurance"
          value={form.insurance}
          onChange={(e) => setForm({ ...form, insurance: e.target.value })}
        />
        <input type="number" placeholder="Service"
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
        />
      </div>

      <div className="row">
        <input type="number" placeholder="Interest"
          value={form.interest}
          onChange={(e) => setForm({ ...form, interest: e.target.value })}
        />
        <input type="number" placeholder="Non Occupancy"
          value={form.nonOccupancy}
          onChange={(e) => setForm({ ...form, nonOccupancy: e.target.value })}
        />
      </div>

      <div className="row">
        <input type="number" placeholder="Training"
          value={form.training}
          onChange={(e) => setForm({ ...form, training: e.target.value })}
        />
        <input type="number" placeholder="Penalty"
          value={form.penaltyCharges}
          onChange={(e) => setForm({ ...form, penaltyCharges: e.target.value })}
        />
      </div>

      <div className="row">
        <input
          placeholder="Adjustment Remark"
          value={form.adjustmentRemark}
          onChange={(e) => setForm({ ...form, adjustmentRemark: e.target.value })}
        />
        <input type="number" placeholder="Adjustments"
          value={form.adjustments}
          onChange={(e) => setForm({ ...form, adjustments: e.target.value })}
        />
      </div>

      <button onClick={handleSubmit}>Save</button>
    </div>
  );
}

export default AddUser;