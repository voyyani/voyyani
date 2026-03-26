// Analytics utilities for Phase 4

export interface AnalyticsMetrics {
  totalSubmissions: number;
  totalReplies: number;
  averageResponseTime: number; // in minutes
  statusBreakdown: Record<string, number>;
  submissionsByDate: Array<{ date: string; count: number }>;
  replysByDate: Array<{ date: string; count: number }>;
  emailDeliveryRate: number; // percentage
  emailOpenRate: number; // percentage
  priorityBreakdown: Record<string, number>;
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
}

export class AnalyticsService {
  constructor(private supabaseClient: any) {}

  async getMetrics(filter?: AnalyticsFilter): Promise<AnalyticsMetrics> {
    const startDate =
      filter?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filter?.endDate || new Date();

    try {
      // Get submissions count
      let submissionsQuery = this.supabaseClient
        .from("submissions")
        .select("id, status, priority, created_at, responded_at", {
          count: "exact",
        })
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (filter?.status) {
        submissionsQuery = submissionsQuery.eq("status", filter.status);
      }

      const { data: submissions, count: totalSubmissions } =
        await submissionsQuery;

      // Get replies and email stats
      const { data: replies } = await this.supabaseClient
        .from("submission_replies")
        .select("id, created_at, email_status", {
          count: "exact",
        })
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Calculate metrics
      const metrics: AnalyticsMetrics = {
        totalSubmissions: totalSubmissions || 0,
        totalReplies: replies?.length || 0,
        averageResponseTime: this.calculateAverageResponseTime(submissions),
        statusBreakdown: this.groupByStatus(submissions),
        submissionsByDate: this.groupByDate(submissions, "submissions"),
        replysByDate: this.groupByDate(replies, "replies"),
        emailDeliveryRate: this.calculateEmailDeliveryRate(replies),
        emailOpenRate: this.calculateEmailOpenRate(replies),
        priorityBreakdown: this.groupByPriority(submissions),
      };

      return metrics;
    } catch (error) {
      console.error("Error fetching analytics metrics:", error);
      throw error;
    }
  }

  private calculateAverageResponseTime(submissions: any[]): number {
    if (!submissions || submissions.length === 0) return 0;

    const responseTimes = submissions
      .filter((s) => s.responded_at)
      .map((s) => {
        const created = new Date(s.created_at).getTime();
        const responded = new Date(s.responded_at).getTime();
        return (responded - created) / (1000 * 60); // Convert to minutes
      });

    if (responseTimes.length === 0) return 0;

    const sum = responseTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / responseTimes.length);
  }

  private groupByStatus(
    submissions: any[]
  ): Record<string, number> {
    const breakdown: Record<string, number> = {
      new: 0,
      in_progress: 0,
      responded: 0,
      closed: 0,
    };

    submissions?.forEach((s) => {
      if (s.status in breakdown) {
        breakdown[s.status]++;
      }
    });

    return breakdown;
  }

  private groupByPriority(
    submissions: any[]
  ): Record<string, number> {
    const breakdown: Record<string, number> = {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0,
    };

    submissions?.forEach((s) => {
      if (s.priority && s.priority in breakdown) {
        breakdown[s.priority]++;
      } else if (s.priority) {
        breakdown[s.priority] = 1;
      }
    });

    return breakdown;
  }

  private groupByDate(
    items: any[],
    type: "submissions" | "replies"
  ): Array<{ date: string; count: number }> {
    const dateMap = new Map<string, number>();

    items?.forEach((item) => {
      const date = new Date(item.created_at)
        .toISOString()
        .split("T")[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
  }

  private calculateEmailDeliveryRate(replies: any[]): number {
    if (!replies || replies.length === 0) return 0;

    const delivered = replies.filter(
      (r) => r.email_status === "delivered" || r.email_status === "opened" || r.email_status === "clicked"
    ).length;

    return Math.round((delivered / replies.length) * 100);
  }

  private calculateEmailOpenRate(replies: any[]): number {
    if (!replies || replies.length === 0) return 0;

    const opened = replies.filter(
      (r) => r.email_status === "opened" || r.email_status === "clicked"
    ).length;

    return Math.round((opened / replies.length) * 100);
  }
}

export async function exportToCSV(
  data: any[],
  filename: string = "export.csv"
): Promise<void> {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
