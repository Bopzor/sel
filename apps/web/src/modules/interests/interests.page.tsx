import { Breadcrumb, breadcrumb } from '../../components/breadcrumb';

export default function InterestsPage() {
  return (
    <>
      <Breadcrumb items={[breadcrumb.interests()]} />
    </>
  );
}
