import React, { useState } from "react";

function PostNews() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "other",
    creator_id: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/postnews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error posting news");
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-3">Post News</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="border p-2 rounded"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Content"
          className="border p-2 rounded"
          rows="4"
          value={form.content}
          onChange={handleChange}
          required
        />
        <select
          name="category"
          className="border p-2 rounded"
          value={form.category}
          onChange={handleChange}
        >
          <option value="urgent">Urgent</option>
          <option value="updates">Updates</option>
          <option value="other">Other</option>
        </select>
        <input
          type="number"
          name="creator_id"
          placeholder="Your User ID"
          className="border p-2 rounded"
          value={form.creator_id}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Post
        </button>
      </form>
      {message && <p className="text-sm mt-2 text-gray-700">{message}</p>}
    </div>
  );
}
export default PostNews;
