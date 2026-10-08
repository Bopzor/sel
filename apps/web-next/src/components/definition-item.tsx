// Goes inside a <dl>.
export function DefinitionItem({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="stack gap-1">
      <dt className="text-body-sm text-muted">{label}</dt>
      <dd className="text-title-2 tabular-nums">{children}</dd>
    </div>
  );
}
