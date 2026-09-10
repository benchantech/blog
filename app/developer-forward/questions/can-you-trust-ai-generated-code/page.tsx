import type { Metadata } from "next";
import { AnswerSurface } from "@/components/developer-forward/AnswerSurface";
import { developerForwardAnswer } from "@/content/developer-forward/answer-surfaces";
const answer = developerForwardAnswer("can-you-trust-ai-generated-code");
export const metadata: Metadata = { title: `${answer.title} | BenChanTech`, description: answer.description, alternates: { canonical: `/developer-forward/questions/${answer.slug}` } };
export default function Page() { return <AnswerSurface answer={answer} />; }
