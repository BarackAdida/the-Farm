import React, { useState } from "react";
import "./componentstyles/Profits.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Profits = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [includeSalaries, setIncludeSalaries] = useState(true);
    const [includeExpenses, setIncludeExpenses] = useState(true);
    const [includeTransport, setIncludeTransport] = useState(true);
    const [profitData, setProfitData] = useState(null);
    const [error, setError] = useState("");
    const handleCalculateProfit = async () => {
        if (!startDate || !endDate) {
            setError("Start date and end date are required");
            return;
        }

        setError("");
        try {
            const response = await fetch("http://127.0.0.1:5000/profits", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    start_date: startDate,
                    end_date: endDate,
                    include_salaries: includeSalaries,
                    include_expenses: includeExpenses,
                    include_transport: includeTransport,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to fetch profit data");
            }

            const data = await response.json();
            setProfitData(data);
        } catch (err) {
            setError(err.message);
            setProfitData(null);
        }
    };

    return (
        <div id="profits-page" className="profit-section">
            <div className="profits-container">
                <h3 className="profits-title">Profit Calculator</h3>
                <div className="profits-form">
                    <div className="profits-field">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="profits-field">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="profits-field checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={includeSalaries}
                                onChange={(e) => setIncludeSalaries(e.target.checked)}
                            />
                            Include Salaries
                        </label>
                    </div>
                    <div className="profits-field checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={includeExpenses}
                                onChange={(e) => setIncludeExpenses(e.target.checked)}
                            />
                            Include Expenses
                        </label>
                    </div>
                    <div className="profits-field checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={includeTransport}
                                onChange={(e) => setIncludeTransport(e.target.checked)}
                            />
                            Include Transport
                        </label>
                    </div>
                </div>
                <button className="profits-button" onClick={handleCalculateProfit}>
                    Calculate Profit
                </button>
                {error && <p className="profits-error">{error}</p>}
                {profitData && (
                    <div className="profits-grid">
                        <div className="profits-card">
                            <h3>Date Range</h3>
                            <p>
                                {profitData.start_date} - {profitData.end_date}
                            </p>
                        </div>
                        <div className="profits-card">
                            <h3>Total Sales</h3>
                            <p>{profitData.total_sales.toFixed(2)}</p>
                        </div>
                        <div className="profits-card">
                            <h3>Total Expenses</h3>
                            <p>{profitData.total_expenses.toFixed(2)}</p>
                        </div>
                        <div className="profits-card">
                            <h3>Total Salaries</h3>
                            <p>{profitData.total_salaries.toFixed(2)}</p>
                        </div>
                        <div className="profits-card">
                            <h3>{profitData.profit < 0 ? "Loss" : "Profit"}</h3>
                            <p>{profitData.profit.toFixed(2)}</p>
                        </div>
                        <div className="profits-card">
                            <h3>Included Options</h3>
                            <p>Salaries: {profitData.include_salaries ? "Yes" : "No"}</p>
                            <p>Expenses: {profitData.include_expenses ? "Yes" : "No"}</p>
                            <p>Transport: {profitData.include_transport ? "Yes" : "No"}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Profits;
