import React, { useState, useEffect, useCallback } from "react";
import { WindowWrapper } from "@/components/global/window-wrapper";
import {
  CircleQuestionMark,
  ChevronsLeft,
  ChevronsRight,
  Timer,
  Loader2,
} from "lucide-react";
import { Actions } from "@/components/global/toast-config";
import { cn } from "../lib/utils";

interface QuestionItem {
  id: number;
  text: string;
}

const TIMER_DURATION = 15; // seconds

export const Question = () => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isAnswering, setIsAnswering] = useState(false);
  const [status, setStatus] = useState<"intro" | "active" | "outro">("intro");
  const [introCountdown, setIntroCountdown] = useState(3);

  // Intro logic
  useEffect(() => {
    if (status === "intro") {
      const timer = setInterval(() => {
        setIntroCountdown((prev) => {
          if (prev <= 1) {
            setStatus("active");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (window.electronAPI?.getQuestions) {
        const loadedQuestions = await window.electronAPI.getQuestions();
        setQuestions(loadedQuestions);
      }
    };
    loadQuestions();

    // Reload questions when window gains focus
    window.addEventListener("focus", loadQuestions);

    if (window.electronAPI?.onQuestionsUpdated) {
      const cleanup = window.electronAPI.onQuestionsUpdated((newQuestions) => {
        setQuestions(newQuestions);
      });
      return () => {
        cleanup();
        window.removeEventListener("focus", loadQuestions);
      };
    }

    return () => {
      window.removeEventListener("focus", loadQuestions);
    };
  }, []);

  // Outro logic
  useEffect(() => {
    if (status === "outro") {
      const timer = setTimeout(() => {
        window.close();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleNextQuestion = useCallback(
    async (isTimeout = false) => {
      if (questions.length === 0 || status === "outro") return;
      const currentQuestion = questions[currentQuestionIndex];

      if (isTimeout && window.electronAPI?.setToastAction) {
        await window.electronAPI.setToastAction(Actions.question_timeout, {
          question: currentQuestion.text,
        });
        // Clear toast after 3 seconds
        setTimeout(async () => {
          if (window.electronAPI?.setToastAction) {
            await window.electronAPI.setToastAction(null);
          }
        }, 3000);
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTimeLeft(TIMER_DURATION);
        setIsAnswering(false);
      } else {
        // All questions answered - show outro
        setStatus("outro");
      }
    },
    [questions, currentQuestionIndex, status]
  );

  // Timer logic
  useEffect(() => {
    if (isAnswering || questions.length === 0 || status !== "active") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - treat as no answer or auto-move
          handleNextQuestion(true);
          return TIMER_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswering, questions.length, handleNextQuestion, status]);

  const handleAnswer = async (answer: "YES" | "NO") => {
    if (isAnswering || questions.length === 0) return;
    const currentQuestion = questions[currentQuestionIndex];

    setIsAnswering(true);

    // Show toast based on answer
    if (window.electronAPI?.setToastAction) {
      const action =
        answer === "YES"
          ? Actions.question_answered_yes
          : Actions.question_answered_no;
      await window.electronAPI.setToastAction(action, {
        question: `Question - ${currentQuestion.text}`,
      });

      // Clear toast after 3 seconds
      setTimeout(async () => {
        if (window.electronAPI?.setToastAction) {
          await window.electronAPI.setToastAction(null);
        }
      }, 3000);
    }

    // Simulate delay for visual feedback before next question
    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  if (questions.length === 0) {
    return (
      <WindowWrapper title="FileBert - Question">
        <div className="w-full h-full flex items-center justify-center bg-[#202532] text-white">
          Loading questions...
        </div>
      </WindowWrapper>
    );
  }

  if (status === "intro") {
    return (
      <WindowWrapper title="FileBert - Question">
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#202532] text-white gap-4">
          <h1 className="text-4xl font-bold animate-pulse">Get Ready</h1>
          <div className="text-6xl font-bold text-primary">
            {introCountdown}
          </div>
        </div>
      </WindowWrapper>
    );
  }

  if (status === "outro") {
    return (
      <WindowWrapper title="FileBert - Question">
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#202532] text-white gap-4 animate-in fade-in duration-500">
          <h1 className="text-3xl font-bold text-center px-6">
            All questions answered!
          </h1>
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      </WindowWrapper>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = (timeLeft / TIMER_DURATION) * 100;

  return (
    <WindowWrapper title="FileBert - Question">
      <div className="w-full h-full flex flex-col bg-[#202532]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <div className="flex flex-row gap-2 items-center">
            <CircleQuestionMark className="text-white" />
            <h1 className="text-xl font-semibold text-white">Question</h1>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Timer size={16} />
            <span className="text-sm font-mono">{timeLeft}s</span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full h-1 bg-white/10">
          <div
            className={cn(
              "h-full bg-primary ease-linear",
              timeLeft === TIMER_DURATION
                ? "transition-none"
                : "transition-all duration-1000"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6">
          {/* Question Section */}
          <div className="bg-[#e6eaef] rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              Question - {currentQuestionIndex + 1} / {questions.length}
            </p>
            <h3 className="text-lg font-medium text-gray-900">
              {currentQuestion.text}
            </h3>
          </div>

          {/* Answer Cards */}
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            {/* Left Card - NO */}
            <div
              onClick={() => handleAnswer("NO")}
              className="flex-1 bg-[#FF8D8F] rounded-lg hover:opacity-90 cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="flex flex-col md:flex-row items-center justify-between h-full p-6">
                <ChevronsLeft
                  size={64}
                  className="text-white/80 mb-4 md:mb-0"
                />
                <div className="text-center md:text-left md:ml-4">
                  <p className="text-sm text-white/90">Swipe Left to Answer</p>
                  <h3 className="text-4xl font-bold text-white">NO</h3>
                </div>
              </div>
            </div>

            {/* Right Card - YES */}
            <div
              onClick={() => handleAnswer("YES")}
              className="flex-1 bg-[#8DC0FF] rounded-lg hover:opacity-90 cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="flex flex-col md:flex-row items-center justify-between h-full p-6">
                <div className="text-center md:text-right md:mr-4 order-2 md:order-1">
                  <p className="text-sm text-white/90">Swipe Right to Answer</p>
                  <h3 className="text-4xl font-bold text-white">YES</h3>
                </div>
                <ChevronsRight
                  size={64}
                  className="text-white/80 mb-4 md:mb-0 order-1 md:order-2"
                />
              </div>
            </div>
          </div>

          {/* Question Indicators */}
          <div className="mt-6 flex justify-center items-center gap-2">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentQuestionIndex ? "bg-white" : "bg-white/40"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </WindowWrapper>
  );
};
