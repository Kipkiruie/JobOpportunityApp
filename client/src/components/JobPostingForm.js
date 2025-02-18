/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState } from "https://esm.sh/react@18.2.0";

function JobPostingForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/post-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, company, description })
    });
    if (response.ok) {
      setTitle("");
      setCompany("");
      setDescription("");
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      <input 
        type="text" 
        placeholder="Job Title" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required 
      />
      <input 
        type="text" 
        placeholder="Company" 
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        required 
      />
      <textarea 
        placeholder="Job Description" 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required 
      />
      <button type="submit">Post Job</button>
    </form>
  );
}

export default JobPostingForm;