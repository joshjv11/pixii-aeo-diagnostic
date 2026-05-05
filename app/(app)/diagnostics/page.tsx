import type { Metadata } from "next";
import EnterpriseGate from "@/components/ui/EnterpriseGate";

export const metadata: Metadata = {
  title: "Diagnostics | Pixii AEO",
  description: "Full diagnostic history and batch analysis — available on the Enterprise tier.",
};

export default function DiagnosticsPage() {
  return (
    <EnterpriseGate
      pageTitle="Diagnostics"
      description="Upgrade to access full diagnostic history, batch CSV exports, and scheduled scans."
    />
  );
}
