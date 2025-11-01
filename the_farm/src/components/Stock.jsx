import { useState, useEffect } from "react";
import "./componentstyles/stock.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Stock() {
    const [stock, setStock] = useState([]);
    const [error, setError] = useState("");

    const fetchStocks = async () => {
        try {
            const response = await fetch("https://the-farm-stib.onrender.com/stock");
            const data = await response.json();

            if (response.ok) {
                if (Array.isArray(data)) {
                    setStock(data);
                } else {
                    setStock([]);
                    setError(data.message || "Data error");
                }
            } else {
                setError(data.message || "Server error");
            }
        } catch (err) {
            setError(`${err.message}`);
        }
    };

    useEffect(() => {
        fetchStocks();

        const interval = setInterval(() => {
            fetchStocks();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div id="stock-page">
            <div id="stock-container" className="text-center mt-4">
                <h3 className="stock-title mb-3">📦 Crates in Stock</h3>
                {error && <p id="error-message" className="text-danger">{error}</p>}
                {stock.map((s) => (
                    <h4 key={s.id} className="stock-value">
                        {s.crates_in_store}
                    </h4>
                ))}
            </div>
        </div>
    );
}
export default Stock;
