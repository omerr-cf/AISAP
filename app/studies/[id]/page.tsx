import { StudyDetailPage } from "@/views/StudyDetailPage/StudyDetailPage";

// In Next.js 15+, params is a Promise in server components
const StudyDetailRoute = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <StudyDetailPage id={id} />;
};

export default StudyDetailRoute;
