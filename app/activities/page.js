import ActivityDashboard from "../../components/ActivityDashboard";

export const metadata = { title: "Saved Activities | Phoneme Activity Builder" };

export default function ActivitiesPage() {
  return (
    <section className="standard-page saved-activities-page">
      <div className="page-intro">
        <p className="eyebrow">Assessment 2 database workflow</p>
        <h2>Build, save, and reuse phoneme activities</h2>
        <p>Create several classroom configurations, return to them later, and generate HTML activities from the words stored in the database.</p>
      </div>
      <ActivityDashboard />
    </section>
  );
}
