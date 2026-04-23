import { useState } from "react";

function Reports({ data, loading, downloadPDF }) {

  const [filter, setFilter] = useState({
    year: "",
    quarter: "",
    flat: ""
  });

  // Apply filter
  const filteredData = data.filter((u) => {
    return (
      (!filter.year || u.year == filter.year) &&
      (!filter.quarter || u.quarter == filter.quarter) &&
      (!filter.flat || u.flat == filter.flat)
    );
  });

  return (
    <div>

      {/* ✅ FILTER UI */}
      <div className="row">
        <select
          value={filter.year}
          onChange={(e) =>
            setFilter({ ...filter, year: e.target.value })
          }
        >
          <option value="">All Years</option>
          <option value="2026-27">2026-27</option>
          <option value="2027-28">2027-28</option>
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

        <select
    value={filter.flat}
    onChange={(e) =>
      setFilter({ ...filter, flat: e.target.value })
    }
  >
    <option value="">All Flats</option>
    {[...Array(45)].map((_, i) => (
      <option key={i + 1} value={i + 1}>
        {i + 1}
      </option>
    ))}
  </select>
      </div>

    <p>
        Showing:
        {filter.year && ` Year ${filter.year}`}
        {filter.quarter && ` ${filter.quarter}`}
        {filter.flat && ` Flat ${filter.flat}`}
    </p>

      {/* ✅ TABLE */}
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
                    <button
                      onClick={() =>
                        downloadPDF(u.flat, u.year, u.quarter)
                      }
                    >
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
  );
}

export default Reports;