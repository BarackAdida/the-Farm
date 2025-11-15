import React, { useEffect, useState } from "react";
import NewsItem from "./NewsItem";

function NewsList({ userId }) {
  const [newsList, setNewsList] = useState([]);

  const fetchNews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/news/${userId}`);
      const data = await res.json();
      setNewsList(data);
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Latest News</h2>
      <div className="flex flex-col gap-4">
        {newsList.length > 0 ? (
          newsList.map((news) => (
            <NewsItem
              key={news.id}
              news={news}
              userId={userId}
              refresh={fetchNews}
            />
          ))
        ) : (
          <p>No news available.</p>
        )}
      </div>
    </div>
  );
}
export default NewsList;