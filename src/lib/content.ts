import { topics } from "@/content";
import type { LabConfig, Topic } from "@/content/types";

export function getAllTopics(): Topic[] {
  return topics;
}

export function getTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function getLab(topicSlug: string, labSlug: string): { topic: Topic; lab: LabConfig } | undefined {
  const topic = getTopic(topicSlug);
  if (!topic) return undefined;
  const lab = topic.labs.find((l) => l.slug === labSlug);
  if (!lab) return undefined;
  return { topic, lab };
}
