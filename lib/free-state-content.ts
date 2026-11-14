import type { FreeStateCode } from './free-state-catalog';
import type { ExamGroup } from './states';
import type { TopicId } from './types';

export type FreeStateContent = {
  code: FreeStateCode;
  name: string;
  slug: string;
  group: ExamGroup;
  processKind: string;
  summary: string;
  training: string;
  assessment: string;
  steps: string[];
  exceptions: string[];
  renewal: string;
  ron: string;
  officialNext: { label: string; url: string };
  sources: { id: string; title: string; url: string; reference: string; checkedAt: string }[];
  specs: { questions: number | null; minutes: number | null; passing: string | null; credential: string | null };
  difference: string;
  topics: { id: string; label: string }[];
  questions: {
    id: string; topic: TopicId; studyTopic: string; stem: string; options: string[];
    answer: 'A' | 'B' | 'C' | 'D'; explanation: string; feedback: string[];
    sourceId: string; reference: string;
  }[];
};
