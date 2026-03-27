interface FieldProps {
  readonly label: string;
  readonly children: React.ReactNode;
}

export const Field = ({ label, children }: FieldProps) => (
  <div>
    <p className="text-xs text-content-muted">{label}</p>
    <div className="mt-1 font-semibold text-content-primary">{children}</div>
  </div>
);
