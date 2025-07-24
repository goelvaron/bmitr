import { z } from "zod";

// Define the schema for form values to ensure type safety
const formSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  companyName: z.string(),
  state: z.string(),
  district: z.string(),
  kilnType: z.string(),
  additionalInfo: z.string().optional(),
  takeIndustryQuiz: z.boolean().default(false),
});

// Add submission metadata
const submissionSchema = formSchema.extend({
  submissionDate: z.string(),
  id: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;
export type SubmissionData = z.infer<typeof submissionSchema>;

/**
 * Get all waitlist submissions from localStorage
 */
export const getAllWaitlistSubmissions = (): SubmissionData[] => {
  const data = localStorage.getItem("waitlistDataArray");
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Error parsing waitlist data:", error);
    return [];
  }
};

/**
 * Get a specific waitlist submission by ID
 */
export const getWaitlistSubmissionById = (
  id: string,
): SubmissionData | null => {
  const submissions = getAllWaitlistSubmissions();
  return submissions.find((submission) => submission.id === id) || null;
};

/**
 * Add a new waitlist submission
 */
export const addWaitlistSubmission = (formData: FormValues): SubmissionData => {
  const submissions = getAllWaitlistSubmissions();

  const newSubmission: SubmissionData = {
    ...formData,
    submissionDate: new Date().toISOString(),
    id: `user-${Date.now()}`,
  };

  submissions.push(newSubmission);
  localStorage.setItem("waitlistDataArray", JSON.stringify(submissions));

  return newSubmission;
};

/**
 * Clear all waitlist submissions
 */
export const clearAllWaitlistSubmissions = (): void => {
  localStorage.removeItem("waitlistDataArray");
};

/**
 * Export waitlist data as JSON file
 */
export const exportWaitlistData = (): void => {
  const submissions = getAllWaitlistSubmissions();
  const dataStr = JSON.stringify(submissions, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

  const exportFileDefaultName = `bhatta-mitra-waitlist-${new Date().toISOString().split("T")[0]}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};
