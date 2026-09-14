import ActivityEditor from "../../../components/ActivityEditor";

export const metadata = { title: "Manage Saved Activity | Phoneme Activity Builder" };

export default async function ActivityDetailPage({ params }) {
  const { id } = await params;
  return <ActivityEditor activityId={id} />;
}
