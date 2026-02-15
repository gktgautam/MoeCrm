import CampaignsList from "@/features/campaigns/pages/CampaignsList";
import type { AppRoute } from "@/app/router/route.types";

export const CAMPAIGNS_ROUTES: AppRoute[] = [
  {
    path: "/campaigns",
    navLabel: "Campaigns",
    anyOf: ["campaigns:read"],
    element: <CampaignsList />,
  },
];
