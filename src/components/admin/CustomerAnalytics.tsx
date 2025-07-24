import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCustomerAnalytics } from "@/data/customers";

interface AnalyticsData {
  totalCustomers: number;
  byState: Record<string, number>;
  byKilnType: Record<string, number>;
  interestedInExclusiveCount: number;
  joinedByMonth: Record<string, number>;
}

const CustomerAnalytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Get analytics data
    const data = getCustomerAnalytics();
    setAnalytics(data);
  }, []);

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.customerAnalytics.title")}</CardTitle>
          <CardDescription>
            {t("admin.customerAnalytics.loading")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get top states (up to 5)
  const topStates = Object.entries(analytics.byState)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Get kiln type distribution
  const kilnTypes = Object.entries(analytics.byKilnType).sort(
    (a, b) => b[1] - a[1],
  );

  // Get monthly trend (last 6 months)
  const monthlyTrend = Object.entries(analytics.joinedByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Customers Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-orange-800">
            {t("admin.customerAnalytics.totalCustomers")}
          </CardTitle>
          <CardDescription>
            {t("admin.customerAnalytics.overallOnboarded")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{analytics.totalCustomers}</div>
          <div className="text-sm text-muted-foreground mt-2">
            {analytics.interestedInExclusiveCount}{" "}
            {t("admin.customerAnalytics.interestedInExclusive")} (
            {Math.round(
              (analytics.interestedInExclusiveCount /
                analytics.totalCustomers) *
                100,
            ) || 0}
            %)
          </div>
        </CardContent>
      </Card>

      {/* Top States Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-orange-800">
            {t("admin.customerAnalytics.topStates")}
          </CardTitle>
          <CardDescription>
            {t("admin.customerAnalytics.distributionByState")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStates.length > 0 ? (
              topStates.map(([state, count]) => (
                <div key={state} className="flex items-center">
                  <div className="w-36 truncate">{state}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            (count / analytics.totalCustomers) * 100,
                            100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-10 text-right text-sm">{count}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("admin.customerAnalytics.noData")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kiln Types Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-orange-800">
            {t("admin.customerAnalytics.kilnTypes")}
          </CardTitle>
          <CardDescription>
            {t("admin.customerAnalytics.distributionByKilnType")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kilnTypes.length > 0 ? (
              kilnTypes.map(([type, count]) => {
                const kilnTypeLabels: Record<string, string> = {
                  zigzag: t("admin.customerAnalytics.kilnTypes.zigzag"),
                  fcbtk: t("admin.customerAnalytics.kilnTypes.fcbtk"),
                  hoffman: t("admin.customerAnalytics.kilnTypes.hoffman"),
                  tunnel: t("admin.customerAnalytics.kilnTypes.tunnel"),
                  other: t("admin.customerAnalytics.kilnTypes.other"),
                };

                return (
                  <div key={type} className="flex items-center">
                    <div className="w-36 truncate">
                      {kilnTypeLabels[type] || type}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              (count / analytics.totalCustomers) * 100,
                              100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right text-sm">{count}</div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("admin.customerAnalytics.noData")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend Card */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-orange-800">
            {t("admin.customerAnalytics.monthlyTrend")}
          </CardTitle>
          <CardDescription>
            {t("admin.customerAnalytics.newCustomersPerMonth")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlyTrend.length > 0 ? (
              monthlyTrend.map(([month, count]) => {
                const maxCount = Math.max(
                  ...monthlyTrend.map(([_, count]) => count),
                );
                const heightPercentage = (count / maxCount) * 100;

                // Format month for display (YYYY-MM to MMM YYYY)
                const [year, monthNum] = month.split("-");
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                const formattedMonth = date.toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={month}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="w-full flex justify-center">
                      <div
                        className="w-16 bg-orange-500 rounded-t-md"
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-center">
                      <div>{formattedMonth}</div>
                      <div className="font-semibold">{count}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-sm text-muted-foreground">
                {t("admin.customerAnalytics.noMonthlyData")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAnalytics;
