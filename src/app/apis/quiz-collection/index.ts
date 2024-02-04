import { HttpService } from "services";

interface QuizContent {
  answer: number;
  author: string;
  bsn: number;
  options: [string, string, string, string];
  question: string;
  sn: number;
}

interface ApiResponse {
  data: QuizContent;
  message: string;
  success: boolean;
}

export async function find(question: string) {
  const uri =
    "https://script.google.com/macros/s/AKfycbxYKwsjq6jB2Oo0xwz4bmkd3-5hdguopA6VJ5KD/exec";
  const searchParams = new URLSearchParams({
    question,
    type: "quiz",
  });

  const response = await HttpService.get<ApiResponse>(
    `${uri}?${searchParams.toString()}`,
    {
      responseType: "json",
    },
  );

  if (!response.success || !response.data)
    throw new Error("Failed to find the quiz.");

  return response.data;
}
