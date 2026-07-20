import React, { useState, useMemo, type ReactNode } from 'react';
import { Card, Row, Col, Tag, Button, DatePicker, Table, Tooltip as AntTooltip, message, Input, Space, Select, Modal, Segmented } from 'antd';
import {
  HeartOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  FireOutlined,
  DashboardOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  RightOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import dayjs, { type Dayjs } from 'dayjs';
import {
  dashboardStats, tokensWeekly, getCapabilityLevelDistribution, getBusinessLineDistribution,
  digitalEmployees, userUsageTrend, departmentUsage,
  efficiencyReport, BUSINESS_LINES, CAPABILITY_LEVELS,
  getEmployeeScheduledTaskRunCounts,
  getEmployeeCapabilityLevel, getEmployeeBusinessLine,
} from '../../mock/data';
import CapabilityLevelTag from '../../components/CapabilityLevelTag';
import './Dashboard.css';

const { RangePicker } = DatePicker;

type RangeValue = [Dayjs | null, Dayjs | null] | null;

const presets: { label: string; value: [Dayjs, Dayjs] }[] = [
  { label: '本周', value: [dayjs().startOf('week'), dayjs()] },
  { label: '本月', value: [dayjs().startOf('month'), dayjs()] },
  { label: '近3个月', value: [dayjs().subtract(3, 'month'), dayjs()] },
  { label: '本季度', value: [dayjs().subtract(dayjs().month() % 3, 'month').startOf('month'), dayjs()] },
  { label: '本年', value: [dayjs().startOf('year'), dayjs()] },
];

/** 二次计算指标口径说明（悬停问号展示） */
const METRIC_TIPS = {
  monthGrowth: '较上月增速 =（本月新增数字员工数 − 上月新增数）÷ 上月末总量 × 100%。',
  newEmployeesWindow: '近7天 / 近30天：按入职日期统计的上新数字员工数量（去重）。',
  tokensWindow: '总量 = 输入 Tokens + 输出 Tokens。近7天 / 近30天为对应窗口累计消耗（文本 + 多模态）。',
  avgTaskRate: '统计周期内全部在岗数字员工任务完成率的算术平均值。效能评级：≥95% 为 A+，≥90% 为 A，≥80% 为 B，其余为 C。',
  activeUsers: '统计日内至少产生 1 次会话或任务的去重平台用户数。',
  avgResponse: '统计周期内会话首条有效回复的平均等待时间（均响）。',
  sessionTiming: '均响 = 首条有效回复平均等待时间；平均耗时 = 单次会话从发起到结束的平均时长。',
  levelShare: '级别占比 = 该级别数字员工数 ÷ 数字员工总数 × 100%。',
  lineShare: '条线占比 = 该所属条线数字员工数 ÷ 数字员工总数 × 100%。',
  monthConsume: '本月累计 Tokens 消耗量；圆环占比 = 本月消耗 ÷ 月度配额 × 100%。环比 =（本月 − 上月）÷ 上月 × 100%。',
  monthRemain: '预计月度结余 = 月度配额 − 本月已消耗（不足整月时按日均外推至月末）。结余占比 = 结余 ÷ 配额 × 100%。',
  savedHours: '由数字员工替代人工完成的任务量 × 单任务标准工时估算得出。',
  costReduction: '成本降低率 =（人工基准单次成本 − 数字员工单次成本）÷ 人工基准单次成本 × 100%。',
  roi: 'ROI（投入产出比）= 产出效益估值 ÷ 平台投入成本。',
  deptActiveRate: '部门活跃率 = min(99%, 部门活跃用户数 ÷ 基准用户容量 120 × 100%)。',
  avgDeptActiveRate: '平均活跃率 = 各部门活跃率的算术平均值。单部门活跃率 = min(99%, 用户数 ÷ 120 × 100%)。',
  deptUserCount: '统计周期内该部门内使用数字员工的去重用户数。',
  deptSessionCount: '统计周期内该部门用户与数字员工产生的对话会话总数。',
  deptTaskCount: '统计周期内该部门数字员工定时任务的执行次数，不含会话触发任务。',
  deptTokens: 'Tokens 消耗按任务量估算：约等于任务数 × 1.5（单位：万）。',
  tokenUsageRate: '消耗率 = 员工已用 Tokens ÷ 配额 Tokens × 100%。',
  /** 完整效能排名 — 单员工口径（勿与驾驶舱汇总指标混淆） */
  empTaskRate: '该数字员工在统计周期内：已完成任务数 ÷ 应完成任务数 × 100%。',
  empTaskCount: '统计周期内该数字员工定时任务的执行次数，不含会话触发任务。',
  empUserCount: '统计周期内与该数字员工产生过交互的去重用户数。',
  empSessionCount: '统计周期内用户与该数字员工产生的对话会话总数。',
  empQuality: '综合任务完成质量、用户点赞/点踩反馈等评定的质量得分，满分约 100。',
  empAgentCalls: '该数字员工关联智能体在统计周期内被调用的总次数。',
  empTokens: '该数字员工在统计周期内已消耗的 Tokens 总量（单位：百万）。',
} as const;

const MetricHelp: React.FC<{ tip: ReactNode; light?: boolean }> = ({ tip, light }) => (
  <AntTooltip title={tip} placement="top" overlayClassName="dash-metric-tip-overlay">
    <QuestionCircleOutlined
      className={`dash-metric-help${light ? ' dash-metric-help--light' : ''}`}
      onClick={(e) => e.stopPropagation()}
    />
  </AntTooltip>
);

const MetricLabel: React.FC<{ children: ReactNode; tip?: ReactNode; light?: boolean }> = ({
  children, tip, light,
}) => (
  <span className="dash-metric-label">
    {children}
    {tip ? <MetricHelp tip={tip} light={light} /> : null}
  </span>
);

const HEALTH_SCORE_TIP = (
  <div className="dash-metric-tip-detail">
    <strong>系统运行健康度</strong>
    <p>加权综合得分，满分 100%。反映数字员工集群当前可用性与交付稳定性。</p>
    <dl>
      <dt>计算维度（默认权重）</dt>
      <dd>在线率 40%：在线员工数 ÷ 应在线员工总数 × 100%</dd>
      <dd>任务成功率 35%：已完成任务数 ÷ 应完成任务数 × 100%</dd>
      <dd>会话稳定性 15%：基于会话异常中断率反向计分</dd>
      <dd>资源健康 10%：Tokens 配额使用率、接口可用性等综合评估</dd>
      <dt>告警扣分</dt>
      <dd>P1 告警每条 −2 分，P2 每条 −1 分，P3 每条 −0.5 分（当日累计上限 10 分）</dd>
      <dt>较昨日变化</dt>
      <dd>今日健康度 − 昨日健康度（按自然日 00:00 快照对比）</dd>
      <dt>状态评级</dt>
      <dd>≥98% 状态良好 · 95%–98% 需关注 · &lt;95% 需干预</dd>
    </dl>
  </div>
);

const CHART_GRID = '#eef0f3';
const CHART_AXIS = '#8c8c8c';
const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid #eef0f3',
  boxShadow: '0 4px 14px rgba(15,35,70,0.08)',
  fontSize: 12,
  padding: '8px 10px',
};

const scheduledTaskRunCounts = getEmployeeScheduledTaskRunCounts();

const mapEmployeeUsageMetrics = (e: (typeof digitalEmployees)[0]) => ({
  name: e.name,
  id: e.id,
  department: e.department,
  quota: e.tokensQuota / 1000000,
  used: e.tokensUsed / 1000000,
  rate: Math.round((e.tokensUsed / e.tokensQuota) * 100),
  taskCount: scheduledTaskRunCounts.get(e.id) ?? 0,
  qualityScore: Math.floor(e.taskCompleteRate * 0.95 + 5),
  agentCalls: Math.floor(e.heat * 2) + 500,
  userCount: Math.floor(e.heat / 10) + Math.max(8, Math.floor(e.likes / 4)),
  sessionCount: Math.floor(e.heat * 0.45) + 40,
  taskCompleteRate: e.taskCompleteRate,
  line: getEmployeeBusinessLine(e),
  capLevel: getEmployeeCapabilityLevel(e),
  likes: e.likes,
});

const employeeTokens = digitalEmployees
  .map(mapEmployeeUsageMetrics)
  .sort((a, b) => b.used - a.used);

const efficiencyData = [
  { month: '2025-10', tasks: 2800, quality: 88, calls: 15200 },
  { month: '2025-11', tasks: 3200, quality: 90, calls: 18500 },
  { month: '2025-12', tasks: 3800, quality: 91, calls: 21000 },
  { month: '2026-01', tasks: 4200, quality: 93, calls: 24800 },
  { month: '2026-02', tasks: 4600, quality: 94, calls: 27600 },
  { month: '2026-03', tasks: 4100, quality: 95, calls: 25200 },
];

type DeptRow = (typeof departmentUsage)[0];

const getDeptActiveRate = (r: DeptRow) => Math.min(99, Math.round((r.users / 120) * 100));
const getDeptTokens = (r: DeptRow) => Math.round(r.tasks * 1.5);

/** 按统计区间天数缩放部门指标（mock 口径：以 30 天为基准） */
const scaleDeptRowsByRange = (rows: DeptRow[], range: RangeValue): DeptRow[] => {
  const start = range?.[0] ?? dayjs().subtract(30, 'day');
  const end = range?.[1] ?? dayjs();
  const days = Math.max(1, end.diff(start, 'day') + 1);
  const factor = Math.min(2, Math.max(0.15, days / 30));
  return rows.map((d) => ({
    ...d,
    users: Math.max(1, Math.round(d.users * factor)),
    sessions: Math.max(1, Math.round(d.sessions * factor)),
    tasks: Math.max(1, Math.round(d.tasks * factor)),
  }));
};

type KpiStat = { label: string; value: string | number };

type KpiItem = {
  label: string;
  value: string | number;
  accent: string;
  icon: ReactNode;
  meta?: ReactNode;
  metaClass?: string;
  /** 主数值右侧并列（如输入/输出） */
  sideStats?: KpiStat[];
  /** 底部窗口统计（如近7天 / 近30天） */
  stats?: KpiStat[];
  tinted?: boolean;
  /** 二次计算口径说明 */
  tip?: string;
};

const KpiCard: React.FC<KpiItem> = ({
  label, value, accent, icon, meta, metaClass, sideStats, stats, tinted, tip,
}) => (
  <div
    className={`dash-kpi${tinted ? ' tinted' : ''}${stats?.length || sideStats?.length ? ' has-stats' : ''}${sideStats?.length ? ' has-side' : ''}`}
    style={{ ['--kpi-accent' as string]: accent }}
  >
    <div className="dash-kpi-top">
      <div className="dash-kpi-label">
        <MetricLabel tip={tip}>{label}</MetricLabel>
      </div>
      <div className="dash-kpi-icon">{icon}</div>
    </div>
    <div>
      <div className="dash-kpi-main">
        <div className="dash-kpi-main-left">
          <div className="dash-kpi-value">{value}</div>
          <div className={`dash-kpi-meta ${metaClass ?? ''}`}>{meta ?? '\u00A0'}</div>
        </div>
        {sideStats?.length ? (
          <div className="dash-kpi-side">
            {sideStats.map((s) => (
              <div key={s.label} className="dash-kpi-stat">
                <span className="dash-kpi-stat-label">{s.label}</span>
                <strong className="dash-kpi-stat-value">{s.value}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {stats?.length ? (
        <div className="dash-kpi-stats">
          {stats.map((s) => (
            <div key={s.label} className="dash-kpi-stat">
              <span className="dash-kpi-stat-label">{s.label}</span>
              <strong className="dash-kpi-stat-value">{s.value}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);

const BenefitInsightsSection: React.FC = () => (
  <section className="dash-section">
    <div className="dash-section-head">
      <strong>效益洞察</strong>
      <span>配额消耗 · 结余 · 降本增效</span>
    </div>
    <div className="dash-insight-row">
      <div className="dash-insight">
        <div>
          <div className="dash-insight-label">
            <MetricLabel tip={METRIC_TIPS.monthConsume}>本月总消耗</MetricLabel>
          </div>
          <div className="dash-insight-value">152.8M</div>
        </div>
        <div className="dash-ring-wrap">
          <div className="dash-ring" style={{ ['--ring-pct' as string]: 76, ['--ring-color' as string]: '#fa8c16' }} />
          <span className="dash-ring-label">76%</span>
        </div>
        <div className="dash-insight-meta up"><ArrowDownOutlined /> 较上月 -5.2%</div>
        <div
          className="dash-insight-bar"
          style={{ ['--bar-w' as string]: '76%', ['--bar-from' as string]: '#ffc069', ['--bar-to' as string]: '#fa8c16' }}
        >
          <i />
        </div>
      </div>
      <div className="dash-insight">
        <div>
          <div className="dash-insight-label">
            <MetricLabel tip={METRIC_TIPS.monthRemain}>预计月度结余</MetricLabel>
          </div>
          <div className="dash-insight-value">47.2M</div>
        </div>
        <div className="dash-ring-wrap">
          <div className="dash-ring" style={{ ['--ring-pct' as string]: 24, ['--ring-color' as string]: '#52c41a' }} />
          <span className="dash-ring-label">24%</span>
        </div>
        <div className="dash-insight-meta">配额内健康</div>
        <div
          className="dash-insight-bar"
          style={{ ['--bar-w' as string]: '24%', ['--bar-from' as string]: '#95de64', ['--bar-to' as string]: '#52c41a' }}
        >
          <i />
        </div>
      </div>
      <div className="dash-insight">
        <div>
          <div className="dash-insight-label">
            <MetricLabel tip={METRIC_TIPS.savedHours}>本月节省工时</MetricLabel>
          </div>
          <div className="dash-insight-value">
            {efficiencyReport.savedHours}<span>h</span>
          </div>
        </div>
        <div className="dash-ring-wrap">
          <div className="dash-ring" style={{ ['--ring-pct' as string]: 88, ['--ring-color' as string]: '#1677ff' }} />
          <span className="dash-ring-label">88%</span>
        </div>
        <div className="dash-insight-meta">
          <MetricLabel tip={METRIC_TIPS.roi}>ROI {efficiencyReport.roi}</MetricLabel>
          {' · '}
          <MetricLabel tip={METRIC_TIPS.costReduction}>-{efficiencyReport.costReduction}%</MetricLabel>
        </div>
        <div
          className="dash-insight-bar"
          style={{ ['--bar-w' as string]: '88%', ['--bar-from' as string]: '#69b1ff', ['--bar-to' as string]: '#1677ff' }}
        >
          <i />
        </div>
      </div>
    </div>
  </section>
);

const EfficiencyStatsSection: React.FC = () => (
  <Row gutter={10}>
    <Col span={16}>
      <Card className="dash-panel" title="效能趋势">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={efficiencyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="tasks" name="任务完成量" stroke="#1677ff" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="quality" name="完成质量(%)" stroke="#52c41a" strokeWidth={2} dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="calls" name="智能体调用" stroke="#722ed1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </Col>
    <Col span={8}>
      <Card className="dash-panel" title="降本增效分析报告">
        <div style={{ padding: '2px 0 6px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 2 }}>
              <MetricLabel tip={METRIC_TIPS.savedHours}>本月节省人力工时</MetricLabel>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>
              {efficiencyReport.savedHours} <span style={{ fontSize: 13, fontWeight: 400 }}>小时</span>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 2 }}>
              <MetricLabel tip={METRIC_TIPS.costReduction}>平均单次任务成本降低</MetricLabel>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>
              {efficiencyReport.costReduction}%
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 2 }}>
              <MetricLabel tip={METRIC_TIPS.roi}>ROI (投入产出比)</MetricLabel>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {efficiencyReport.roi}
            </div>
          </div>
          <Button type="primary" icon={<DownloadOutlined />} block size="middle">
            下载详细效益报告
          </Button>
        </div>
      </Card>
    </Col>
  </Row>
);

type TokenTrendRow = { date: string; input: number; output: number; total: number };
type UserUsageRow = { date: string; users: number; sessions: number; tasks: number };
type TrendGranularity = 'day' | 'week' | 'month';

const TREND_ANCHOR = dayjs('2026-03-12');

const trendRangePresets: { label: string; value: [Dayjs, Dayjs] }[] = [
  { label: '近7天', value: [TREND_ANCHOR.subtract(6, 'day'), TREND_ANCHOR] },
  { label: '近30天', value: [TREND_ANCHOR.subtract(29, 'day'), TREND_ANCHOR] },
  { label: '近3个月', value: [TREND_ANCHOR.subtract(3, 'month'), TREND_ANCHOR] },
  { label: '近6个月', value: [TREND_ANCHOR.subtract(5, 'month').startOf('month'), TREND_ANCHOR] },
  { label: '本年', value: [TREND_ANCHOR.startOf('year'), TREND_ANCHOR] },
];

const defaultTrendRange: [Dayjs, Dayjs] = [
  TREND_ANCHOR.subtract(5, 'month').startOf('month'),
  TREND_ANCHOR,
];

const parseTrendDate = (date: string): Dayjs => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return dayjs(date);
  if (/^\d{4}-\d{2}$/.test(date)) return dayjs(`${date}-01`);
  return dayjs(`${TREND_ANCHOR.year()}-${date}`);
};

const getTrendBucket = (d: Dayjs, granularity: TrendGranularity) => {
  if (granularity === 'month') {
    return { key: d.format('YYYY-MM'), label: d.format('YYYY-MM') };
  }
  if (granularity === 'week') {
    const start = d.startOf('week');
    const end = d.endOf('week');
    return {
      key: start.format('YYYY-MM-DD'),
      label: `${start.format('MM-DD')}~${end.format('MM-DD')}`,
    };
  }
  return { key: d.format('YYYY-MM-DD'), label: d.format('MM-DD') };
};

const filterTrendByRange = <T extends { date: string }>(rows: T[], range: RangeValue): T[] => {
  if (!range?.[0] || !range?.[1]) return rows;
  const start = range[0].startOf('day');
  const end = range[1].endOf('day');
  return rows.filter((row) => {
    const d = parseTrendDate(row.date);
    return !d.isBefore(start) && !d.isAfter(end);
  });
};

const aggregateTokenRows = (rows: TokenTrendRow[], granularity: TrendGranularity): TokenTrendRow[] => {
  const buckets = new Map<string, TokenTrendRow & { sortKey: string }>();
  rows.forEach((row) => {
    const { key, label } = getTrendBucket(parseTrendDate(row.date), granularity);
    const prev = buckets.get(key);
    if (prev) {
      prev.input += row.input;
      prev.output += row.output;
      prev.total += row.total;
      return;
    }
    buckets.set(key, { date: label, input: row.input, output: row.output, total: row.total, sortKey: key });
  });
  return [...buckets.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey: _sortKey, ...row }) => row);
};

const aggregateUserUsageRows = (rows: UserUsageRow[], granularity: TrendGranularity): UserUsageRow[] => {
  const buckets = new Map<string, UserUsageRow & { sortKey: string }>();
  rows.forEach((row) => {
    const { key, label } = getTrendBucket(parseTrendDate(row.date), granularity);
    const prev = buckets.get(key);
    if (prev) {
      prev.users += row.users;
      prev.sessions += row.sessions;
      prev.tasks += row.tasks;
      return;
    }
    buckets.set(key, {
      date: label,
      users: row.users,
      sessions: row.sessions,
      tasks: row.tasks,
      sortKey: key,
    });
  });
  return [...buckets.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey: _sortKey, ...row }) => row);
};

const generateDailyTokenTrend = (days: number): TokenTrendRow[] =>
  Array.from({ length: days }, (_, i) => {
    const d = TREND_ANCHOR.subtract(days - 1 - i, 'day');
    const wave = Math.sin(i / 6) * 3500;
    const total = Math.round(19000 + wave + (i % 11) * 420);
    const input = Math.round(total * 0.68);
    const output = total - input;
    return { date: d.format('YYYY-MM-DD'), input, output, total };
  });

const generateDailyUserUsageTrend = (days: number): UserUsageRow[] =>
  Array.from({ length: days }, (_, i) => {
    const d = TREND_ANCHOR.subtract(days - 1 - i, 'day');
    const wave = Math.sin(i / 5) * 40;
    const users = Math.round(300 + wave + (i % 7) * 8);
    const sessions = Math.round(users * 5.2 + (i % 9) * 30);
    const tasks = Math.round(sessions * 0.58);
    return { date: d.format('YYYY-MM-DD'), users, sessions, tasks };
  });

const tokensDailyTrend = generateDailyTokenTrend(180);
const userUsageDailyTrend = generateDailyUserUsageTrend(180);

const granularityOptions = [
  { label: '按天', value: 'day' as const },
  { label: '按周', value: 'week' as const },
  { label: '按月', value: 'month' as const },
];

const TrendChartFilters: React.FC<{
  range: RangeValue;
  onRangeChange: (value: RangeValue) => void;
  granularity: TrendGranularity;
  onGranularityChange: (value: TrendGranularity) => void;
}> = ({ range, onRangeChange, granularity, onGranularityChange }) => (
  <div className="dash-trend-modal-filters">
    <RangePicker
      value={range}
      presets={trendRangePresets}
      allowClear={false}
      onChange={onRangeChange}
    />
    <Segmented
      size="small"
      options={granularityOptions}
      value={granularity}
      onChange={(value) => onGranularityChange(value as TrendGranularity)}
    />
  </div>
);

const TokensTrendChart: React.FC<{ data: TokenTrendRow[] }> = ({ data }) => {
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  const toggleSeries = (dataKey: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={3} barCategoryGap="22%" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="date" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(22,119,255,0.04)' }} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 11, cursor: 'pointer' }}
          onClick={(entry) => toggleSeries(String(entry.dataKey ?? ''))}
          formatter={(value, entry) => (
            <span style={{ color: hiddenKeys.has(String(entry.dataKey)) ? '#bfbfbf' : 'inherit' }}>
              {value}
            </span>
          )}
        />
        <Bar dataKey="input" name="输入 Tokens" fill="#1677ff" radius={[4, 4, 0, 0]} maxBarSize={20} hide={hiddenKeys.has('input')} />
        <Bar dataKey="output" name="输出 Tokens" fill="#52c41a" radius={[4, 4, 0, 0]} maxBarSize={20} hide={hiddenKeys.has('output')} />
        <Bar dataKey="total" name="总量" fill="#fa8c16" radius={[4, 4, 0, 0]} maxBarSize={20} hide={hiddenKeys.has('total')} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const UserUsageTrendChart: React.FC<{ data: UserUsageRow[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} barGap={3} barCategoryGap="22%" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
      <XAxis dataKey="date" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(22,119,255,0.04)' }} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      <Bar dataKey="users" name="用户数" fill="#1677ff" radius={[4, 4, 0, 0]} maxBarSize={18} />
      <Bar dataKey="sessions" name="会话数" fill="#52c41a" radius={[4, 4, 0, 0]} maxBarSize={18} />
      <Bar dataKey="tasks" name="任务数" fill="#fa8c16" radius={[4, 4, 0, 0]} maxBarSize={18} />
    </BarChart>
  </ResponsiveContainer>
);

type EmployeeTokenRow = (typeof employeeTokens)[0];

const topEmployeeTokens = employeeTokens.slice(0, 8);
const topDepartmentUsage = [...departmentUsage]
  .sort((a, b) => b.tasks - a.tasks)
  .slice(0, 8);

const getEmployeeTokensPreviewColumns = (rows: EmployeeTokenRow[]) => [
  {
    title: '排名',
    key: 'rank',
    width: 52,
    render: (_: unknown, record: EmployeeTokenRow) => {
      const idx = rows.findIndex((e) => e.id === record.id);
      return (
        <span className={`dash-rank-badge ${idx < 3 ? 'top' : 'rest'}`}>{idx + 1}</span>
      );
    },
  },
  { title: '员工', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '部门', dataIndex: 'department', key: 'department', ellipsis: true, width: 100 },
  {
    title: '已用',
    dataIndex: 'used',
    key: 'used',
    width: 72,
    render: (v: number) => `${v.toFixed(1)}M`,
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.tokenUsageRate}>消耗率</MetricLabel>,
    dataIndex: 'rate',
    key: 'rate',
    width: 88,
    render: (v: number) => <Tag color={v > 80 ? 'red' : v > 50 ? 'orange' : 'green'}>{v}%</Tag>,
  },
];

const getDepartmentRankColumns = (rows: DeptRow[]) => [
  {
    title: '排名',
    key: 'rank',
    width: 52,
    render: (_: unknown, record: DeptRow) => {
      const idx = rows.findIndex((d) => d.department === record.department);
      return (
        <span className={`dash-rank-badge ${idx < 3 ? 'top' : 'rest'}`}>{idx + 1}</span>
      );
    },
  },
  { title: '部门', dataIndex: 'department', key: 'department', ellipsis: true },
  {
    title: <MetricLabel tip={METRIC_TIPS.deptUserCount}>用户数</MetricLabel>,
    dataIndex: 'users',
    key: 'users',
    width: 72,
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.deptTaskCount}>任务数</MetricLabel>,
    dataIndex: 'tasks',
    key: 'tasks',
    width: 72,
    render: (v: number) => v.toLocaleString(),
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.deptActiveRate}>活跃率</MetricLabel>,
    key: 'activeRate',
    width: 100,
    render: (_: unknown, r: DeptRow) => {
      const rate = getDeptActiveRate(r);
      const tone = rate >= 80 ? 'high' : rate >= 50 ? 'mid' : 'low';
      return (
        <div className={`dept-rate dept-rate--${tone}`}>
          <div className="dept-rate-track">
            <i style={{ width: `${rate}%` }} />
          </div>
          <span>{rate}%</span>
        </div>
      );
    },
  },
];

const getEmployeeTokensColumns = (rows: EmployeeTokenRow[]) => [
  {
    title: '排名',
    key: 'rank',
    width: 56,
    fixed: 'left' as const,
    render: (_: unknown, record: EmployeeTokenRow) => {
      const idx = rows.findIndex((e) => e.id === record.id);
      return (
        <span className={`dash-rank-badge ${idx < 3 ? 'top' : 'rest'}`}>{idx + 1}</span>
      );
    },
  },
  { title: '员工', dataIndex: 'name', key: 'name', ellipsis: true, width: 120, fixed: 'left' as const },
  { title: '部门', dataIndex: 'department', key: 'department', ellipsis: true, width: 110 },
  { title: '所属条线', dataIndex: 'line', key: 'line', width: 80 },
  {
    title: '级别',
    key: 'capLevel',
    width: 88,
    render: (_: unknown, r: EmployeeTokenRow) => <CapabilityLevelTag level={r.capLevel} />,
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.empUserCount}>用户数</MetricLabel>,
    dataIndex: 'userCount',
    key: 'userCount',
    width: 80,
    sorter: (a: EmployeeTokenRow, b: EmployeeTokenRow) => a.userCount - b.userCount,
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.empSessionCount}>会话数</MetricLabel>,
    dataIndex: 'sessionCount',
    key: 'sessionCount',
    width: 88,
    sorter: (a: EmployeeTokenRow, b: EmployeeTokenRow) => a.sessionCount - b.sessionCount,
    render: (v: number) => v.toLocaleString(),
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.empTaskCount}>定时任务数</MetricLabel>,
    dataIndex: 'taskCount',
    key: 'taskCount',
    width: 80,
    sorter: (a: EmployeeTokenRow, b: EmployeeTokenRow) => a.taskCount - b.taskCount,
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.empTaskRate}>完成率</MetricLabel>,
    dataIndex: 'taskCompleteRate',
    key: 'taskCompleteRate',
    width: 88,
    sorter: (a: EmployeeTokenRow, b: EmployeeTokenRow) => a.taskCompleteRate - b.taskCompleteRate,
    render: (v: number) => `${v}%`,
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.empQuality}>质量</MetricLabel>,
    dataIndex: 'qualityScore',
    key: 'qualityScore',
    width: 72,
    sorter: (a: EmployeeTokenRow, b: EmployeeTokenRow) => a.qualityScore - b.qualityScore,
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.empAgentCalls}>调用</MetricLabel>,
    dataIndex: 'agentCalls',
    key: 'agentCalls',
    width: 80,
    sorter: (a: EmployeeTokenRow, b: EmployeeTokenRow) => a.agentCalls - b.agentCalls,
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.empTokens}>已用</MetricLabel>,
    dataIndex: 'used',
    key: 'used',
    width: 80,
    sorter: (a: EmployeeTokenRow, b: EmployeeTokenRow) => a.used - b.used,
    defaultSortOrder: 'descend' as const,
    render: (v: number) => `${v.toFixed(1)}M`,
  },
  {
    title: '配额',
    dataIndex: 'quota',
    key: 'quota',
    width: 80,
    render: (v: number) => `${v.toFixed(1)}M`,
  },
  {
    title: <MetricLabel tip={METRIC_TIPS.tokenUsageRate}>消耗率</MetricLabel>,
    dataIndex: 'rate',
    key: 'rate',
    width: 88,
    sorter: (a: EmployeeTokenRow, b: EmployeeTokenRow) => a.rate - b.rate,
    render: (v: number) => <Tag color={v > 80 ? 'red' : v > 50 ? 'orange' : 'green'}>{v}%</Tag>,
  },
  {
    title: '点赞',
    dataIndex: 'likes',
    key: 'likes',
    width: 72,
    sorter: (a: EmployeeTokenRow, b: EmployeeTokenRow) => a.likes - b.likes,
  },
];

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<RangeValue>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [showDeptDetail, setShowDeptDetail] = useState(false);
  const [showEmployeeTokensDetail, setShowEmployeeTokensDetail] = useState(false);
  const [deptKeyword, setDeptKeyword] = useState('');
  const [deptRange, setDeptRange] = useState<RangeValue>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [empKeyword, setEmpKeyword] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState<string | undefined>();
  const [empLineFilter, setEmpLineFilter] = useState<string | undefined>();
  const [empLevelFilter, setEmpLevelFilter] = useState<string | undefined>();
  const [trendModal, setTrendModal] = useState<'tokens' | 'users' | null>(null);
  const [tokensTrendRange, setTokensTrendRange] = useState<RangeValue>(defaultTrendRange);
  const [tokensGranularity, setTokensGranularity] = useState<TrendGranularity>('month');
  const [usersTrendRange, setUsersTrendRange] = useState<RangeValue>(defaultTrendRange);
  const [usersGranularity, setUsersGranularity] = useState<TrendGranularity>('month');

  const tokensModalData = useMemo(
    () => aggregateTokenRows(filterTrendByRange(tokensDailyTrend, tokensTrendRange), tokensGranularity),
    [tokensTrendRange, tokensGranularity],
  );

  const usersModalData = useMemo(
    () => aggregateUserUsageRows(filterTrendByRange(userUsageDailyTrend, usersTrendRange), usersGranularity),
    [usersTrendRange, usersGranularity],
  );

  const levelDistribution = getCapabilityLevelDistribution();
  const levelTotal = levelDistribution.reduce((s, x) => s + x.value, 0);
  const lineDistribution = getBusinessLineDistribution();
  const lineTotal = lineDistribution.reduce((s, x) => s + x.value, 0);

  const activeCount = digitalEmployees.filter((e) => e.status === 'ACTIVE').length;
  const trainingCount = digitalEmployees.filter((e) => e.status === 'TRAINING').length;

  const healthSpark = tokensWeekly.map((d, i) => ({
    idx: i,
    v: Math.round(88 + (d.total / 26000) * 10),
  }));

  const highlightKpis: KpiItem[] = [
    {
      label: '数字员工总数',
      value: dashboardStats.totalEmployees.toLocaleString(),
      accent: '#1677ff',
      icon: <TeamOutlined />,
      meta: <><ArrowUpOutlined /> 较上月 {dashboardStats.monthNewPercent}%</>,
      metaClass: 'up',
      tip: METRIC_TIPS.newEmployeesWindow,
      stats: [
        { label: '近7天上新', value: dashboardStats.newEmployees7d },
        { label: '近30天上新', value: dashboardStats.newEmployees30d },
      ],
    },
    {
      label: 'Tokens 消耗',
      value: dashboardStats.todayTokens,
      accent: '#fa8c16',
      icon: <ThunderboltOutlined />,
      meta: <>统计周期内累计</>,
      tip: METRIC_TIPS.tokensWindow,
      sideStats: [
        { label: '输入 Tokens', value: dashboardStats.tokensInput },
        { label: '输出 Tokens', value: dashboardStats.tokensOutput },
      ],
      stats: [
        { label: '近7天消耗', value: dashboardStats.tokens7d },
        { label: '近30天消耗', value: dashboardStats.tokens30d },
      ],
    },
  ];

  const stripKpis: KpiItem[] = [
    {
      label: '平均任务完成率',
      value: `${dashboardStats.avgTaskRate}%`,
      accent: '#52c41a',
      icon: <CheckCircleOutlined />,
      meta: <>效能评级 {dashboardStats.efficiencyGrade}</>,
      metaClass: 'up',
      tip: METRIC_TIPS.avgTaskRate,
    },
    {
      label: '用户总数',
      value: dashboardStats.totalUsers.toLocaleString(),
      accent: '#1677ff',
      icon: <UserOutlined />,
      meta: <>使用数字员工的用户</>,
    },
    {
      label: '活跃用户',
      value: dashboardStats.todayActiveUsers.toLocaleString(),
      accent: '#eb2f96',
      icon: <FireOutlined />,
      meta: <>当日活跃</>,
      tip: METRIC_TIPS.activeUsers,
    },
    {
      label: '会话数',
      value: dashboardStats.todaySessionCount.toLocaleString(),
      accent: '#13c2c2',
      icon: <DashboardOutlined />,
      meta: (
        <>
          均响 {dashboardStats.avgResponseTime}
          {' · '}
          平均耗时 {dashboardStats.avgSessionDuration}
        </>
      ),
      tip: METRIC_TIPS.sessionTiming,
    },
  ];

  if (showDeptDetail) {
    const keyword = deptKeyword.trim().toLowerCase();
    const rangedDepts = scaleDeptRowsByRange(departmentUsage, deptRange);
    const filteredDepts = rangedDepts.filter((d) =>
      !keyword || d.department.toLowerCase().includes(keyword),
    );
    const sortedDepts = [...filteredDepts].sort((a, b) => b.tasks - a.tasks);
    const deptTotals = sortedDepts.reduce(
      (acc, d) => ({
        users: acc.users + d.users,
        sessions: acc.sessions + d.sessions,
        tasks: acc.tasks + d.tasks,
      }),
      { users: 0, sessions: 0, tasks: 0 },
    );
    const avgActiveRate = sortedDepts.length
      ? Math.round(sortedDepts.reduce((s, d) => s + getDeptActiveRate(d), 0) / sortedDepts.length)
      : 0;
    const rangeLabel = deptRange?.[0] && deptRange?.[1]
      ? `${deptRange[0].format('YYYY-MM-DD')} ~ ${deptRange[1].format('YYYY-MM-DD')}`
      : '全部周期';

    const exportDeptCsv = () => {
      const headers = ['排名', '部门', '用户数', '会话数', '任务数', 'Tokens(万)', '活跃率(%)', '统计区间'];
      const rows = sortedDepts.map((r, i) => [
        i + 1,
        r.department,
        r.users,
        r.sessions,
        r.tasks,
        getDeptTokens(r),
        getDeptActiveRate(r),
        rangeLabel,
      ]);
      const escape = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;
      const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')}`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `部门使用明细_${dayjs().format('YYYYMMDD_HHmm')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      message.success(`已导出 ${sortedDepts.length} 条部门明细`);
    };

    const deptDetailColumns = [
      {
        title: '排名',
        key: 'rank',
        width: 56,
        render: (_: unknown, record: DeptRow) => {
          const idx = sortedDepts.findIndex((d) => d.department === record.department);
          return (
            <span className={`dash-rank-badge ${idx < 3 ? 'top' : 'rest'}`}>{idx + 1}</span>
          );
        },
      },
      { title: '部门', dataIndex: 'department', key: 'department', width: 140 },
      {
        title: <MetricLabel tip={METRIC_TIPS.deptUserCount}>用户数</MetricLabel>,
        dataIndex: 'users',
        key: 'users',
        width: 90,
        sorter: (a: DeptRow, b: DeptRow) => a.users - b.users,
      },
      {
        title: <MetricLabel tip={METRIC_TIPS.deptSessionCount}>会话数</MetricLabel>,
        dataIndex: 'sessions',
        key: 'sessions',
        width: 90,
        sorter: (a: DeptRow, b: DeptRow) => a.sessions - b.sessions,
        render: (v: number) => v.toLocaleString(),
      },
      {
        title: <MetricLabel tip={METRIC_TIPS.deptTaskCount}>任务数</MetricLabel>,
        dataIndex: 'tasks',
        key: 'tasks',
        width: 90,
        defaultSortOrder: 'descend' as const,
        sorter: (a: DeptRow, b: DeptRow) => a.tasks - b.tasks,
        render: (v: number) => v.toLocaleString(),
      },
      {
        title: (
          <MetricLabel tip={METRIC_TIPS.deptTokens}>Tokens 消耗</MetricLabel>
        ),
        key: 'tokens',
        width: 110,
        sorter: (a: DeptRow, b: DeptRow) => getDeptTokens(a) - getDeptTokens(b),
        render: (_: unknown, r: DeptRow) => (
          <span className="dept-tokens">{getDeptTokens(r)}<em>万</em></span>
        ),
      },
      {
        title: (
          <MetricLabel tip={METRIC_TIPS.deptActiveRate}>活跃率</MetricLabel>
        ),
        key: 'activeRate',
        width: 160,
        sorter: (a: DeptRow, b: DeptRow) => getDeptActiveRate(a) - getDeptActiveRate(b),
        render: (_: unknown, r: DeptRow) => {
          const rate = getDeptActiveRate(r);
          const tone = rate >= 80 ? 'high' : rate >= 50 ? 'mid' : 'low';
          return (
            <div className={`dept-rate dept-rate--${tone}`}>
              <div className="dept-rate-track">
                <i style={{ width: `${rate}%` }} />
              </div>
              <span>{rate}%</span>
            </div>
          );
        },
      },
    ];

    return (
      <div className="dash">
        <div className="dash-toolbar">
          <div>
            <h2>部门使用详情</h2>
            <p>各部门活跃用户、会话与任务消耗一览</p>
          </div>
          <div className="dash-toolbar-actions">
            <Button icon={<ArrowLeftOutlined />} onClick={() => setShowDeptDetail(false)}>
              返回驾驶舱
            </Button>
          </div>
        </div>

        <div className="dash-kpi-strip">
          <KpiCard
            label="覆盖部门"
            value={sortedDepts.length}
            accent="#1677ff"
            icon={<TeamOutlined />}
            meta={<>筛选后 · 共 {rangedDepts.length} 个部门</>}
          />
          <KpiCard
            label="使用用户"
            value={deptTotals.users.toLocaleString()}
            accent="#eb2f96"
            icon={<UserOutlined />}
            meta={<>各部门合计</>}
          />
          <KpiCard
            label="会话 / 任务"
            value={`${(deptTotals.sessions / 1000).toFixed(1)}k`}
            accent="#13c2c2"
            icon={<DashboardOutlined />}
            meta={<>任务 {deptTotals.tasks.toLocaleString()}</>}
          />
          <KpiCard
            label="平均活跃率"
            value={`${avgActiveRate}%`}
            accent="#52c41a"
            icon={<FireOutlined />}
            meta={<>部门均值</>}
            metaClass="up"
            tip={METRIC_TIPS.avgDeptActiveRate}
          />
        </div>

        <section className="dash-section">
          <div className="dash-section-head dept-detail-head">
            <div>
              <strong>部门使用明细</strong>
              <span>支持搜索、时间筛选、排序与导出</span>
            </div>
            <Space wrap className="dept-detail-filters" size={8}>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="搜索部门名称"
                value={deptKeyword}
                onChange={(e) => setDeptKeyword(e.target.value)}
                style={{ width: 180 }}
              />
              <RangePicker
                value={deptRange}
                onChange={(v) => setDeptRange(v)}
                presets={presets}
                allowClear={false}
              />
              <Button type="primary" icon={<DownloadOutlined />} onClick={exportDeptCsv}>
                导出
              </Button>
            </Space>
          </div>
          <Card className="dash-panel">
            <Table
              className="dept-detail-table"
              dataSource={sortedDepts}
              columns={deptDetailColumns}
              rowKey="department"
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: [5, 10, 20],
                showTotal: (total) => `共 ${total} 条`,
              }}
              size="small"
              locale={{ emptyText: keyword ? `未找到包含「${deptKeyword.trim()}」的部门` : '暂无数据' }}
            />
          </Card>
        </section>
      </div>
    );
  }

  if (showEmployeeTokensDetail) {
    const keyword = empKeyword.trim().toLowerCase();
    const filteredEmployeeTokens = employeeTokens.filter((e) => {
      if (empDeptFilter && e.department !== empDeptFilter) return false;
      if (empLineFilter && e.line !== empLineFilter) return false;
      if (empLevelFilter && e.capLevel !== empLevelFilter) return false;
      if (keyword) {
        const haystack = `${e.name} ${e.department} ${e.line}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
    const empDepartmentOptions = [...new Set(employeeTokens.map((e) => e.department))].sort();

    const exportEmployeeTokensCsv = () => {
      const headers = [
        '排名', '员工', '部门', '所属条线', '级别', '用户数', '会话数', '定时任务数',
        '完成率(%)', '质量', '调用', '已用(M)', '配额(M)', '消耗率(%)', '点赞',
      ];
      const rows = filteredEmployeeTokens.map((r, i) => [
        i + 1,
        r.name,
        r.department,
        r.line,
        r.capLevel,
        r.userCount,
        r.sessionCount,
        r.taskCount,
        r.taskCompleteRate,
        r.qualityScore,
        r.agentCalls,
        r.used.toFixed(1),
        r.quota.toFixed(1),
        r.rate,
        r.likes,
      ]);
      const escape = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;
      const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')}`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `员工消耗明细_${dayjs().format('YYYYMMDD_HHmm')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      message.success(`已导出 ${filteredEmployeeTokens.length} 条员工明细`);
    };

    return (
      <div className="dash">
        <div className="dash-toolbar">
          <div>
            <h2>按员工 Tokens 消耗</h2>
            <p>配额消耗效益、效能统计与员工明细对照</p>
          </div>
          <div className="dash-toolbar-actions">
            <Button icon={<ArrowLeftOutlined />} onClick={() => setShowEmployeeTokensDetail(false)}>
              返回驾驶舱
            </Button>
          </div>
        </div>

        <BenefitInsightsSection />

        <section className="dash-section">
          <div className="dash-section-head">
            <strong>效能统计</strong>
            <span>趋势分析与降本增效报告</span>
          </div>
          <EfficiencyStatsSection />
        </section>

        <section className="dash-section">
          <div className="dash-section-head dept-detail-head">
            <div>
              <strong>员工消耗明细</strong>
              <span>支持搜索、筛选、排序与导出</span>
            </div>
            <Space wrap className="dept-detail-filters" size={8}>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="搜索员工/部门/条线"
                value={empKeyword}
                onChange={(e) => setEmpKeyword(e.target.value)}
                style={{ width: 168 }}
              />
              <Select
                allowClear
                placeholder="部门"
                value={empDeptFilter}
                onChange={setEmpDeptFilter}
                style={{ width: 128 }}
                options={empDepartmentOptions.map((d) => ({ label: d, value: d }))}
              />
              <Select
                allowClear
                placeholder="所属条线"
                value={empLineFilter}
                onChange={setEmpLineFilter}
                style={{ width: 112 }}
                options={BUSINESS_LINES.map((l) => ({ label: l, value: l }))}
              />
              <Select
                allowClear
                placeholder="级别"
                value={empLevelFilter}
                onChange={setEmpLevelFilter}
                style={{ width: 100 }}
                options={CAPABILITY_LEVELS.map((l) => ({ label: l, value: l }))}
              />
              <Button type="primary" icon={<DownloadOutlined />} onClick={exportEmployeeTokensCsv}>
                导出
              </Button>
            </Space>
          </div>
          <Card className="dash-panel">
            <Table
              className="dash-ranking-table"
              size="small"
              dataSource={filteredEmployeeTokens}
              rowKey="id"
              scroll={{ x: 1280 }}
              columns={getEmployeeTokensColumns(filteredEmployeeTokens)}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                showTotal: (t) => `共 ${t} 条`,
              }}
              locale={{
                emptyText: keyword || empDeptFilter || empLineFilter || empLevelFilter
                  ? '未找到符合条件的员工'
                  : '暂无数据',
              }}
            />
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="dash-toolbar">
        <div>
          <h2>运营驾驶舱</h2>
          <p>健康一瞥 · 消耗总览 · 使用效能 · 运营动态</p>
        </div>
        <div className="dash-toolbar-actions">
          <RangePicker
            size="small"
            value={dateRange}
            onChange={(val) => setDateRange(val)}
            presets={presets}
            allowClear={false}
          />
        </div>
      </div>

      {/* ① 一瞥层：健康主卡 + 主指标三件套 */}
      <div className="dash-hero">
        <div className="dash-hero-health">
          <div className="dash-hero-glow" />
          <div className="dash-hero-health-body">
            <div className="dash-hero-health-label">
              <HeartOutlined />
              <MetricLabel tip={HEALTH_SCORE_TIP} light>系统运行健康度</MetricLabel>
            </div>
            <div className="dash-hero-health-value">
              {dashboardStats.healthScore}<em>%</em>
            </div>
            <div className="dash-hero-health-change">
              <ArrowUpOutlined /> 较昨日 {dashboardStats.healthChange} · 状态良好
            </div>
            <div className="dash-hero-pills">
              <span className="dash-hero-pill">
                <i className="dot online" /> 在线 {activeCount}
              </span>
              <span className="dash-hero-pill">
                <i className="dot training" /> 训练中 {trainingCount}
              </span>
              <span className="dash-hero-pill">
                <i className="dot alert" /> 预警 3
              </span>
            </div>
          </div>
          <div className="dash-hero-spark">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthSpark} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.9)" strokeWidth={2} fill="url(#heroSpark)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-hero-kpis">
          {highlightKpis.map((item) => (
            <KpiCard key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* 次级指标紧凑横排 */}
      <div className="dash-kpi-strip">
        {stripKpis.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </div>

      {/* ② 消耗总览：条线 ‖ 级别（等高定高，避免留白） */}
      <section className="dash-section">
        <div className="dash-section-head">
          <strong>消耗总览</strong>
          <span>条线结构与级别结构并列对比</span>
        </div>
        <div className="dash-dual even dash-overview-pies">
          <Card className="dash-panel" title={<MetricLabel tip={METRIC_TIPS.lineShare}>条线分布</MetricLabel>}>
            <div className="dash-pie-pane dash-pie-pane--line">
              <div className="dash-pie-wrap dash-pie-wrap--lg">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lineDistribution.filter((l) => l.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={82}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {lineDistribution.filter((l) => l.value > 0).map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dash-pie-center">
                  <strong>{lineTotal}</strong>
                  <span>合计</span>
                </div>
              </div>
              <div className="dash-legend dash-legend--grid">
                {lineDistribution.map((l) => {
                  const pct = lineTotal ? Math.round((l.value / lineTotal) * 100) : 0;
                  return (
                    <div key={l.name} className={`dash-legend-item${l.value === 0 ? ' muted' : ''}`}>
                      <span className="dash-legend-dot" style={{ background: l.color }} />
                      {l.name} {l.value} · {pct}%
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="dash-panel" title={<MetricLabel tip={METRIC_TIPS.levelShare}>级别分布</MetricLabel>}>
            <div className="dash-pie-pane dash-pie-pane--line">
              <div className="dash-pie-wrap dash-pie-wrap--lg">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={levelDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={82}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {levelDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dash-pie-center">
                  <strong>{levelTotal}</strong>
                  <span>合计</span>
                </div>
              </div>
              <div className="dash-legend">
                {levelDistribution.map((l) => {
                  const pct = levelTotal ? Math.round((l.value / levelTotal) * 100) : 0;
                  return (
                    <div key={l.name} className="dash-legend-item">
                      <span className="dash-legend-dot" style={{ background: l.color }} />
                      {l.name} {l.value} · {pct}%
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ⑤ 使用与组织 */}
      <section className="dash-section">
        <div className="dash-section-head">
          <strong>使用与组织</strong>
          <span>员工与部门排行各展示前 8 位</span>
        </div>
        <div className="dash-dual even">
          <Card
            className="dash-panel"
            title="按员工 Tokens 消耗"
            extra={
              <Button type="link" size="small" onClick={() => setShowEmployeeTokensDetail(true)}>
                更多 <RightOutlined />
              </Button>
            }
          >
            <Table
              className="dash-rank-preview-table"
              size="small"
              dataSource={topEmployeeTokens}
              rowKey="id"
              pagination={false}
              columns={getEmployeeTokensPreviewColumns(topEmployeeTokens)}
            />
          </Card>
          <Card
            className="dash-panel"
            title="部门使用排行"
            extra={<Button type="link" size="small" onClick={() => setShowDeptDetail(true)}>更多 <RightOutlined /></Button>}
          >
            <Table
              className="dash-rank-preview-table"
              size="small"
              dataSource={topDepartmentUsage}
              rowKey="department"
              pagination={false}
              columns={getDepartmentRankColumns(topDepartmentUsage)}
            />
          </Card>
        </div>
      </section>

      {/* ⑥ 运营动态：近7天趋势 ‖ 按员工 Tokens */}
      <section className="dash-section">
        <div className="dash-section-head">
          <strong>运营动态</strong>
          <span>近7天趋势与用户活跃对照</span>
        </div>
        <div className="dash-dual even">
          <Card
            className="dash-panel"
            title="Tokens 消耗趋势（近7天）"
            extra={
              <Button type="link" size="small" onClick={() => setTrendModal('tokens')}>
                更多 <RightOutlined />
              </Button>
            }
          >
            <div className="dash-pair-chart" style={{ height: 240 }}>
              <TokensTrendChart data={tokensWeekly} />
            </div>
          </Card>
          <Card
            className="dash-panel"
            title="用户使用趋势"
            extra={
              <Button type="link" size="small" onClick={() => setTrendModal('users')}>
                更多 <RightOutlined />
              </Button>
            }
          >
            <div className="dash-pair-chart" style={{ height: 240 }}>
              <UserUsageTrendChart data={userUsageTrend} />
            </div>
          </Card>
        </div>
      </section>

      <Modal
        open={trendModal === 'tokens'}
        title="Tokens 消耗趋势"
        width={920}
        footer={null}
        destroyOnHidden
        onCancel={() => setTrendModal(null)}
      >
        <TrendChartFilters
          range={tokensTrendRange}
          onRangeChange={setTokensTrendRange}
          granularity={tokensGranularity}
          onGranularityChange={setTokensGranularity}
        />
        <div style={{ height: 380 }}>
          <TokensTrendChart data={tokensModalData} />
        </div>
      </Modal>

      <Modal
        open={trendModal === 'users'}
        title="用户使用趋势"
        width={920}
        footer={null}
        destroyOnHidden
        onCancel={() => setTrendModal(null)}
      >
        <TrendChartFilters
          range={usersTrendRange}
          onRangeChange={setUsersTrendRange}
          granularity={usersGranularity}
          onGranularityChange={setUsersGranularity}
        />
        <div style={{ height: 380 }}>
          <UserUsageTrendChart data={usersModalData} />
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
