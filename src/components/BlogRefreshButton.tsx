import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface BlogRefreshButtonProps {
  onRefresh?: () => void;
}

const BlogRefreshButton = ({ onRefresh }: BlogRefreshButtonProps) => {
  const handleRefresh = () => {
    // Clear any cached data
    localStorage.clear();
    console.log("Cache cleared by refresh button");

    if (onRefresh) {
      onRefresh();
    } else {
      // Default behavior: reload the page
      window.location.reload();
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleRefresh}
      title="Refresh blog content"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
};

export default BlogRefreshButton;
