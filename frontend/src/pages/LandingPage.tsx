import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import DisclaimerDialog from "@/components/DisclaimerDialog";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard"; // Import AnalyticsDashboard

const LandingPage = () => {
  const navigate = useNavigate();
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const handleStartDiagnosticClick = () => {
    setIsDisclaimerOpen(true);
  };

  const handleConfirmDisclaimer = () => {
    setIsDisclaimerOpen(false);
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-2xl bg-card border-border text-card-foreground shadow-lg mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary">
            Founder Clarity Compass
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2 text-lg">
            Gain instant clarity on your leadership mindset and operational blind spots.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-foreground text-md leading-relaxed">
            Founders at growth inflection points often feel stuck and overwhelmed. Whether you're
            an early-stage leader struggling with delegation or a scaling CEO facing leadership
            misalignment, the Clarity Compass helps you uncover:
          </p>
          <ul className="list-disc list-inside text-left mx-auto max-w-md space-y-2 text-foreground">
            <li>The top mindset shift you need to make</li>
            <li>The top operational focus for your stage</li>
            <li>A suggested next move (reflection, consult, or action)</li>
          </ul>
          <p className="text-foreground text-md leading-relaxed">
            The experience is empathetic, supportive, and human, designed to give you sharper
            insight and peace of mind in less than 10 minutes.
          </p>
          <Button
            onClick={handleStartDiagnosticClick}
            className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Start Your Diagnostic
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Insights are directional, not prescriptive. Your data is private and used respectfully.
          </p>
        </CardContent>
      </Card>

      {/* New Card for Analytics Dashboard */}
      <Card className="w-full max-w-2xl bg-card border-border text-card-foreground shadow-lg mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Common Focus Areas by Company Size
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Insights from founders like you, showing prevalent operational focuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsDashboard />
        </CardContent>
      </Card>

      <MadeWithDyad />

      <DisclaimerDialog
        isOpen={isDisclaimerOpen}
        onOpenChange={setIsDisclaimerOpen}
        onConfirm={handleConfirmDisclaimer}
      />
    </div>
  );
};

export default LandingPage;