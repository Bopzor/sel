type FormControlProps = {
  label: React.ReactNode;
  children: React.ReactNode;
};

export const FormControl = ({ label, children }: FormControlProps) => (
  <div className="col gap-0.5">
    <label className="font-medium">{label}</label>

    {children}
  </div>
);
