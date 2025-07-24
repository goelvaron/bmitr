import React, { useState, useEffect } from "react";
import {
  getAllWaitlistSubmissions,
  exportWaitlistData,
  clearAllWaitlistSubmissions,
  type SubmissionData,
} from "@/utils/waitlistStorage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertCircle, Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WaitlistDataViewer = () => {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const data = getAllWaitlistSubmissions();
    setSubmissions(data);
  }, []);

  const handleClearData = () => {
    clearAllWaitlistSubmissions();
    setSubmissions([]);
  };

  const handleExportData = () => {
    exportWaitlistData();
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      submission.name.toLowerCase().includes(searchLower) ||
      submission.email.toLowerCase().includes(searchLower) ||
      submission.companyName.toLowerCase().includes(searchLower) ||
      submission.state.toLowerCase().includes(searchLower) ||
      submission.district.toLowerCase().includes(searchLower)
    );
  });

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Waitlist Submissions</CardTitle>
        <CardDescription>
          View and manage all user submissions to the Bhatta Mitra™ waitlist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-2.5 top-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    all waitlist submissions stored in your browser.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>
                    Yes, delete all data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No submissions yet</h3>
            <p className="text-muted-foreground">
              When users submit the onboarding form, their data will appear
              here.
            </p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableCaption>A list of all waitlist submissions.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Kiln Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.name}
                    </TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.companyName}</TableCell>
                    <TableCell>{`${submission.district}, ${submission.state}`}</TableCell>
                    <TableCell>
                      {submission.kilnType === "zigzag"
                        ? "Zigzag Kiln"
                        : submission.kilnType === "fcbtk"
                          ? "FCBTK"
                          : submission.kilnType === "hoffman"
                            ? "Hoffman Kiln"
                            : submission.kilnType === "tunnel"
                              ? "Tunnel Kiln"
                              : "Other"}
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submissionDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Total submissions: {submissions.length}
        </div>
        {filteredSubmissions.length !== submissions.length && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredSubmissions.length} of {submissions.length}{" "}
            submissions
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default WaitlistDataViewer;
