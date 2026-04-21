import { useState } from "react";
import { uploadFileAPI } from "../services/api";

function Upload({ token, fetchData }) {
  const [file, setFile] = useState(null);

  const upload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadFileAPI(formData, token);
      alert("Uploaded ✅");
      fetchData();
    } catch (err) {
      console.error(err);
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