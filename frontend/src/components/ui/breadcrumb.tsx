import React from "react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  path?: string; // optional because last item has no link
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol style={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} style={styles.item}>
              {!isLast && item.path ? (
                <Link to={item.path} style={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span style={styles.current}>{item.label}</span>
              )}

              {!isLast && <span style={styles.separator}>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  list: {
    display: "flex",
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    display: "flex",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    color: "#007bff",
  },
  current: {
    color: "#555",
  },
  separator: {
    margin: "0 8px",
  },
};

export default Breadcrumb;
