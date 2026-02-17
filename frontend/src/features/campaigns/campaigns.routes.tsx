import CampaignsList from "@/features/campaigns/pages/CampaignsList";
import type { AppRoute } from "@/app/router";
import { Mail } from "lucide-react";

export const CAMPAIGNS_ROUTES: AppRoute[] = [
  {
    path: "/campaigns",
    navLabel: "Campaigns",
    anyOf: ["campaigns:read"],
    element: <CampaignsList />,
    icon: Mail
  },
];
