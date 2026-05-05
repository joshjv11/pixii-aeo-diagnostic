import { Card, CardContent } from "@/components/ui/card";

type EnterpriseGateProps = {
  pageTitle: string;
  description: string;
};

export default function EnterpriseGate({ pageTitle, description }: EnterpriseGateProps) {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="mb-8">
        <h2 className="text-display font-bold text-on-background mb-2 tracking-tight">
          {pageTitle}
        </h2>
        <p className="text-body-lg text-secondary">
          This module is part of the Pixii Enterprise tier.
        </p>
      </div>

      <Card className="bg-surface-container-lowest border-tertiary-fixed border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <span
            className="material-symbols-outlined text-[64px] text-tertiary-fixed-dim mb-4"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            lock
          </span>
          <h3 className="text-h2 font-semibold text-on-background mb-2">
            Enterprise Access Required
          </h3>
          <p className="text-body-md text-secondary max-w-md">
            {description}
          </p>
          <a
            href="mailto:enterprise@pixii.io"
            className="mt-6 inline-block bg-brand hover:bg-brand-hover text-white text-label-md font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Contact Sales
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
