import { notFound } from "next/navigation";
import LearningReels from "../../../components/learning-reels";
import { getChapter, subjects } from "../../../course-data";

export function generateStaticParams() {
  return subjects.flatMap((subject) => subject.chapters.map((chapter) => ({ subject: subject.id, chapter: chapter.id })));
}

export default async function ChapterReelsPage({ params }: { params: Promise<{ subject: string; chapter: string }> }) {
  const { subject: subjectId, chapter: chapterId } = await params;
  const result = getChapter(subjectId, chapterId);
  if (!result) notFound();

  const { subject, chapter } = result;
  const chapterIndex = subject.chapters.findIndex((item) => item.id === chapter.id);
  const prerequisites = chapterIndex > 0
    ? [{ label: `Chapter ${chapterIndex} · ${subject.chapters[chapterIndex - 1].title}`, href: `/subjects/${subject.id}/${subject.chapters[chapterIndex - 1].id}` }]
    : subject.prerequisites;

  return <LearningReels subject={subject} chapter={chapter} chapterNumber={chapterIndex + 1} prerequisites={prerequisites} />;
}
