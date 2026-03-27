interface SectionProps {
  readonly title: string;
  readonly children: React.ReactNode;
}

export const Section = ({ title, children }: SectionProps) => (
  <section className="rounded-xl border border-surface-border bg-surface-card p-6">
    <h2 className="text-xs font-semibold uppercase tracking-wider text-content-muted mb-4">
      {title}
    </h2>
    {children}
  </section>
);
