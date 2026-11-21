/**
 * ZERO-LANG Core Type Definitions
 * 
 * Professional, academic tone. No gamification types.
 * Designed for B2-C2 CEFR alignment.
 */

// ============================================
// CEFR & Proficiency Types
// ============================================

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CEFRDescriptor {
  level: CEFRLevel;
  skill: 'reading' | 'listening' | 'writing' | 'speaking' | 'interaction' | 'mediation';
  canDoStatement: string;
  code: string; // e.g., "B2.R.1"
}

export interface LearnerProfile {
  id: string;
  userId: string;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  primaryGoal: LearningGoal;
  nativeLanguage: string;
  knownLanguages: string[];
  placementScore?: PlacementResult;
  createdAt: Date;
  updatedAt: Date;
}

export type LearningGoal = 
  | 'career_advancement'
  | 'academic_study'
  | 'migration_visa'
  | 'exam_preparation'
  | 'personal_growth'
  | 'social_integration';

// ============================================
// Curriculum Types
// ============================================

export interface Unit {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  topic: UnitTopic;
  level: CEFRLevel;
  order: number;
  estimatedHours: number;
  prerequisites: string[]; // unit IDs
  lessons: Lesson[];
  vocabulary: VocabularyItem[];
  learningOutcomes: LearningOutcome[];
  assessment: UnitAssessment;
  metadata: UnitMetadata;
}

export type UnitTopic = 
  | 'artificial_intelligence'
  | 'climate_change'
  | 'economics'
  | 'philosophy'
  | 'history'
  | 'science_technology'
  | 'global_health'
  | 'politics_governance'
  | 'culture_society'
  | 'education_future'
  | 'space_exploration'
  | 'ethics_technology';

export interface Lesson {
  id: string;
  unitId: string;
  order: number;
  type: LessonType;
  title: string;
  objectives: string[];
  content: LessonContent;
  activities: Activity[];
  estimatedMinutes: number;
}

export type LessonType = 
  | 'reading_comprehension'
  | 'listening_comprehension'
  | 'writing_task'
  | 'speaking_task'
  | 'debate_simulation'
  | 'vocabulary_depth'
  | 'grammar_in_context'
  | 'pronunciation_focus'
  | 'integrated_skills';

export interface LessonContent {
  text?: TextContent;
  audio?: AudioContent;
  video?: VideoContent;
  interactive?: InteractiveContent;
}

export interface TextContent {
  source: string;
  title: string;
  author?: string;
  publicationDate?: string;
  wordCount: number;
  cefrLevel: CEFRLevel;
  body: string; // Markdown
  glossary: GlossaryEntry[];
  comprehensionQuestions: ComprehensionQuestion[];
}

export interface AudioContent {
  source: string;
  title: string;
  durationSeconds: number;
  transcript: string;
  speakers: Speaker[];
  comprehensionQuestions: ComprehensionQuestion[];
}

export interface VideoContent {
  source: string;
  title: string;
  durationSeconds: number;
  transcript: string;
  captionsUrl?: string;
  comprehensionQuestions: ComprehensionQuestion[];
}

export interface InteractiveContent {
  type: 'timeline' | 'map' | 'chart' | 'simulation' | 'case_study';
  data: Record<string, any>;
  instructions: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  partOfSpeech: string;
  cefrLevel: CEFRLevel;
  examples: string[];
  collocations: string[];
  pronunciation: string; // IPA
}

export interface ComprehensionQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'inference' | 'critical_thinking';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  skill: 'literal' | 'inferential' | 'evaluative' | 'creative';
}

export interface Speaker {
  id: string;
  name: string;
  accent: string;
  role: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  instructions: string;
  content: ActivityContent;
  feedback: FeedbackConfig;
  xp?: number; // deprecated - kept for migration only
}

export type ActivityType = 
  | 'multiple_choice'
  | 'gap_fill'
  | 'matching'
  | 'reordering'
  | 'short_answer'
  | 'essay'
  | 'speech_recording'
  | 'pronunciation_drill'
  | 'debate_argument'
  | 'peer_review'
  | 'self_assessment';

export interface ActivityContent {
  prompt: string;
  stimulus?: string;
  options?: string[];
  modelAnswer?: string;
  rubric?: RubricCriterion[];
  wordLimit?: { min: number; max: number };
  timeLimitSeconds?: number;
}

export interface RubricCriterion {
  criterion: string;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  score: number;
  descriptor: string;
}

export interface FeedbackConfig {
  immediate: boolean;
  type: 'automated' | 'ai_assisted' | 'peer' | 'teacher';
  showModelAnswer: boolean;
  showExplanation: boolean;
}

export interface VocabularyItem {
  id: string;
  term: string;
  lemma: string;
  partOfSpeech: string;
  cefrLevel: CEFRLevel;
  frequencyBand: number; // 1-10 (1 = most frequent)
  definitions: VocabularyDefinition[];
  collocations: string[];
  wordFamily: string[];
  pronunciation: {
    ipa: string;
    audioUrl?: string;
  };
  examples: ExampleSentence[];
  tags: string[];
}

export interface VocabularyDefinition {
  sense: number;
  definition: string;
  register: 'formal' | 'neutral' | 'informal' | 'academic' | 'technical';
  domain?: string;
  example: string;
}

export interface ExampleSentence {
  sentence: string;
  translation?: Record<string, string>; // L1 translations
  cefrLevel: CEFRLevel;
  source: string;
}

export interface LearningOutcome {
  id: string;
  skill: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary' | 'grammar' | 'critical_thinking';
  descriptor: string;
  cefrReference: string;
  measurable: boolean;
}

export interface UnitAssessment {
  formative: FormativeAssessment[];
  summative: SummativeAssessment;
}

export interface FormativeAssessment {
  id: string;
  lessonId: string;
  type: 'quiz' | 'writing_sample' | 'speaking_sample' | 'vocabulary_check';
  threshold: number; // percentage to pass
}

export interface SummativeAssessment {
  id: string;
  tasks: AssessmentTask[];
  passingScore: number;
  timeLimitMinutes: number;
}

export interface AssessmentTask {
  id: string;
  type: 'reading' | 'listening' | 'writing' | 'speaking' | 'integrated';
  prompt: string;
  rubric: RubricCriterion[];
}

export interface UnitMetadata {
  version: string;
  author: string;
  lastReviewed: Date;
  reviewStatus: 'draft' | 'review' | 'approved' | 'published';
  license: 'CC-BY-4.0' | 'CC-BY-SA-4.0' | 'CC0' | 'Custom';
  sources: ContentSource[];
  contributors: Contributor[];
}

export interface ContentSource {
  title: string;
  author: string;
  url: string;
  license: string;
  accessDate: Date;
  excerptUsed: string;
}

export interface Contributor {
  id: string;
  name: string;
  role: 'author' | 'reviewer' | 'editor' | 'translator' | 'developer';
  github?: string;
}

// ============================================
// Progress & Assessment Types
// ============================================

export interface UserProgress {
  userId: string;
  unitId: string;
  lessonId?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  score?: number;
  timeSpentSeconds: number;
  attempts: number;
  completedAt?: Date;
  masteryLevel?: number; // 0-1 spaced repetition mastery
  lastReviewedAt?: Date;
}

export interface SkillProfile {
  userId: string;
  reading: SkillLevel;
  listening: SkillLevel;
  writing: SkillLevel;
  speaking: SkillLevel;
  vocabulary: SkillLevel;
  grammar: SkillLevel;
  overall: CEFRLevel;
  lastAssessed: Date;
  evidence: SkillEvidence[];
}

export interface SkillLevel {
  level: CEFRLevel;
  confidence: number; // 0-1
  canDoStatements: CanDoEvidence[];
}

export interface CanDoEvidence {
  code: string;
  statement: string;
  status: 'not_demonstrated' | 'emerging' | 'developing' | 'secure';
  evidence: EvidenceItem[];
}

export interface EvidenceItem {
  type: 'lesson_completion' | 'assessment_score' | 'ai_evaluation' | 'peer_review' | 'self_assessment';
  referenceId: string;
  score?: number;
  date: Date;
  notes?: string;
}

export interface SkillEvidence {
  unitId: string;
  lessonId: string;
  activityId: string;
  skill: string;
  score: number;
  artifacts: Artifact[];
}

export interface Artifact {
  type: 'text' | 'audio' | 'video' | 'document';
  url: string;
  metadata: Record<string, any>;
}

export interface PlacementResult {
  userId: string;
  assessedLevel: CEFRLevel;
  confidence: number;
  skillBreakdown: Record<string, CEFRLevel>;
  responses: PlacementResponse[];
  completedAt: Date;
  version: string;
}

export interface PlacementResponse {
  questionId: string;
  skill: 'reading' | 'listening' | 'grammar' | 'vocabulary';
  userAnswer: string;
  correct: boolean;
  cefrLevel: CEFRLevel;
  timeSeconds: number;
}

// ============================================
