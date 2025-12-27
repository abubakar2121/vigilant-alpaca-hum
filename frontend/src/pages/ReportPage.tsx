"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Report, User } from "@/lib/types";
import { trackEvent } from "@/utils/tracking-mock";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle"; // Import ThemeToggle

const ReportPage = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedReport = localStorage.getItem("founderClarityReport");
    const storedUser = localStorage.getItem("founderClarityUser");

    if (storedReport && storedUser) {
      const parsedData = JSON.parse(storedReport);
      setReport(parsedData.report || parsedData);
      setUser(JSON.parse(storedUser));
    } else {
      toast.error("No report found. Please complete the diagnostic.");
      navigate("/onboarding");
    }
  }, [navigate]);

  const handleGoHome = () => {
    // Clear local storage for a fresh start
    localStorage.removeItem("founderClarityUser");
    localStorage.removeItem("founderClaritySessionId");
    localStorage.removeItem("founderClarityReport");
    localStorage.removeItem("founderClaritySession");
    navigate("/");
  };

  const handleCTAClick = () => {
    if (report && user) {
      trackEvent("cta_click", user.user_id, report.session_id, {
        ctaLink: report.cta_link,
        reportId: report.report_id,
      });
      window.open(report.cta_link, "_blank");
    }
  };

  if (!report || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4"> {/* Changed background and text color */}
        <p className="text-lg">Loading your report...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 relative"> {/* Changed background and text color */}
      <div className="absolute top-4 right-4">
        <ThemeToggle /> {/* Add ThemeToggle */}
      </div>
      <Card className="w-full max-w-2xl bg-card border-border text-card-foreground shadow-lg"> {/* Changed card styling */}
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary"> {/* Changed text color */}
            Your Personalized Report
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2 text-lg"> {/* Changed text color */}
            Hello {user.name}, here are your insights!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-center">
          <div className="text-left space-y-4">
            <h3 className="text-2xl font-semibold text-primary">Your Top Mindset Shift:</h3> {/* Changed text color */}
            <p className="text-foreground text-lg leading-relaxed"> {/* Changed text color */}
              <span className="font-medium">{report.mindset_shift}</span>
            </p>
            <p className="text-muted-foreground text-md italic mt-1"> {/* Changed text color */}
              *Insight:* {report.mindset_shift_insight}
            </p>

            <h3 className="text-2xl font-semibold text-accent-foreground mt-6">Your Top Operational Focus:</h3> {/* Changed text color */}
            <p className="text-foreground text-lg leading-relaxed"> {/* Changed text color */}
              <span className="font-medium">{report.operational_focus}</span>
            </p>
            <p className="text-muted-foreground text-md italic mt-1"> {/* Changed text color */}
              *Insight:* {report.operational_focus_insight}
            </p>

            <h3 className="text-2xl font-semibold text-green-500 mt-6">Your Suggested Next Move:</h3> {/* Changed text color */}
            <p className="text-foreground text-lg leading-relaxed"> {/* Changed text color */}
              <span className="font-medium">{report.next_move.type}</span> - {report.next_move.description}
            </p>
            {report.next_move.details && (
              <p className="text-muted-foreground text-md italic mt-2"> {/* Changed text color */}
                Details: {report.next_move.details}
              </p>
            )}
          </div>

          {report.cta_link && (
            <Button
              onClick={handleCTAClick}
              className="w-full max-w-sm bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105" // Changed button styling
            >
              Book a Consult / Join the Founder Clarity List
            </Button>
          )}

          <p className="text-sm text-muted-foreground mt-4"> {/* Changed text color */}
            You'll also receive this report in your email at {user.email}.
            <br />
            Insights are directional, not prescriptive. Your data is private and used respectfully.
          </p>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full max-w-xs bg-secondary border-border text-secondary-foreground hover:bg-secondary/80 text-lg py-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105" // Changed button styling
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportPage;