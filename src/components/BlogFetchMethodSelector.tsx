import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type BlogFetchMethod =
  | "direct-api"
  | "rss-feed"
  | "json-feed"
  | "proxy-server"
  | "edge-function";

interface BlogFetchMethodSelectorProps {
  selectedMethod: BlogFetchMethod;
  onMethodChange: (method: BlogFetchMethod) => void;
}

const BlogFetchMethodSelector = ({
  selectedMethod,
  onMethodChange,
}: BlogFetchMethodSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Fetch Method</CardTitle>
        <CardDescription>
          Select how you want to fetch blog posts from Blogger
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => onMethodChange(value as BlogFetchMethod)}
          className="space-y-4"
        >
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="direct-api" id="direct-api" />
            <div className="grid gap-1.5">
              <Label htmlFor="direct-api" className="font-medium">
                Direct Blogger API
              </Label>
              <p className="text-sm text-muted-foreground">
                Uses the official Blogger API v3 with your API key. Requires API
                key configuration.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="rss-feed" id="rss-feed" />
            <div className="grid gap-1.5">
              <Label htmlFor="rss-feed" className="font-medium">
                RSS Feed
              </Label>
              <p className="text-sm text-muted-foreground">
                Fetches posts from the blog's RSS feed. No API key required, but
                limited functionality.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="json-feed" id="json-feed" />
            <div className="grid gap-1.5">
              <Label htmlFor="json-feed" className="font-medium">
                JSON Feed
              </Label>
              <p className="text-sm text-muted-foreground">
                Uses Blogger's JSON feed. No API key required, but may have CORS
                limitations.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="proxy-server" id="proxy-server" />
            <div className="grid gap-1.5">
              <Label htmlFor="proxy-server" className="font-medium">
                Proxy Server
              </Label>
              <p className="text-sm text-muted-foreground">
                Uses a custom proxy server to fetch blog posts. Helps avoid CORS
                issues and hides API keys.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="edge-function" id="edge-function" />
            <div className="grid gap-1.5">
              <Label htmlFor="edge-function" className="font-medium">
                Supabase Edge Function
              </Label>
              <p className="text-sm text-muted-foreground">
                Uses a Supabase Edge Function to fetch blog posts securely. Best
                for production use.
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default BlogFetchMethodSelector;
