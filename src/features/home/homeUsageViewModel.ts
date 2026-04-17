import type {
  AccountSnapshot,
  LocalUsageDay,
  LocalUsageSnapshot,
  RateLimitSnapshot,
} from "../../types";
import { formatRelativeTime } from "../../utils/time";
import { getUsageLabels } from "../app/utils/usageLabels";
import {
  buildWindowCaption,
  formatCompactNumber,
  formatCount,
  formatCreditsBalance,
  formatDayLabel,
  formatDuration,
  formatDurationCompact,
  formatPlanType,
  isUsageDayActive,
} from "./homeFormatters";
import type { HomeStatCard, UsageMetric } from "./homeTypes";

type HomeUsageViewModel = {
  accountCards: HomeStatCard[];
  accountMeta: string | null;
  updatedLabel: string | null;
  usageCards: HomeStatCard[];
  usageDays: LocalUsageDay[];
  usageInsights: HomeStatCard[];
};

type Translate = (key: string, params?: Record<string, string | number>) => string;

export function buildHomeUsageViewModel({
  accountInfo,
  accountRateLimits,
  localUsageSnapshot,
  usageMetric,
  usageShowRemaining,
  t,
}: {
  accountInfo: AccountSnapshot | null;
  accountRateLimits: RateLimitSnapshot | null;
  localUsageSnapshot: LocalUsageSnapshot | null;
  usageMetric: UsageMetric;
  usageShowRemaining: boolean;
  t: Translate;
}): HomeUsageViewModel {
  const usageTotals = localUsageSnapshot?.totals ?? null;
  const usageDays = localUsageSnapshot?.days ?? [];
  const latestUsageDay = usageDays[usageDays.length - 1] ?? null;
  const last7Days = usageDays.slice(-7);
  const last7Tokens = last7Days.reduce((total, day) => total + day.totalTokens, 0);
  const last7Input = last7Days.reduce((total, day) => total + day.inputTokens, 0);
  const last7Cached = last7Days.reduce(
    (total, day) => total + day.cachedInputTokens,
    0,
  );
  const last7AgentMs = last7Days.reduce(
    (total, day) => total + (day.agentTimeMs ?? 0),
    0,
  );
  const last30AgentMs = usageDays.reduce(
    (total, day) => total + (day.agentTimeMs ?? 0),
    0,
  );
  const averageDailyAgentMs =
    last7Days.length > 0 ? Math.round(last7AgentMs / last7Days.length) : 0;
  const last7AgentRuns = last7Days.reduce(
    (total, day) => total + (day.agentRuns ?? 0),
    0,
  );
  const last30AgentRuns = usageDays.reduce(
    (total, day) => total + (day.agentRuns ?? 0),
    0,
  );
  const averageTokensPerRun =
    last7AgentRuns > 0 ? Math.round(last7Tokens / last7AgentRuns) : null;
  const averageRunDurationMs =
    last7AgentRuns > 0 ? Math.round(last7AgentMs / last7AgentRuns) : null;
  const last7ActiveDays = last7Days.filter(isUsageDayActive).length;
  const last30ActiveDays = usageDays.filter(isUsageDayActive).length;
  const averageActiveDayAgentMs =
    last7ActiveDays > 0 ? Math.round(last7AgentMs / last7ActiveDays) : null;
  const peakAgentDay = usageDays.reduce<
    | { day: string; agentTimeMs: number }
    | null
  >((best, day) => {
    const value = day.agentTimeMs ?? 0;
    if (value <= 0) {
      return best;
    }
    if (!best || value > best.agentTimeMs) {
      return { day: day.day, agentTimeMs: value };
    }
    return best;
  }, null);

  let longestStreak = 0;
  let runningStreak = 0;
  for (const day of usageDays) {
    if (isUsageDayActive(day)) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  const usageCards: HomeStatCard[] =
    usageMetric === "tokens"
      ? [
          {
            label: t("home.usage.card.today"),
            value: formatCompactNumber(latestUsageDay?.totalTokens ?? 0),
            suffix: t("home.usage.suffix.tokens"),
            caption: latestUsageDay
              ? t("home.usage.caption.todayBreakdown", {
                  day: formatDayLabel(latestUsageDay.day),
                  input: formatCount(latestUsageDay.inputTokens),
                  output: formatCount(latestUsageDay.outputTokens),
                })
              : t("home.usage.caption.latestAvailableDay"),
          },
          {
            label: t("home.usage.card.last7Days"),
            value: formatCompactNumber(usageTotals?.last7DaysTokens ?? last7Tokens),
            suffix: t("home.usage.suffix.tokens"),
            caption: t("home.usage.caption.avgPerDay", {
              value: formatCompactNumber(usageTotals?.averageDailyTokens),
            }),
          },
          {
            label: t("home.usage.card.last30Days"),
            value: formatCompactNumber(usageTotals?.last30DaysTokens ?? last7Tokens),
            suffix: t("home.usage.suffix.tokens"),
            caption: t("home.usage.caption.total", {
              value: formatCount(usageTotals?.last30DaysTokens ?? last7Tokens),
            }),
          },
          {
            label: t("home.usage.card.cacheHitRate"),
            value: usageTotals ? `${usageTotals.cacheHitRatePercent.toFixed(1)}%` : "--",
            caption: t("home.usage.caption.last7Days"),
          },
          {
            label: t("home.usage.card.cachedTokens"),
            value: formatCompactNumber(last7Cached),
            suffix: t("home.usage.suffix.saved"),
            caption:
              last7Input > 0
                ? t("home.usage.caption.promptTokensShare", {
                    value: ((last7Cached / last7Input) * 100).toFixed(1),
                  })
                : t("home.usage.caption.last7Days"),
          },
          {
            label: t("home.usage.card.avgPerRun"),
            value:
              averageTokensPerRun === null
                ? "--"
                : formatCompactNumber(averageTokensPerRun),
            suffix: t("home.usage.suffix.tokens"),
            caption:
              last7AgentRuns > 0
                ? t("home.usage.caption.runsInLast7", {
                    count: formatCount(last7AgentRuns),
                  })
                : t("home.usage.caption.noRunsYet"),
          },
          {
            label: t("home.usage.card.peakDay"),
            value: formatDayLabel(usageTotals?.peakDay),
            caption: t("home.usage.caption.total", {
              value: `${formatCompactNumber(usageTotals?.peakDayTokens)} ${t("home.usage.suffix.tokens")}`,
            }),
          },
        ]
      : [
          {
            label: t("home.usage.card.last7Days"),
            value: formatDurationCompact(last7AgentMs),
            suffix: t("home.usage.suffix.agentTime"),
            caption: t("home.usage.caption.avgPerDay", {
              value: formatDurationCompact(averageDailyAgentMs),
            }),
          },
          {
            label: t("home.usage.card.last30Days"),
            value: formatDurationCompact(last30AgentMs),
            suffix: t("home.usage.suffix.agentTime"),
            caption: t("home.usage.caption.total", {
              value: formatDuration(last30AgentMs),
            }),
          },
          {
            label: t("home.usage.card.runs"),
            value: formatCount(last7AgentRuns),
            suffix: t("home.usage.suffix.runs"),
            caption: t("home.usage.caption.last30Runs", {
              count: formatCount(last30AgentRuns),
            }),
          },
          {
            label: t("home.usage.card.avgPerRun"),
            value: formatDurationCompact(averageRunDurationMs),
            caption:
              last7AgentRuns > 0
                ? t("home.usage.caption.acrossRuns", {
                    count: formatCount(last7AgentRuns),
                  })
                : t("home.usage.caption.noRunsYet"),
          },
          {
            label: t("home.usage.card.avgPerActiveDay"),
            value: formatDurationCompact(averageActiveDayAgentMs),
            caption:
              last7ActiveDays > 0
                ? t("home.usage.caption.activeDaysInLast7", {
                    count: formatCount(last7ActiveDays),
                  })
                : t("home.usage.caption.noActiveDaysYet"),
          },
          {
            label: t("home.usage.card.peakDay"),
            value: formatDayLabel(peakAgentDay?.day ?? null),
            caption: `${formatDurationCompact(peakAgentDay?.agentTimeMs ?? 0)} ${t("home.usage.suffix.agentTime")}`,
          },
        ];

  const usageInsights = [
    {
      label: t("home.usage.card.longestStreak"),
      value:
        longestStreak > 0
          ? t(
              longestStreak === 1
                ? "home.usage.dayCount.one"
                : "home.usage.dayCount.other",
              { count: longestStreak },
            )
          : "--",
      caption:
        longestStreak > 0
          ? t("home.usage.caption.currentRange")
          : t("home.usage.caption.noActiveStreakYet"),
      compact: true,
    },
    {
      label: t("home.usage.card.activeDays"),
      value: last7Days.length > 0 ? `${last7ActiveDays} / ${last7Days.length}` : "--",
      caption:
        usageDays.length > 0
          ? t("home.usage.caption.inCurrentRange", {
              count: last30ActiveDays,
              total: usageDays.length,
            })
          : t("home.usage.caption.noActivityYet"),
      compact: true,
    },
  ] satisfies HomeStatCard[];

  const usagePercentLabels = getUsageLabels(accountRateLimits, usageShowRemaining);
  const planLabel = formatPlanType(accountRateLimits?.planType ?? accountInfo?.planType);
  const creditsBalance = formatCreditsBalance(accountRateLimits?.credits?.balance);
  const accountCards: HomeStatCard[] = [];

  if (usagePercentLabels.sessionPercent !== null) {
    accountCards.push({
      label: usageShowRemaining
        ? t("home.usage.card.sessionLeft")
        : t("home.usage.card.sessionUsage"),
      value: `${usagePercentLabels.sessionPercent}%`,
      caption: buildWindowCaption(
        usagePercentLabels.sessionResetLabel,
        accountRateLimits?.primary?.windowDurationMins,
        t("home.usage.caption.currentWindow"),
      ),
    });
  }

  if (usagePercentLabels.showWeekly && usagePercentLabels.weeklyPercent !== null) {
    accountCards.push({
      label: usageShowRemaining
        ? t("home.usage.card.weeklyLeft")
        : t("home.usage.card.weeklyUsage"),
      value: `${usagePercentLabels.weeklyPercent}%`,
      caption: buildWindowCaption(
        usagePercentLabels.weeklyResetLabel,
        accountRateLimits?.secondary?.windowDurationMins,
        t("home.usage.caption.longerWindow"),
      ),
    });
  }

  if (accountRateLimits?.credits?.hasCredits) {
    accountCards.push(
      accountRateLimits.credits.unlimited
        ? {
            label: t("home.usage.card.credits"),
            value: t("home.usage.unlimited"),
            caption: t("home.usage.caption.availableBalance"),
          }
        : {
            label: t("home.usage.card.credits"),
            value: creditsBalance ?? "--",
            suffix: creditsBalance ? t("home.usage.suffix.credits") : null,
            caption: t("home.usage.caption.availableBalance"),
          },
    );
  }

  if (planLabel) {
    accountCards.push({
      label: t("home.usage.card.plan"),
      value: planLabel,
      caption:
        accountInfo?.type === "chatgpt"
          ? t("home.usage.accountType.chatgpt")
          : accountInfo?.type === "apikey"
            ? t("home.usage.accountType.apikey")
            : t("home.usage.accountType.connected"),
    });
  }

  return {
    accountCards,
    accountMeta: accountInfo?.email ?? null,
    updatedLabel: localUsageSnapshot
      ? t("home.usage.updated", {
          value: formatRelativeTime(localUsageSnapshot.updatedAt),
        })
      : null,
    usageCards,
    usageDays,
    usageInsights,
  };
}
