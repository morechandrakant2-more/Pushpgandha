import { useState } from "react";
import { uploadFileAPI } from "../services/api";

function Upload({ token, fetchData }) {
  const [file, setFile] = useState(null);

  const upload = async () => {
  if (!file) return alert("Select file");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await uploadFileAPI(formData, token);

    // ✅ HANDLE ERROR RESPONSE
    if (!res.ok) {
      const err = await res.json();
      alert(err.error);   // 👈 SHOW BACKEND MESSAGE
      return;
    }

    const data = await res.json();

    alert("Uploaded ✅");
    fetchData();

  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
};

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={upload}>Upload</button>
    </div>
  );
}

export default Upload;