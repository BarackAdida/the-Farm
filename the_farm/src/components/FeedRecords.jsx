import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./componentstyles/feed.css";

const FeedRecords = () => {
  const [feeds, setFeeds] = useState([]);
  const [newFeed, setNewFeed] = useState({ feed_name: "", sacks_in_storage: "" });
  const [showForm, setShowForm] = useState(false);
  const [editFeedData, setEditFeedData] = useState(null); // stores feed being edited

  const fetchFeeds = async () => {
    const res = await fetch("https://the-farm-stib.onrender.com/feeds");
    const data = await res.json();
    setFeeds(data);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const addFeed = async (e) => {
    e.preventDefault();
    const res = await fetch("https://the-farm-stib.onrender.com/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFeed),
    });
    if (res.ok) {
      setNewFeed({ feed_name: "", sacks_in_storage: "" });
      setShowForm(false);
      fetchFeeds();
    }
  };

  const useFeed = async (id) => {
    await fetch(`https://the-farm-stib.onrender.com/feeds/use/${id}`, { method: "POST" });
    fetchFeeds();
  };

  const deleteFeed = async (id) => {
    await fetch(`https://the-farm-stib.onrender.com/feeds/${id}`, { method: "DELETE" });
    fetchFeeds();
  };

  const updateFeed = async (e) => {
    e.preventDefault();
    await fetch(`https://the-farm-stib.onrender.com/feeds/${editFeedData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feed_name: editFeedData.feed_name,
        sacks_in_storage: parseInt(editFeedData.sacks_in_storage),
      }),
    });
    setEditFeedData(null);
    fetchFeeds();
  };

  return (
    <div className="feed-page">
      {/* Add Feed Button */}
      <div className="feed-add-section">
        <button className="feed-add-btn" onClick={() => setShowForm((prev) => !prev)}>
          <Plus size={18} />
          {showForm ? "Cancel" : "Add New Feed"}
        </button>
      </div>

      {/* Add Feed Form */}
      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            key="feed-form-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ overflow: "hidden", width: "100%" }}
          >
            <form onSubmit={addFeed} className="feed-form">
              <input
                type="text"
                placeholder="Feed Name"
                value={newFeed.feed_name}
                onChange={(e) =>
                  setNewFeed({ ...newFeed, feed_name: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Sacks in Storage"
                value={newFeed.sacks_in_storage}
                onChange={(e) =>
                  setNewFeed({ ...newFeed, sacks_in_storage: e.target.value })
                }
                required
              />
              <button type="submit" className="feed-save-btn">
                Save Feed
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Feed Grid */}
      <div className="feed-grid">
        {feeds.map((feed) => (
          <motion.div
            key={feed.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            className="feed-card"
          >
            <div className="feed-info">
              <h2>{feed.feed_name}</h2>
              <p><strong>Sacks in Storage:</strong> {feed.sacks_in_storage}</p>
              <p><strong>Sacks Used:</strong> {feed.sacks_used}</p>
            </div>
            <div className="feed-actions">
              <button onClick={() => useFeed(feed.id)}>Use</button>
              <button onClick={() => setEditFeedData(feed)}>Edit</button>
              <button className="delete-btn" onClick={() => deleteFeed(feed.id)}>Delete</button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editFeedData && (
          <motion.div
            className="feed-edit-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="feed-edit-modal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="modal-header">
                <h3>Edit Feed</h3>
                <button onClick={() => setEditFeedData(null)} className="close-btn">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={updateFeed}>
                <label>Feed Name:</label>
                <input
                  type="text"
                  value={editFeedData.feed_name}
                  onChange={(e) =>
                    setEditFeedData({ ...editFeedData, feed_name: e.target.value })
                  }
                  required
                />

                <label>Sacks in Storage:</label>
                <input
                  type="number"
                  value={editFeedData.sacks_in_storage}
                  onChange={(e) =>
                    setEditFeedData({ ...editFeedData, sacks_in_storage: e.target.value })
                  }
                  required
                />

                <button type="submit" className="feed-save-btn">
                  Update Feed
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedRecords;
