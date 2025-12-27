import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the LandingPage as the new entry point
    navigate("/");
  }, [navigate]);

  // Optionally, render a small loading spinner or message while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-lg">Loading application...</p>
    </div>
  );
};

export default Index;