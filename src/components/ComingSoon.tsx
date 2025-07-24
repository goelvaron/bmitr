import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  message?: string;
}

const ComingSoon = ({ message = "Content coming soon!" }: ComingSoonProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6 text-center">
        <div className="py-12">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">{message}</h3>
          <p className="text-muted-foreground">
            Please check back later or configure the Blogger API in the admin
            dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComingSoon;
