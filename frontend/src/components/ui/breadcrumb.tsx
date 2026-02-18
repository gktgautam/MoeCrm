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
    <nav aria-label="breadcrumb" className="py-4 px-3 text-sm bg-surface/90 rounded-bl">
      <ol className="flex list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
               <span>{item.label}</span>

              {!isLast && <span className="mx-2">{'>'}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
