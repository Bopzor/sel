type DefinitionItemProps = {
  label: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function DefinitionItem({ label, className, children }: DefinitionItemProps) {
  return (
    <div className="stack gap-1">
      <dt className="text-body-sm text-muted">{label}</dt>
      <dd className={className}>{children}</dd>
    </div>
  );
}
