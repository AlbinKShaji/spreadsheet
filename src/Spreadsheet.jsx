
import React, { useState, useRef, useEffect } from "react";

const initialData = [
  ["Job Request", "Date", "Status", "Submitter", "URL", "Assigned", "Priority", "Due Date", "Est. Value","(New)+"],
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
  [
    "Update press kit for company redesign",
    "18-11-2024",
    "In-process",
    "Irfan Khan",
    "www.irfankhan.com",
    "Tejas Pandey",
    "High",
    "30-10-2024",
    "3,850,000"
  ],
  [
    "Finalize user testing feedback for app",
    "05-12-2024",
    "Complete",
    "Mark Johnson",
    "www.markjohnson.com",
    "Rachel Lee",
    "Medium",
    "10-12-2024",
    "4,750,000"
  ],
  [
    "Design new features for the website",
    "10-01-2025",
    "",
    "Emily Green",
    "www.emilygreen.com",
    "Tom Wright",
    "Low",
    "15-01-2025",
    "5,900,000"
  ],
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

  // Update input value on change
  const handleInputChange = (e) => {
    setCellInputValue(e.target.value);
  };

  // Commit value on blur or enter press 
  const commitValue = () => {
    if (selectedCell.row !== null && selectedCell.col !== null) {
      const updatedData = [...data];
      updatedData[selectedCell.row][selectedCell.col] = cellInputValue;
      setData(updatedData);
    }
    setSelectedCell({ row: null, col: null });
  };

  // Handle input key events
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      commitValue();
    }
    if (e.key === "Escape") {
      setSelectedCell({ row: null, col: null });
    }
  };

  // Focus input when cell selected
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [selectedCell]);

  // Render the spreadsheet table
  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
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
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px 14px;
          min-width: 120px;
          position: relative;
          text-align: left;
          transition: background-color 0.3s, border-color 0.3s;
          white-space: normal;
        }
        th {
          background: #f3f4f6;
          font-weight: 600;
          color: #374151;
          user-select: none;
          position: sticky;
          top: 0;
          z-index: 2;
        }
        td:focus {
          outline: none;
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
          z-index: 1;
        }
        input.cell-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          padding: 0 10px;
          font-size: 14px;
          font-family: inherit;
          background: transparent;
          z-index: 3;
          color: #111827;
          box-sizing: border-box;
          outline: none;
        }
        /* Priority color labels */
        .status-Medium {
          color: #b45309; /* amber */
          font-weight: 600;
          background: #fef3c7;
          border-radius: 12px;
          padding: 2px 8px;
          display: inline-block;
          text-align: center;
          min-width: 70px;
        }
        .status-High {
          color: #b91c1c; /* red */
          font-weight: 600;
          background: #fee2e2;
          border-radius: 12px;
          padding: 2px 8px;
          display: inline-block;
          min-width: 70px;
        }
        .status-Complete {
          color: #15803d; /* green */
          font-weight: 600;
          background: #dcfce7;
          border-radius: 12px;
          padding: 2px 8px;
          display: inline-block;
          min-width: 70px;
        }
        .status-Blocked {
          color: #991b1b; /* dark red */
          font-weight: 600;
          background: #fca5a5;
          border-radius: 12px;
          padding: 2px 8px;
          display: inline-block;
          min-width: 70px;
        }
        .status-In-process {
          color: #65a30d; /* lime green */
          font-weight: 600;
          background: #d9f99d;
          border-radius: 12px;
          padding: 2px 8px;
          display: inline-block;
          min-width: 70px;
        }

        @media (max-width: 768px) {
          td, th {
            min-width: 90px;
            padding: 8px 10px;
            font-size: 12px;
          }
        }
        @media (max-width: 480px) {
          table {
            font-size: 11px;
          }
          td, th {
            min-width: 70px;
            padding: 6px 6px;
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
              const realRow = rowIdx + 1;
              return (
                <tr key={realRow}>
                  {rowData.map((cell, colIdx) => {
                    // Determine if this cell is selected
                    const isSelected = selectedCell.row === realRow && selectedCell.col === colIdx;
                    // For status/promo column (index 2) we can decorate with styles
                    let cellClass = "";
                    if (colIdx === 2) {
                      // Normalize text for classes, spaces replaced by dash, remove special chars
                      const normalized = (cell || "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
                      cellClass = "status-" + normalized;
                    }
                    return (
                      <td
                        key={colIdx}
                        className={isSelected ? "selected-cell" : ""}
                        tabIndex={0}
                        onClick={() => handleCellClick(realRow, colIdx)}
                        onKeyDown={e => {
                          if(e.key === "Enter" || e.key === "F2") {
                            e.preventDefault();
                            handleCellClick(realRow, colIdx);
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
                            aria-label={`Edit cell at row ${realRow} column ${data[0][colIdx]}`}
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

