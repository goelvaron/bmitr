import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface BlogFetchMethodInfoProps {
  method: string;
}

const BlogFetchMethodInfo = ({ method }: BlogFetchMethodInfoProps) => {
  const getMethodInfo = () => {
    switch (method) {
      case "direct-api":
        return {
          title: "Direct Blogger API",
          description: "Using the official Blogger API v3",
          pros: [
            "Full access to all blog data",
            "Reliable and officially supported",
            "Pagination and filtering support",
          ],
          cons: [
            "Requires Google Cloud API key",
            "Limited to 10,000 requests per day",
            "API key must be secured properly",
          ],
          setup:
            "Create an API key in Google Cloud Console and enable the Blogger API. Find your blog ID in your Blogger dashboard URL.",
        };
      case "rss-feed":
        return {
          title: "RSS Feed",
          description: "Using Blogger's built-in RSS feed",
          pros: [
            "No API key required",
            "Simple to implement",
            "Works with any Blogger blog",
          ],
          cons: [
            "Limited data available",
            "No pagination support",
            "May have CORS issues",
            "Limited to most recent posts",
          ],
          setup:
            "Just provide your blog URL. The system will append /feeds/posts/default?alt=rss to fetch the RSS feed.",
        };
      case "json-feed":
        return {
          title: "JSON Feed",
          description: "Using Blogger's JSON feed format",
          pros: [
            "No API key required",
            "More data than RSS feed",
            "Native JSON format",
          ],
          cons: [
            "May have CORS issues",
            "Limited filtering options",
            "Limited to recent posts",
          ],
          setup:
            "Just provide your blog URL. The system will append /feeds/posts/default?alt=json to fetch the JSON feed.",
        };
      case "proxy-server":
        return {
          title: "Proxy Server",
          description: "Using a custom proxy server to fetch blog data",
          pros: [
            "Avoids CORS issues",
            "Keeps API keys secure",
            "Can add custom caching",
          ],
          cons: [
            "Requires setting up a separate server",
            "Additional infrastructure to maintain",
            "Potential single point of failure",
          ],
          setup:
            "Set up a proxy server that forwards requests to the Blogger API. Enter the proxy URL and your blog ID.",
        };
      case "edge-function":
        return {
          title: "Supabase Edge Function",
          description: "Using a Supabase Edge Function to fetch blog data",
          pros: [
            "Keeps API keys secure",
            "Avoids CORS issues",
            "Serverless architecture",
            "Built into your existing Supabase project",
          ],
          cons: [
            "Limited to Supabase's execution time limits",
            "Requires Supabase project setup",
            "May incur additional costs with high traffic",
          ],
          setup:
            "The Edge Function is already deployed. Just provide your Blogger API key and blog ID.",
        };
      default:
        return {
          title: "Unknown Method",
          description: "Method not recognized",
          pros: [],
          cons: [],
          setup: "Please select a valid fetch method.",
        };
    }
  };

  const info = getMethodInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{info.title}</CardTitle>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Advantages
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            {info.pros.map((pro, index) => (
              <li key={index} className="text-sm">
                {pro}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Limitations
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            {info.cons.map((con, index) => (
              <li key={index} className="text-sm">
                {con}
              </li>
            ))}
          </ul>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Setup Instructions</AlertTitle>
          <AlertDescription className="text-sm">{info.setup}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BlogFetchMethodInfo;
