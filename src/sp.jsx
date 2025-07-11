import React, { useState, useRef, useEffect } from "react";

const initialColumns = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];


const SpreadsheetEditable = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [rows, setRows] = useState(
  Array.from({ length: 50 }, () => Array(initialColumns.length).fill(""))
);
  const [viewMode, setViewMode] = useState("normal");
  const [filteredRows, setFilteredRows] = useState(rows);
  const [hiddenCols, setHiddenCols] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [cellValue, setCellValue] = useState("");
  const inputRef = useRef(null);

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
  margin: 10px 0;
  gap: 12px;
}

.toolbar-left select,
.toolbar-left button,
.toolbar-right button {
  margin-right: 8px;
  padding: 6px 10px;
  font-size: 14px;
}

.toolbar-right button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  border-radius: 4px;
}

.toolbar-right button:hover {
  background-color: #e2e8f0;
}


      `}</style>

      <div className="spreadsheet-container">
        <div className="toolbar">
  <div className="toolbar-left">
    <select onChange={(e) => handleSort(e.target.value)}>
      <option value="">Sort by</option>
      {columns.map((col, idx) => (
        <option key={idx} value={idx}>{col}</option>
      ))}
    </select>

    <select onChange={(e) => handleFilter(e.target.value)}>
      <option value="">Filter (Item 1 contains)</option>
      <option value="a">a</option>
      <option value="b">b</option>
      <option value="c">c</option>
    </select>

    <button onClick={() => setViewMode(viewMode === "compact" ? "normal" : "compact")}>
      Toggle View
    </button>

    <select onChange={(e) => handleHideColumn(parseInt(e.target.value))}>
      <option value="">Hide Column</option>
      {columns.map((col, idx) => (
        <option key={idx} value={idx}>{col}</option>
      ))}
    </select>
  </div>

  <div className="toolbar-right">
    <button>Import</button>
    <button>Export</button>
    <button>Share</button>
    <button>New Action</button>
  </div>
</div>


        <table>
          <thead>
            <tr>
              <th className="row-index">#</th>
              {columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
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
                  const isSelected = selectedCell.row === rowIdx && selectedCell.col === colIdx;
                  return (
                    <td
                      key={colIdx}
                      className={isSelected ? "selected" : ""}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                    >
                      {isSelected ? (
                        <input
                          ref={inputRef}
                          className="cell-input"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={commitValue}
                          onKeyDown={handleKeyDown}
                        />
                      ) : (
                        <span>{cell}</span>
                      )}
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

export default SpreadsheetEditable;
