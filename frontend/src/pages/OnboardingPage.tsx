import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner"; // Using sonner for toasts

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  companySize: z.enum(["15-35", "36-60", "61-95", "96-200"], {
    required_error: "Please select your company size.",
  }),
});

const OnboardingPage = () => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      companySize: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          companySize: values.companySize,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to start session.");
      }

      const data = await response.json();

      // Store session data received from the backend
      localStorage.setItem("founderClaritySessionId", data.sessionId);
      localStorage.setItem("founderClarityUserId", data.userId);
      localStorage.setItem("founderClarityQuestions", JSON.stringify(data.questions));
      
      // Store user details for use in later stages (like the report page)
      localStorage.setItem("founderClarityUser", JSON.stringify({
        userId: data.userId,
        name: values.name,
        email: values.email,
        company_size_range: values.companySize,
      }));


      toast.success("Session started successfully! Proceeding to diagnostic.");
      navigate("/diagnostic");

    } catch (error) {
      console.error("Error starting session:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unknown error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card border-border text-card-foreground shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Tell Us About You
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            To tailor your insights, please provide a few details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Your Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="bg-input border-input text-foreground placeholder:text-muted-foreground focus:ring-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Your Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                        className="bg-input border-input text-foreground placeholder:text-muted-foreground focus:ring-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Company Size (Employees)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-input text-foreground focus:ring-ring">
                          <SelectValue placeholder="Select your company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="15-35">15-35 employees (Early-stage)</SelectItem>
                        <SelectItem value="36-60">36-60 employees (Growth-stage)</SelectItem>
                        <SelectItem value="61-95">61-95 employees (Scaling)</SelectItem>
                        <SelectItem value="96-200">96-200 employees (Mature Scaling)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Continue to Diagnostic
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;