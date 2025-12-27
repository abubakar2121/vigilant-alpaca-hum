"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Question, Report, User } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/utils/tracking-mock";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import API_URL from "@/config";

const DiagnosticPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    const storedUser = localStorage.getItem("founderClarityUser");
    const storedSessionId = localStorage.getItem("founderClaritySessionId");
    const storedQuestions = localStorage.getItem("founderClarityQuestions");

    if (!storedUser || !storedSessionId || !storedQuestions) {
      toast.error("Please start the diagnostic from the beginning.");
      navigate("/onboarding");
      return;
    }

    const parsedUser: User = JSON.parse(storedUser);
    const parsedQuestions: Question[] = JSON.parse(storedQuestions);

    setUser(parsedUser);
    setSessionId(storedSessionId);
    setQuestions(parsedQuestions);

    trackEvent("diagnostic_started", parsedUser.user_id, storedSessionId, {
      companySize: parsedUser.company_size_range,
    });

    const handleBeforeUnload = () => {
      if (parsedUser && storedSessionId && currentQuestionIndex < parsedQuestions.length) {
        trackEvent("drop_off", parsedUser.user_id, storedSessionId, {
          lastQuestionId: parsedQuestions[currentQuestionIndex]?.question_id,
          progress: `${currentQuestionIndex}/${parsedQuestions.length}`,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigate]);

  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(answers[currentQuestion.question_id] || null);
    }
  }, [currentQuestionIndex, currentQuestion, answers]);

  const handleAnswerChange = (value: string) => {
    setSelectedAnswer(value);
  };

  const proceedToNextStep = useCallback(async (updatedAnswers: Record<string, string>) => {
    setShowAffirmation(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setShowAffirmation(false);

    if (currentQuestionIndex === questions.length - 1) {
      setIsLoading(true);
      setError(null);
      if (!user || !sessionId) return;

      try {
        const response = await fetch(`${API_URL}/api/v1/session/${sessionId}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedAnswers),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to complete session.");
        }

        const data = await response.json();
        localStorage.setItem("founderClarityReport", JSON.stringify(data.report));
        
        trackEvent("completion", user.user_id, sessionId, { reportId: data.report._id });
        toast.success("Diagnostic complete! Your report is ready.");
        navigate("/report");

      } catch (err) {
        console.error("Failed to generate report:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        toast.error(err instanceof Error ? err.message : "Failed to generate report.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  }, [currentQuestionIndex, questions.length, user, sessionId, navigate]);


  const handleNextQuestion = useCallback(async () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer to continue.");
      return;
    }
    const updatedAnswers = { ...answers, [currentQuestion.question_id]: selectedAnswer };
    setAnswers(updatedAnswers);
    setSelectedAnswer(null);
    proceedToNextStep(updatedAnswers);
  }, [selectedAnswer, answers, currentQuestion, proceedToNextStep]);


  const handleSkipQuestion = useCallback(async () => {
    const updatedAnswers = { ...answers, [currentQuestion.question_id]: "skipped" };
    setAnswers(updatedAnswers);
    setSelectedAnswer(null);
    proceedToNextStep(updatedAnswers);
  }, [answers, currentQuestion, proceedToNextStep]);


  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  if (!user || questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4"><p className="text-lg">Loading diagnostic...</p></div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <Card key="loading-card" className="w-full max-w-2xl bg-card border-border text-card-foreground shadow-lg text-center p-8">
          <CardTitle className="text-3xl font-bold text-primary">Generating Your Insights...</CardTitle>
          <CardDescription className="text-muted-foreground mt-4">Please wait a moment while our AI processes your responses.</CardDescription>
          <div className="mt-8">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-muted-foreground mt-4">This usually takes less than 30 seconds.</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <Card key="error-card" className="w-full max-w-md bg-card border-border text-card-foreground shadow-lg text-center p-8">
          <CardTitle className="text-3xl font-bold text-destructive">Error</CardTitle>
          <CardDescription className="text-muted-foreground mt-4">{error}</CardDescription>
          <Button onClick={() => navigate("/onboarding")} className="mt-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground">Restart Diagnostic</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card key={currentQuestionIndex} className="w-full max-w-2xl bg-card border-border text-card-foreground shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Diagnostic Questionnaire</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
          <Progress value={progress} className="w-full mt-4 h-2 bg-secondary [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary" />
        </CardHeader>
        <CardContent className="space-y-6">
          {showAffirmation && currentQuestion.affirmation_text ? (
            <div className="text-center text-lg text-accent-foreground animate-fade-in">{currentQuestion.affirmation_text}</div>
          ) : (
            <>
              <p className="text-foreground text-xl font-semibold leading-relaxed">{currentQuestion?.text}</p>
              {currentQuestion?.type === "multiple_choice" && currentQuestion.options && (
                <RadioGroup onValueChange={handleAnswerChange} value={selectedAnswer || ""} className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} className="text-primary border-input focus:ring-ring" />
                      <Label htmlFor={option.value} className="text-foreground text-base cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              <div className="flex justify-between gap-4 mt-6">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0 || isLoading}
                  variant="outline"
                  className="flex-1 bg-secondary border-border text-secondary-foreground hover:bg-secondary/80 text-lg py-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleSkipQuestion}
                  disabled={isLoading}
                  variant="ghost"
                  className="flex-1 bg-secondary border-border text-secondary-foreground hover:bg-secondary/80 text-lg py-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer || isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  {currentQuestionIndex === questions.length - 1 ? "Get Report" : "Next"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticPage;