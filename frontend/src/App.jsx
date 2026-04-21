import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import AddUser from "./components/AddUser";
import Reports from "./components/Reports";
import Upload from "./components/Upload";
import Expenses from "./components/Expenses";
import { getReport } from "./services/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [tab, setTab] = useState("add");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getReport(token);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const downloadPDF = (flat, year, quarter) => {
    window.open(
      `${import.meta.env.VITE_API_URL}/api/report/pdf/${flat}/${year}/${quarter}`
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} setToken={setToken} />;
  }

  return (
    <div className="container">
      <Navbar tab={tab} setTab={setTab} logout={logout} />

      {tab === "add" && <AddUser token={token} fetchData={fetchData} />}
      {tab === "report" && <Reports data={data} loading={loading} downloadPDF={downloadPDF} />}
      {tab === "upload" && <Upload token={token} fetchData={fetchData} />}
      {tab === "expenses" && <Expenses />}
    </div>
  );
}

export default App;