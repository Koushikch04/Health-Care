import React from "react";
import styles from "./StateBlocks.module.css";

function TableSkeleton({ rows = 6, columns = 6 }) {
  const cells = Array.from({ length: columns });
  const skeletonRows = Array.from({ length: rows });

  return (
    <div className={styles.skeletonWrap} aria-hidden="true">
      <div className={styles.tableSkeleton}>
        <div className={styles.tableHeaderRow}>
          {cells.map((_, index) => (
            <div
              key={`head-${index}`}
              className={styles.skeletonBlock}
              style={{ height: "16px" }}
            />
          ))}
        </div>
        {skeletonRows.map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className={styles.tableDataRow}>
            {cells.map((__, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={styles.skeletonBlock}
                style={{ height: "20px" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableSkeleton;
