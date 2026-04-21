function Navbar({ tab, setTab, logout }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Society Management</h1>
        <button onClick={logout}>Logout</button>
      </div>

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
    </>
  );
}

export default Navbar;