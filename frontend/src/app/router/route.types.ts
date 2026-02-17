import type { ReactNode } from "react"; ; 

export type AppRoute = {
  path: string;
  element: ReactNode;
  navLabel?: string;
  anyOf?: string[];
  allOf?: string[];
  children?:any,
  icon:any
};
