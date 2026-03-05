"use client";

/**
 * Phase 2 – Real-data Analytics Dashboard
 *
 * Replaces the random-number charts with actual MongoDB aggregations
 * fetched from GET /api/analytics.
 */

import { useEffect, useState } from "react";
import type { ImpactMetrics } from "@/lib/types";
import StatCard from "@/components/shared/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Package,
  Users,
  HandHeart,
  Leaf,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load analytics");
        return r.json();
      })
      .then(setMetrics)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 border border-destructive/30 rounded-lg bg-destructive/5">
        <AlertTriangle className="h-5 w-5" />
        <span>Failed to load analytics: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top KPI cards ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Donations"
          value={metrics.totalDonations.toString()}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description={`${metrics.availableCount} available now`}
        />
        <StatCard
          title="Total Users"
          value={metrics.totalUsers.toString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description={`${metrics.donorsCount} donors · ${metrics.distributorsCount} distributors`}
        />
        <StatCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          description={`${metrics.completedCount} of ${metrics.totalDonations} completed`}
        />
        <StatCard
          title="Claim Rate"
          value={`${metrics.claimRate}%`}
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
          description={`${metrics.claimedCount + metrics.completedCount} donations claimed`}
        />
      </div>

      {/* ── Impact metrics ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <HandHeart className="h-4 w-4" /> Meals Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {metrics.estimatedMealsSaved.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated meals delivered
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Leaf className="h-4 w-4" /> CO₂ Saved (kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {metrics.estimatedCO2Saved.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Equivalent emissions avoided
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Avg. Time to Claim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {metrics.avgTimeToClaimHours}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From posting to claim
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.expiredCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Donations gone to waste
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts ──────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Donation Activity (6 Months)
            </CardTitle>
            <CardDescription>Donations posted vs. completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="donations"
                    fill="#10B981"
                    name="Posted"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    fill="#3B82F6"
                    name="Completed"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Claims Trend (6 Months)
            </CardTitle>
            <CardDescription>Monthly claim activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="claimed"
                    stroke="#F59E0B"
                    name="Claimed"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10B981"
                    name="Completed"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Status breakdown ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Donation Status Breakdown</CardTitle>
          <CardDescription>Current snapshot of all donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Available", count: metrics.availableCount, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
              { label: "Claimed",   count: metrics.claimedCount,   color: "bg-blue-100 text-blue-700 border-blue-200" },
              { label: "Completed", count: metrics.completedCount, color: "bg-gray-100 text-gray-700 border-gray-200" },
              { label: "Expired",   count: metrics.expiredCount,   color: "bg-red-100 text-red-700 border-red-200" },
            ].map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm ${s.color}`}
              >
                {s.label}
                <Badge variant="outline" className="ml-1 font-bold text-inherit">
                  {s.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
