
import React, { useState, useRef, useEffect } from "react";

const initialData = [
  ["Job Request", "Date", "Status", "Submitter", "URL", "Assigned", "Priority", "Due Date", "Est. Value"],
  [
    "Launch social media campaign for product",
    "28-10-2024",
    "Need to start",
    "Aisha Patel",
    "www.aishapatel.com",
    "Sophie Choudhury",
    "Medium",
    "30-11-2024",
    "6,700,000"
  ],
  // More entries...
  [
    "Prepare financial report for Q4",
    "25-01-2025",
    "Blocked",
    "Jessica Brown",
    "www.jessicabrown.com",
    "Kevin Smith",
    "",
    "30-01-2025",
    "2,800,000"
  ]
];

const Spreadsheet = () => {
  const [data, setData] = useState(initialData);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [cellInputValue, setCellInputValue] = useState("");
  const inputRef = useRef(null);

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    setCellInputValue(data[row][col] || "");
  };

  const handleInputChange = (e) => {
    setCellInputValue(e.target.value);
  };

  const commitValue = () => {
    if (selectedCell.row !== null && selectedCell.col !== null) {
      const updatedData = [...data];
      updatedData[selectedCell.row][selectedCell.col] = cellInputValue;
      setData(updatedData);
    }
    setSelectedCell({ row: null, col: null });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      commitValue();
    }
    if (e.key === "Escape") {
      setSelectedCell({ row: null, col: null });
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [selectedCell]);

  return (
    <>
      <style>{`
        /* Base styles for the spreadsheet */
        body, html, #root {
          margin: 0; padding: 0; height: 100%;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: #f9fafb;
        }
        .spreadsheet-container {
          width: 100%;
          overflow-x: auto;
          padding: 16px;
          display: flex;
          justify-content: center;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          max-width: 1300px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px 14px;
          text-align: left;
          white-space: nowrap;
          position: relative;
        }
        th {
          background: #f3f4f6;
          font-weight: 600;
        }
        tr:nth-child(even) td {
          background-color: #fafafa;
        }
        tr:hover td {
          background-color: #e2e8f0;
        }
        .selected-cell {
          outline: 2px solid #2563eb;
          background-color: #eff6ff !important;
        }
        input.cell-input {
          position: absolute;
          width: 100%;
          height: 100%;
          border: none;
          padding: 0 8px;
        }
        /* Status Colors */
        .status-Need-to-start {
          background: #fef3c7; color: #b45309; /* Amber */
        }
        .status-Complete {
          background: #dcfce7; color: #15803d; /* Green */
        }
        .status-Blocked {
          background: #fca5a5; color: #991b1b; /* Dark Red */
        }
        .status-In-process {
          background: #d9f99d; color: #65a30d; /* Lime Green */
        }
        @media (max-width: 768px) {
          td, th {
            padding: 8px 10px;
          }
        }
      `}</style>

      <div className="spreadsheet-container" role="grid" aria-label="Spreadsheet">
        <table>
          <thead>
            <tr>
              {data[0].map((header, colIdx) => (
                <th key={colIdx} tabIndex={-1} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((rowData, rowIdx) => {
              return (
                <tr key={rowIdx}>
                  {rowData.map((cell, colIdx) => {
                    const isSelected = selectedCell.row === rowIdx + 1 && selectedCell.col === colIdx;

                    const cellClass = colIdx === 2 ? `status-${(cell || "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}` : "";

                    return (
                      <td
                        key={colIdx}
                        className={isSelected ? "selected-cell" : ""}
                        tabIndex={0}
                        onClick={() => handleCellClick(rowIdx + 1, colIdx)}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === "F2") {
                            e.preventDefault();
                            handleCellClick(rowIdx + 1, colIdx);
                          }
                        }}
                        aria-selected={isSelected}
                        role="gridcell"
                      >
                        {isSelected ? (
                          <input
                            ref={inputRef}
                            className="cell-input"
                            value={cellInputValue}
                            onChange={handleInputChange}
                            onBlur={commitValue}
                            onKeyDown={handleKeyDown}
                            aria-label={`Edit cell at row ${rowIdx + 1} column ${data[0][colIdx]}`}
                          />
                        ) : (
                          <span className={cellClass}>{cell}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Spreadsheet;


