
import React, { useState, useRef, useEffect } from "react";

// 1. Update initialColumns to match Figma UI
const initialColumns = [
  "Job Request",
  "Submitted",
  "Status",
  "Submitter",
  "URL",
  "Assigned",
  "Priority",
  "Due Date",
  "Est. Value"
];

// 2. Add helpers for tag colors and number formatting
const statusColors = {
  "In-process": "#fde68a",
  "Need to start": "#bae6fd",
  "Complete": "#bbf7d0",
  "Blocked": "#fecaca"
};
const priorityColors = {
  "High": "#fecaca",
  "Medium": "#fef9c3",
  "Low": "#bbf7d0"
};
function formatNumber(val) {
  if (!val) return "";
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 3. Update default rows to match Figma sample data
const defaultRows = [
  [
    "Launch social media campaign for product", "15-11-2024", "In-process", "Aisha Patel", "www.aishapatel.com", "Sophie Choudhury", "Medium", "20-11-2024", "6200000"
  ],
  [
    "Update press kit for company redesign", "30-10-2024", "Need to start", "Irfan Khan", "www.irfankhan.com", "Tejas Pandey", "High", "30-10-2024", "3500000"
  ],
  [
    "Finalize user testing feedback for app", "05-12-2024", "In-process", "Mark Johnson", "www.markjohnson.com", "Rachel Lee", "Medium", "10-12-2024", "4750000"
  ],
  [
    "Design new features for the website", "10-01-2025", "Complete", "Emily Green", "www.emilygreen.com", "Tom Wright", "Low", "15-01-2025", "5900000"
  ],
  [
    "Prepare financial report for Q4", "25-01-2025", "Blocked", "Jessica Brown", "www.jessicabrown.com", "Kevin Smith", "Low", "30-01-2025", "2800000"
  ]
];

const Spreadsheet = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [rows, setRows] = useState(
    defaultRows.concat(Array.from({ length: 45 }, () => Array(initialColumns.length).fill("")))
  );
  const [viewMode, setViewMode] = useState("normal");
  const [filteredRows, setFilteredRows] = useState(rows);
  const [hiddenCols, setHiddenCols] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [cellValue, setCellValue] = useState("");
  const inputRef = useRef(null);
  const [snackbar, setSnackbar] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showNewActionScreen, setShowNewActionScreen] = useState(false);

  // ➕ Add Column
  const handleAddColumn = () => {
    const newCol = `Item ${columns.length + 1}`;
    setColumns([...columns, newCol]);
    // Add empty cell to each row
    const updatedRows = rows.map(row => [...row, ""]);
    setRows(updatedRows);
  };

  // 📥 Select Cell
  const handleCellClick = (rowIdx, colIdx) => {
    setSelectedCell({ row: rowIdx, col: colIdx });
    setCellValue(rows[rowIdx][colIdx]);
  };

  // ✅ Commit Edit
  const commitValue = () => {
    const { row, col } = selectedCell;
    if (row !== null && col !== null) {
      const updatedRows = [...rows];
      updatedRows[row][col] = cellValue;
      setRows(updatedRows);
      setSelectedCell({ row: null, col: null });
      // Automatically add a new row if this was the last row
      if (row === rows.length - 1) {
        setRows([...updatedRows, Array(columns.length).fill("")]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commitValue();
    if (e.key === "Escape") setSelectedCell({ row: null, col: null });
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [selectedCell]);

  const handleSort = (colIdx) => {
    if (colIdx === "") return setFilteredRows(rows);
    const sorted = [...filteredRows].sort((a, b) =>
      a[colIdx].localeCompare(b[colIdx])
    );
    setFilteredRows(sorted);
  };

  const handleFilter = (val) => {
    if (!val) return setFilteredRows(rows);
    const filtered = rows.filter((row) => row[0].includes(val));
    setFilteredRows(filtered);
  };

  const handleHideColumn = (colIdx) => {
    if (!hiddenCols.includes(colIdx)) {
      setHiddenCols([...hiddenCols, colIdx]);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const csvRows = [columns.filter((_, idx) => !hiddenCols.includes(idx)).join(",")];
    filteredRows.forEach(row => {
      csvRows.push(row.filter((_, idx) => !hiddenCols.includes(idx)).map(cell => `"${cell.replace(/"/g, '""')}"`).join(","));
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spreadsheet.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import from CSV
  const fileInputRef = useRef(null);
  const handleImportClick = () => fileInputRef.current.click();
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) return;
      const newColumns = lines[0].split(",");
      const newRows = lines.slice(1).map(line => {
        // Handle quoted CSV
        const matches = line.match(/(?:"([^"]*(?:""[^"]*)*)"|([^",]+)|)(?:,|$)/g);
        return matches ? matches.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"').replace(/,$/, '')) : line.split(",");
      });
      setColumns(newColumns);
      setRows(newRows);
      setFilteredRows(newRows);
      setHiddenCols([]);
    };
    reader.readAsText(file);
  };

  // Unhide Column
  const handleUnhideColumn = (colIdx) => {
    setHiddenCols(hiddenCols.filter(idx => idx !== colIdx));
  };

  // Share functionality: encode columns and rows in URL hash and show modal
  const handleShare = () => {
    const payload = {
      columns,
      rows,
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const link = window.location.origin + window.location.pathname + "#" + encoded;
    setShareLink(link);
    setShowShareModal(true);
  };
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setSnackbar("Shareable link copied to clipboard!");
    setTimeout(() => setSnackbar(""), 2000);
  };

  // On load, decode hash if present
  useEffect(() => {
    if (window.location.hash.length > 1) {
      try {
        const encoded = window.location.hash.slice(1);
        const decoded = decodeURIComponent(escape(atob(encoded)));
        const { columns: c, rows: r } = JSON.parse(decoded);
        if (Array.isArray(c) && Array.isArray(r)) {
          setColumns(c);
          setRows(r);
          setFilteredRows(r);
        }
      } catch (e) {
        // ignore invalid hash
      }
    }
  }, []);

  return (
    <>
      <style>{`
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
    position: relative;
    vertical-align: middle;
    box-sizing: border-box;
    min-width: 120px;
  }
    td {
  position: relative;
  vertical-align: middle;
  padding: 0px;
  min-height: 40px;
}
        th {
          background-color: #f4f4f4;
        }
        index {
          background-color: #f0f0f0;
          text-align: center;
          width: 50px;
          font-weight: bold;
        }
       .cell-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0 8px;         /* horizontal padding only */
  margin: 0;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  background-color: #fff;
  box-sizing: border-box;
  line-height: 1.4;
}

         .selected {
    background-color: #e0f2fe;
    outline: 2px solid #2563eb;
    z-index: 1;
  }
        .plus-button {
    cursor: pointer;
    color: green;
    font-weight: bold;
    text-align: center;
    user-select: none;
  }
          .row-index {
  background-color: #f0f0f0;
  text-align: center;
  width: 30px;
  min-width: 30px;
  padding: 4px 6px;
  font-weight: bold;
  font-size: 12px;
}
  .toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 18px 0;
  padding: 12px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  gap: 12px;
}

.toolbar-left select,
.toolbar-left button,
.toolbar-right button {
  margin-right: 0;
  padding: 7px 14px;
  font-size: 15px;
  border-radius: 5px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  transition: background 0.2s, box-shadow 0.2s;
}

.toolbar-left button,
.toolbar-right button {
  cursor: pointer;
}

.toolbar-right button:hover,
.toolbar-left button:hover {
  background: #e0e7ef;
}

.toolbar-right button[title],
.toolbar-left button[title] {
  position: relative;
}

.toolbar-right button[title]:hover:after,
.toolbar-left button[title]:hover:after {
  content: attr(title);
  position: absolute;
  left: 50%;
  top: 110%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
}

.snackbar {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  background: #2563eb;
  color: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 1000;
  animation: fadein 0.3s, fadeout 0.3s 1.7s;
}

@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeout { from { opacity: 1; } to { opacity: 0; } }

@media (max-width: 768px) {
  .toolbar { flex-direction: column; align-items: stretch; gap: 8px; }
  .toolbar-left, .toolbar-right { flex-wrap: wrap; }
}
      `}</style>
      {snackbar && <div className="snackbar">{snackbar}</div>}
      {showShareModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            background: "#fff",
            padding: 32,
            borderRadius: 12,
            boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
            minWidth: 320,
            maxWidth: 480,
            textAlign: "center",
            position: "relative"
          }}>
            <button onClick={() => setShowShareModal(false)} style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#eee",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              fontWeight: "bold",
              cursor: "pointer"
            }}>×</button>
            <h3 style={{marginBottom: 16}}>Shareable Link</h3>
            <input
              type="text"
              value={shareLink}
              readOnly
              style={{ width: "90%", padding: 8, fontSize: 15, marginBottom: 16, border: "1px solid #ddd", borderRadius: 5 }}
              onFocus={e => e.target.select()}
            />
            <br />
            <button onClick={handleCopyShareLink} style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              fontSize: 15,
              cursor: "pointer"
            }}>Copy Link</button>
          </div>
        </div>
      )}
      {showNewActionScreen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.18)",
          zIndex: 3000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 2px 16px rgba(0,0,0,0.13)",
            minWidth: 400,
            minHeight: 300,
            padding: 40,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <button onClick={() => setShowNewActionScreen(false)} style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#eee",
              border: "none",
              borderRadius: "50%",
              width: 30,
              height: 30,
              fontWeight: "bold",
              fontSize: 18,
              cursor: "pointer"
            }}>×</button>
            <h2 style={{marginBottom: 18}}>New Action Screen</h2>
            <p style={{color: "#444", fontSize: 17}}>This is a placeholder for your new feature or workflow.</p>
          </div>
        </div>
      )}
      <div className="spreadsheet-container">
        <div className="toolbar">
          <div className="toolbar-left">
            <select onChange={(e) => handleSort(e.target.value)} title="Sort rows by column">
              <option value="">Sort by</option>
              {columns.map((col, idx) => (
                <option key={idx} value={idx}>{col}</option>
              ))}
            </select>
            <select onChange={(e) => handleFilter(e.target.value)} title="Filter Item 1">
              <option value="">Filter (Item 1 contains)</option>
              <option value="a">a</option>
              <option value="b">b</option>
              <option value="c">c</option>
            </select>
            <button onClick={() => setViewMode(viewMode === "compact" ? "normal" : "compact")}
              title="Toggle compact/normal view">
              Toggle View
            </button>
            <select onChange={(e) => handleHideColumn(parseInt(e.target.value))} title="Hide a column">
              <option value="">Hide Column</option>
              {columns.map((col, idx) =>
                !hiddenCols.includes(idx) && <option key={idx} value={idx}>{col}</option>
              )}
            </select>
            <select onChange={e => handleUnhideColumn(parseInt(e.target.value))} title="Unhide a column">
              <option value="">Unhide Column</option>
              {hiddenCols.map(idx => (
                <option key={idx} value={idx}>{columns[idx]}</option>
              ))}
            </select>
          </div>
          <div className="toolbar-right">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImport}
            />
            <button onClick={handleImportClick} title="Import CSV">Import</button>
            <button onClick={handleExport} title="Export as CSV">Export</button>
            <button onClick={handleShare} title="Copy shareable link">Share</button>
            <button title="Custom action" onClick={() => setShowNewActionScreen(true)}>New Action</button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th className="row-index">#</th>
              {columns.map((col, idx) =>
                !hiddenCols.includes(idx) && <th key={idx}>{col}</th>
              )}
              <th>
                <span className="plus-button" onClick={handleAddColumn}>+</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="row-index">{rowIdx + 1}</td>
                {row.map((cell, colIdx) => {
                  if (hiddenCols.includes(colIdx)) return null;
                  const isSelected = selectedCell.row === rowIdx && selectedCell.col === colIdx;
                  // Special rendering for certain columns
                  let cellContent = cell;
                  if (initialColumns[colIdx] === "Status" && cell) {
                    cellContent = (
                      <span style={{
                        background: statusColors[cell] || "#e5e7eb",
                        color: "#222",
                        borderRadius: 8,
                        padding: "2px 10px",
                        fontWeight: 500,
                        fontSize: 13,
                        display: "inline-block"
                      }}>{cell}</span>
                    );
                  } else if (initialColumns[colIdx] === "Priority" && cell) {
                    cellContent = (
                      <span style={{
                        background: priorityColors[cell] || "#e5e7eb",
                        color: "#222",
                        borderRadius: 8,
                        padding: "2px 10px",
                        fontWeight: 500,
                        fontSize: 13,
                        display: "inline-block"
                      }}>{cell}</span>
                    );
                  } else if (initialColumns[colIdx] === "URL" && cell) {
                    cellContent = (
                      <a href={cell.startsWith("http") ? cell : `https://${cell}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>{cell}</a>
                    );
                  } else if (initialColumns[colIdx] === "Est. Value" && cell) {
                    cellContent = formatNumber(cell);
                  } else if ((initialColumns[colIdx] === "Submitted" || initialColumns[colIdx] === "Due Date") && isSelected) {
                    // Show date input if selected
                    cellContent = (
                      <input
                        ref={inputRef}
                        className="cell-input"
                        type="date"
                        value={cellValue ? cellValue.split("-").reverse().join("-") : ""}
                        onChange={e => setCellValue(e.target.value.split("-").reverse().join("-"))}
                        onBlur={commitValue}
                        onKeyDown={handleKeyDown}
                      />
                    );
                  }
                  return (
                    <td
                      key={colIdx}
                      className={isSelected ? "selected" : ""}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                    >
                      {isSelected && !["Submitted", "Due Date"].includes(initialColumns[colIdx]) ? (
                        <input
                          ref={inputRef}
                          className="cell-input"
                          value={cellValue}
                          onChange={e => setCellValue(e.target.value)}
                          onBlur={commitValue}
                          onKeyDown={handleKeyDown}
                        />
                      ) : cellContent}
                    </td>
                  );
                })}
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Spreadsheet;

