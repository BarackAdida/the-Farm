import React from "react";
import ReadButton from "./ReadButton";
import SolveButton from "./SolveButton";

function NewsItem({ news, userId, refresh }) {
  const { id, title, content, category, creator_name, created_at, is_solved } =
    news;

  return (
    <div className="border border-gray-300 rounded-xl p-4 shadow-sm bg-white">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{title}</h3>
        <span
          className={`px-2 py-1 rounded text-sm ${
            category === "urgent"
              ? "bg-red-200 text-red-800"
              : category === "updates"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {category}
        </span>
      </div>
      <p className="mt-2 text-gray-700">{content}</p>
      <p className="text-sm mt-2 text-gray-500">
        By {creator_name} • {new Date(created_at).toLocaleString()}
      </p>

      <div className="flex gap-2 mt-3">
        <ReadButton newsId={id} userId={userId} refresh={refresh} />
        {!is_solved && (
          <SolveButton newsId={id} userId={userId} refresh={refresh} />
        )}
      </div>
    </div>
  );
}
export default NewsItem;