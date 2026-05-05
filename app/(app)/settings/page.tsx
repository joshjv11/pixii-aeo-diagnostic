import type { Metadata } from "next";
import EnterpriseGate from "@/components/ui/EnterpriseGate";

export const metadata: Metadata = {
  title: "Settings | Pixii AEO",
  description: "Account and workspace settings — available on the Enterprise tier.",
};

export default function SettingsPage() {
  return (
    <EnterpriseGate
      pageTitle="Settings"
      description="Upgrade to manage team members, API integrations, and custom brand profiles."
    />
  );
}
