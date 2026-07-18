import React, { useState, type ReactNode } from 'react';
import { Card, Row, Col, Tag, List, Button, DatePicker, Table } from 'antd';
import {
  HeartOutlined,
  TeamOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FireOutlined,
  DashboardOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import dayjs, { type Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  dashboardStats, tokensWeekly, levelDistribution,
  digitalEmployees, tasks, userUsageTrend, departmentUsage,
  tokensScenario, efficiencyReport,
} from '../../mock/data';
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

const CHART_GRID = '#eef0f3';
const CHART_AXIS = '#8c8c8c';
const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid #eef0f3',
  boxShadow: '0 4px 14px rgba(15,35,70,0.08)',
  fontSize: 12,
  padding: '8px 10px',
};

const employeeTokens = digitalEmployees.map((e) => ({
  name: e.name,
  id: e.id,
  quota: e.tokensQuota / 1000000,
  used: e.tokensUsed / 1000000,
  rate: Math.round((e.tokensUsed / e.tokensQuota) * 100),
  department: e.department,
}));

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

const DEPT_ACCENTS = ['#1677ff', '#2f8bff', '#13c2c2', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#595959'];

type KpiItem = {
  label: string;
  value: string | number;
  accent: string;
  icon: ReactNode;
  meta?: ReactNode;
  metaClass?: string;
  tinted?: boolean;
};

const KpiCard: React.FC<KpiItem> = ({ label, value, accent, icon, meta, metaClass, tinted }) => (
  <div
    className={`dash-kpi${tinted ? ' tinted' : ''}`}
    style={{ ['--kpi-accent' as string]: accent }}
  >
    <div className="dash-kpi-top">
      <div className="dash-kpi-label">{label}</div>
      <div className="dash-kpi-icon">{icon}</div>
    </div>
    <div>
      <div className="dash-kpi-value">{value}</div>
      <div className={`dash-kpi-meta ${metaClass ?? ''}`}>{meta ?? '\u00A0'}</div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<RangeValue>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [showDeptDetail, setShowDeptDetail] = useState(false);

  const hotEmployees = [...digitalEmployees]
    .sort((a, b) => b.taskCompleteRate - a.taskCompleteRate)
    .slice(0, 5);

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    .slice(0, 5);

  const fullRankingData = digitalEmployees.map((e, i) => ({
    ...e,
    rank: i + 1,
    taskCount: Math.floor(e.heat * 0.3) + 100,
    qualityScore: Math.floor(e.taskCompleteRate * 0.95 + 5),
    agentCalls: Math.floor(e.heat * 2) + 500,
  })).sort((a, b) => b.taskCompleteRate - a.taskCompleteRate);

  const levelTotal = levelDistribution.reduce((s, x) => s + x.value, 0);

  const activeCount = digitalEmployees.filter((e) => e.status === 'ACTIVE').length;
  const trainingCount = digitalEmployees.filter((e) => e.status === 'TRAINING').length;

  const healthSpark = tokensWeekly.map((d, i) => ({
    idx: i,
    v: Math.round(88 + (d.text / 26000) * 10),
  }));

  const highlightKpis: KpiItem[] = [
    {
      label: '数字员工总数',
      value: dashboardStats.totalEmployees.toLocaleString(),
      accent: '#1677ff',
      icon: <TeamOutlined />,
      meta: <><ArrowUpOutlined /> 较上月 {dashboardStats.monthNewPercent}%</>,
      metaClass: 'up',
    },
    {
      label: '智能体总数',
      value: dashboardStats.totalAgents.toLocaleString(),
      accent: '#722ed1',
      icon: <RobotOutlined />,
      meta: <>自有占比 {dashboardStats.ownRatio}%</>,
    },
    {
      label: 'Tokens 消耗',
      value: dashboardStats.todayTokens,
      accent: '#fa8c16',
      icon: <ThunderboltOutlined />,
      meta: <>统计周期内累计</>,
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
    },
    {
      label: '用户总数',
      value: dashboardStats.totalUsers.toLocaleString(),
      accent: '#1677ff',
      icon: <UserOutlined />,
      meta: <>平台注册用户</>,
    },
    {
      label: '活跃用户',
      value: dashboardStats.todayActiveUsers.toLocaleString(),
      accent: '#eb2f96',
      icon: <FireOutlined />,
      meta: <>当日活跃</>,
    },
    {
      label: '任务数',
      value: dashboardStats.todayTaskCount.toLocaleString(),
      accent: '#13c2c2',
      icon: <DashboardOutlined />,
      meta: <>均响 {dashboardStats.avgResponseTime}</>,
    },
  ];

  if (showDeptDetail) {
    const deptTotals = departmentUsage.reduce(
      (acc, d) => ({
        users: acc.users + d.users,
        sessions: acc.sessions + d.sessions,
        tasks: acc.tasks + d.tasks,
      }),
      { users: 0, sessions: 0, tasks: 0 },
    );
    const maxTasks = Math.max(...departmentUsage.map((d) => d.tasks), 1);
    const avgActiveRate = Math.round(
      departmentUsage.reduce((s, d) => s + getDeptActiveRate(d), 0) / departmentUsage.length,
    );
    const sortedDepts = [...departmentUsage].sort((a, b) => b.tasks - a.tasks);

    const deptDetailColumns = [
      {
        title: '排名',
        key: 'rank',
        width: 56,
        render: (_: unknown, __: DeptRow, idx: number) => (
          <span className={`dash-rank-badge ${idx < 3 ? 'top' : 'rest'}`}>{idx + 1}</span>
        ),
      },
      { title: '部门', dataIndex: 'department', key: 'department', width: 140 },
      {
        title: '用户数',
        dataIndex: 'users',
        key: 'users',
        width: 90,
        sorter: (a: DeptRow, b: DeptRow) => a.users - b.users,
      },
      {
        title: '会话数',
        dataIndex: 'sessions',
        key: 'sessions',
        width: 90,
        sorter: (a: DeptRow, b: DeptRow) => a.sessions - b.sessions,
        render: (v: number) => v.toLocaleString(),
      },
      {
        title: '任务数',
        dataIndex: 'tasks',
        key: 'tasks',
        width: 90,
        defaultSortOrder: 'descend' as const,
        sorter: (a: DeptRow, b: DeptRow) => a.tasks - b.tasks,
        render: (v: number) => v.toLocaleString(),
      },
      {
        title: 'Tokens 消耗',
        key: 'tokens',
        width: 110,
        sorter: (a: DeptRow, b: DeptRow) => getDeptTokens(a) - getDeptTokens(b),
        render: (_: unknown, r: DeptRow) => (
          <span className="dept-tokens">{getDeptTokens(r)}<em>万</em></span>
        ),
      },
      {
        title: '活跃率',
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
            value={departmentUsage.length}
            accent="#1677ff"
            icon={<TeamOutlined />}
            meta={<>本周期统计范围</>}
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
          />
        </div>

        <section className="dash-section">
          <div className="dash-section-head">
            <strong>部门速览</strong>
            <span>按任务量排序 · 条形对比相对强度</span>
          </div>
          <div className="dept-card-grid">
            {sortedDepts.map((d, idx) => {
              const rate = getDeptActiveRate(d);
              const accent = DEPT_ACCENTS[idx % DEPT_ACCENTS.length];
              const taskPct = Math.round((d.tasks / maxTasks) * 100);
              return (
                <div
                  key={d.department}
                  className="dept-card"
                  style={{ ['--dept-accent' as string]: accent }}
                >
                  <div className="dept-card-top">
                    <span className={`dash-rank-badge ${idx < 3 ? 'top' : 'rest'}`}>{idx + 1}</span>
                    <strong>{d.department}</strong>
                    <Tag
                      color={rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'error'}
                      style={{ marginInlineEnd: 0, fontSize: 11 }}
                    >
                      {rate}%
                    </Tag>
                  </div>
                  <div className="dept-card-metrics">
                    <div>
                      <span>用户</span>
                      <b>{d.users}</b>
                    </div>
                    <div>
                      <span>会话</span>
                      <b>{d.sessions.toLocaleString()}</b>
                    </div>
                    <div>
                      <span>任务</span>
                      <b>{d.tasks.toLocaleString()}</b>
                    </div>
                    <div>
                      <span>Tokens</span>
                      <b>{getDeptTokens(d)}万</b>
                    </div>
                  </div>
                  <div className="dept-card-bar">
                    <i style={{ width: `${taskPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dash-section">
          <div className="dash-section-head">
            <strong>明细对照</strong>
            <span>横向对比用户与任务量，表格支持排序</span>
          </div>
          <Card className="dash-panel" title="部门任务 vs 用户" style={{ marginBottom: 12 }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sortedDepts} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="department"
                  width={88}
                  tick={{ fontSize: 11, fill: CHART_AXIS }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(22,119,255,0.04)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="users" name="用户数" fill="#1677ff" radius={[0, 3, 3, 0]} maxBarSize={12} />
                <Bar dataKey="tasks" name="任务数" fill="#69b1ff" radius={[0, 3, 3, 0]} maxBarSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="dash-panel" title="部门使用明细">
            <Table
              className="dept-detail-table"
              dataSource={sortedDepts}
              columns={deptDetailColumns}
              rowKey="department"
              pagination={false}
              size="small"
            />
          </Card>
        </section>
      </div>
    );
  }

  if (showFullRanking) {
    return (
      <div className="dash">
        <div className="dash-subhead">
          <Button icon={<ArrowLeftOutlined />} onClick={() => setShowFullRanking(false)}>返回驾驶舱</Button>
          <h2>数字员工效能排名</h2>
        </div>

        <Row gutter={10} style={{ marginBottom: 10 }}>
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
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 2 }}>本月节省人力工时</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>
                    {efficiencyReport.savedHours} <span style={{ fontSize: 13, fontWeight: 400 }}>小时</span>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 2 }}>平均单次任务成本降低</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>
                    {efficiencyReport.costReduction}%
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 2 }}>ROI (投入产出比)</div>
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

        <Card className="dash-panel" title="完整效能排名">
          <Table
            size="small"
            dataSource={fullRankingData}
            rowKey="id"
            pagination={{ pageSize: 20, sizeSize: true }}
            columns={[
              {
                title: '排名', key: 'rank', width: 56,
                render: (_: unknown, __: unknown, idx: number) => (
                  <span className={`dash-rank-badge ${idx < 3 ? 'top' : 'rest'}`}>{idx + 1}</span>
                ),
              },
              { title: '数字员工', dataIndex: 'name', key: 'name' },
              { title: '部门', dataIndex: 'department', key: 'department' },
              { title: '岗位', dataIndex: 'position', key: 'position', ellipsis: true },
              { title: '完成率', dataIndex: 'taskCompleteRate', key: 'taskCompleteRate', render: (v: number) => `${v}%`, sorter: (a: typeof fullRankingData[0], b: typeof fullRankingData[0]) => a.taskCompleteRate - b.taskCompleteRate },
              { title: '任务数', dataIndex: 'taskCount', key: 'taskCount' },
              { title: '质量', dataIndex: 'qualityScore', key: 'qualityScore' },
              { title: '调用', dataIndex: 'agentCalls', key: 'agentCalls' },
              { title: 'Tokens', key: 'tokens', render: (_: unknown, r: typeof fullRankingData[0]) => `${(r.tokensUsed / 1000000).toFixed(1)}M` },
              { title: '级别', dataIndex: 'level', key: 'level', render: (l: string) => <Tag color="blue">{l}</Tag> },
            ]}
          />
        </Card>
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
              <HeartOutlined /> 系统运行健康度
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

      {/* ② 消耗总览：趋势 ‖ 级别（等高定高，避免留白） */}
      <section className="dash-section">
        <div className="dash-section-head">
          <strong>消耗总览</strong>
          <span>近7天趋势与级别结构并列对比</span>
        </div>
        <div className="dash-pair">
          <Card className="dash-panel" title="Tokens 消耗趋势（近7天）">
            <div className="dash-pair-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tokensWeekly} barGap={3} barCategoryGap="26%" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(22,119,255,0.04)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="text" name="文本 Tokens" fill="#1677ff" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="multimodal" name="视频/多模态" fill="#91caff" radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="dash-panel" title="级别分布">
            <div className="dash-pie-pane">
              <div className="dash-pie-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={levelDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
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
                      {l.name.replace(/^L\d\s/, '')} {pct}%
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ③ 效益洞察：三卡横排紧凑（从右侧挪出，避免拉高左图） */}
      <section className="dash-section">
        <div className="dash-section-head">
          <strong>效益洞察</strong>
          <span>配额消耗 · 结余 · 降本增效</span>
        </div>
        <div className="dash-insight-row">
          <div className="dash-insight">
            <div>
              <div className="dash-insight-label">本月总消耗</div>
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
              <div className="dash-insight-label">预计月度结余</div>
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
              <div className="dash-insight-label">本月节省工时</div>
              <div className="dash-insight-value">
                {efficiencyReport.savedHours}<span>h</span>
              </div>
            </div>
            <div className="dash-ring-wrap">
              <div className="dash-ring" style={{ ['--ring-pct' as string]: 88, ['--ring-color' as string]: '#1677ff' }} />
              <span className="dash-ring-label">88%</span>
            </div>
            <div className="dash-insight-meta">ROI {efficiencyReport.roi} · -{efficiencyReport.costReduction}%</div>
            <div
              className="dash-insight-bar"
              style={{ ['--bar-w' as string]: '88%', ['--bar-from' as string]: '#69b1ff', ['--bar-to' as string]: '#1677ff' }}
            >
              <i />
            </div>
          </div>
        </div>
      </section>

      {/* ④ 消耗明细：构成 ‖ 员工表 */}
      <section className="dash-section">
        <div className="dash-section-head">
          <strong>消耗明细</strong>
          <span>场景构成与员工用量并列下钻</span>
        </div>
        <div className="dash-dual">
          <Card className="dash-panel" title="Tokens 消耗构成">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={tokensScenario}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {tokensScenario.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="dash-legend">
              {tokensScenario.map((s) => (
                <div key={s.name} className="dash-legend-item">
                  <span className="dash-legend-dot" style={{ background: s.color }} />
                  {s.name}
                </div>
              ))}
            </div>
          </Card>
          <Card className="dash-panel" title="按员工 Tokens 消耗">
            <Table
              size="small"
              dataSource={employeeTokens}
              rowKey="id"
              pagination={false}
              scroll={{ y: 220 }}
              columns={[
                { title: '员工', dataIndex: 'name', key: 'name', ellipsis: true },
                { title: '部门', dataIndex: 'department', key: 'department', ellipsis: true, width: 96 },
                { title: '已用', dataIndex: 'used', key: 'used', width: 64, render: (v: number) => `${v.toFixed(1)}M` },
                { title: '配额', dataIndex: 'quota', key: 'quota', width: 64, render: (v: number) => `${v.toFixed(1)}M` },
                {
                  title: '率', dataIndex: 'rate', key: 'rate', width: 58,
                  render: (v: number) => <Tag color={v > 80 ? 'red' : v > 50 ? 'orange' : 'green'}>{v}%</Tag>,
                },
              ]}
            />
          </Card>
        </div>
      </section>

      {/* ⑤ 使用与组织 */}
      <section className="dash-section">
        <div className="dash-section-head">
          <strong>使用与组织</strong>
          <span>用户活跃趋势与部门排行对齐</span>
        </div>
        <div className="dash-dual flip">
          <Card className="dash-panel" title="用户使用趋势">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={userUsageTrend}>
                <defs>
                  <linearGradient id="dashUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1677ff" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1677ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="users" name="用户数" stroke="#1677ff" fill="url(#dashUsers)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sessions" name="会话数" stroke="#52c41a" strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="tasks" name="任务数" stroke="#fa8c16" strokeWidth={1.8} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          <Card
            className="dash-panel"
            title="部门使用排行"
            extra={<Button type="link" size="small" onClick={() => setShowDeptDetail(true)}>更多 <RightOutlined /></Button>}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={departmentUsage} layout="vertical" margin={{ left: 4, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="department" width={78} tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(22,119,255,0.04)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="users" name="用户数" fill="#1677ff" radius={[0, 3, 3, 0]} maxBarSize={10} />
                <Bar dataKey="tasks" name="任务数" fill="#69b1ff" radius={[0, 3, 3, 0]} maxBarSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </section>

      {/* ⑥ 运营动态 */}
      <section className="dash-section">
        <div className="dash-section-head">
          <strong>运营动态</strong>
          <span>效能榜与任务态紧凑对照</span>
        </div>
        <div className="dash-dual even">
          <Card
            className="dash-panel dash-list-card"
            title="热门数字员工 TOP5"
            extra={<Button type="link" size="small" onClick={() => setShowFullRanking(true)}>全部</Button>}
          >
            <List
              size="small"
              dataSource={hotEmployees}
              renderItem={(emp, idx) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<span className={`dash-rank-badge ${idx < 3 ? 'top' : 'rest'}`}>{idx + 1}</span>}
                    title={emp.name}
                    description={`${emp.taskCompleteRate}% · ${emp.department}`}
                  />
                  <Tag color="processing" style={{ marginInlineEnd: 0 }}>{emp.level}</Tag>
                </List.Item>
              )}
            />
          </Card>
          <Card
            className="dash-panel dash-list-card"
            title="最近任务"
            extra={<Button type="link" size="small" onClick={() => navigate('/admin/task-logs')}>全部</Button>}
          >
            <List
              size="small"
              dataSource={recentTasks}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      task.status === '已完成' ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} /> :
                      task.status === '执行中' ? <ClockCircleOutlined style={{ color: '#1677ff', fontSize: 14 }} /> :
                      task.status === '已失败' ? <WarningOutlined style={{ color: '#ff4d4f', fontSize: 14 }} /> :
                      <ClockCircleOutlined style={{ color: '#999', fontSize: 14 }} />
                    }
                    title={task.title}
                    description={
                      <span>
                        <Tag
                          color={
                            task.status === '已完成' ? 'success' :
                            task.status === '执行中' ? 'processing' :
                            task.status === '已失败' ? 'error' : 'default'
                          }
                          style={{ fontSize: 11 }}
                        >
                          {task.status}
                        </Tag>
                        {task.createTime}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
