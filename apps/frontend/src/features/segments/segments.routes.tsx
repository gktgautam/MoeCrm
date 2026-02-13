import SegmentsList from "@/features/segments/pages/SegmentsList";
import type { AppRoute } from "@/app/router/route.types";

export const SEGMENTS_ROUTES: AppRoute[] = [
  {
    path: "/segments",
    navLabel: "Segments",
    element: <SegmentsList />,
  },
];
