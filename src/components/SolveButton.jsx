import React, { useState } from "react";

export default function ReadButton({ newsId, userId, refresh }) {
  const [loading, setLoading] = useState(false);

  const handleRead = async () => {
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/news/${newsId}/read/${userId}`, {
        method: "PATCH",
      });
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRead}
      disabled={loading}
      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
    >
      {loading ? "Marking..." : "Mark as Read"}
    </button>
  );
}
