import SegmentsList from "@/features/segments/pages/SegmentsList";
import type { AppRoute } from "@/app/router";
import { Users } from "lucide-react";

export const SEGMENTS_ROUTES: AppRoute[] = [
  {
    path: "/segments",
    navLabel: "Segments",
    anyOf: ["segments:read"],
    element: <SegmentsList />,
    icon: Users
  },
];
