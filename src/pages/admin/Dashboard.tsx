import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Tag, List, Button, DatePicker, Table } from 'antd';
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
  FieldTimeOutlined,
  DashboardOutlined,
  DollarOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import dayjs, { type Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  dashboardStats, tokensWeekly, levelDistribution,
  digitalEmployees, tasks, userUsageTrend, departmentUsage,
  tokensScenario, efficiencyReport,
} from '../../mock/data';

const { RangePicker } = DatePicker;

type RangeValue = [Dayjs | null, Dayjs | null] | null;

const presets: { label: string; value: [Dayjs, Dayjs] }[] = [
  { label: '本周', value: [dayjs().startOf('week'), dayjs()] },
  { label: '本月', value: [dayjs().startOf('month'), dayjs()] },
  { label: '近3个月', value: [dayjs().subtract(3, 'month'), dayjs()] },
  { label: '本季度', value: [dayjs().subtract(dayjs().month() % 3, 'month').startOf('month'), dayjs()] },
  { label: '本年', value: [dayjs().startOf('year'), dayjs()] },
];

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

const deptDetailColumns = [
  { title: '部门', dataIndex: 'department', key: 'department', width: 140 },
  { title: '用户数', dataIndex: 'users', key: 'users', width: 100, sorter: (a: typeof departmentUsage[0], b: typeof departmentUsage[0]) => a.users - b.users },
  { title: '会话数', dataIndex: 'sessions', key: 'sessions', width: 100, sorter: (a: typeof departmentUsage[0], b: typeof departmentUsage[0]) => a.sessions - b.sessions },
  { title: '任务数', dataIndex: 'tasks', key: 'tasks', width: 100, sorter: (a: typeof departmentUsage[0], b: typeof departmentUsage[0]) => a.tasks - b.tasks },
  {
    title: 'Tokens消耗', key: 'tokens', width: 120,
    render: (_: unknown, r: typeof departmentUsage[0]) => `${(r.tasks * 1.5).toFixed(0)}万`,
  },
  {
    title: '活跃率', key: 'activeRate', width: 100,
    render: (_: unknown, r: typeof departmentUsage[0]) => {
      const rate = Math.min(99, Math.round((r.users / 120) * 100));
      return <Tag color={rate >= 80 ? 'green' : rate >= 50 ? 'orange' : 'red'}>{rate}%</Tag>;
    },
  },
];

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

  if (showDeptDetail) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => setShowDeptDetail(false)}>返回驾驶舱</Button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>部门使用详情</h2>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {departmentUsage.map((d) => (
            <Col span={6} key={d.department}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{d.department}</div>
                <Row gutter={8}>
                  <Col span={8}><Statistic title="用户" value={d.users} valueStyle={{ fontSize: 18 }} /></Col>
                  <Col span={8}><Statistic title="会话" value={d.sessions} valueStyle={{ fontSize: 18 }} /></Col>
                  <Col span={8}><Statistic title="任务" value={d.tasks} valueStyle={{ fontSize: 18 }} /></Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>

        <Card title="部门使用明细" style={{ borderRadius: 12 }}>
          <Table
            dataSource={departmentUsage}
            columns={deptDetailColumns}
            rowKey="department"
            pagination={false}
            size="middle"
          />
        </Card>
      </div>
    );
  }

  if (showFullRanking) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => setShowFullRanking(false)}>返回驾驶舱</Button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>数字员工效能排名</h2>
        </div>

        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={16}>
            <Card title="效能趋势" style={{ borderRadius: 12 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="tasks" name="任务完成量" stroke="#1677ff" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="quality" name="完成质量(%)" stroke="#52c41a" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="calls" name="智能体调用" stroke="#722ed1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="降本增效分析报告" style={{ borderRadius: 12 }}>
              <div style={{ padding: '12px 0' }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>本月节省人力工时</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>
                    {efficiencyReport.savedHours} <span style={{ fontSize: 14, fontWeight: 400 }}>小时</span>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>平均单次任务成本降低</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1677ff' }}>
                    {efficiencyReport.costReduction}%
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>ROI (投入产出比)</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>
                    {efficiencyReport.roi}
                  </div>
                </div>
                <Button type="primary" icon={<DownloadOutlined />} block style={{ borderRadius: 8 }}>
                  下载详细效益报告
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="完整效能排名" style={{ borderRadius: 12 }}>
          <Table
            size="middle"
            dataSource={fullRankingData}
            rowKey="id"
            pagination={{ pageSize: 20 }}
            columns={[
              {
                title: '排名', key: 'rank', width: 60,
                render: (_: unknown, __: unknown, idx: number) => (
                  <span style={{
                    display: 'inline-flex', width: 24, height: 24, borderRadius: '50%',
                    background: idx < 3 ? '#1677ff' : '#f0f0f0',
                    color: idx < 3 ? '#fff' : '#666',
                    alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                  }}>
                    {idx + 1}
                  </span>
                ),
              },
              { title: '数字员工', dataIndex: 'name', key: 'name' },
              { title: '部门', dataIndex: 'department', key: 'department' },
              { title: '岗位', dataIndex: 'position', key: 'position' },
              { title: '任务完成率', dataIndex: 'taskCompleteRate', key: 'taskCompleteRate', render: (v: number) => `${v}%`, sorter: (a: typeof fullRankingData[0], b: typeof fullRankingData[0]) => a.taskCompleteRate - b.taskCompleteRate },
              { title: '任务数', dataIndex: 'taskCount', key: 'taskCount' },
              { title: '质量评分', dataIndex: 'qualityScore', key: 'qualityScore' },
              { title: '智能体调用', dataIndex: 'agentCalls', key: 'agentCalls' },
              { title: 'Tokens消耗', key: 'tokens', render: (_: unknown, r: typeof fullRankingData[0]) => `${(r.tokensUsed / 1000000).toFixed(1)}M` },
              { title: '职级', dataIndex: 'level', key: 'level', render: (l: string) => <Tag color="blue">{l}</Tag> },
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>运营驾驶舱</h2>
        <RangePicker
          value={dateRange}
          onChange={(val) => setDateRange(val)}
          presets={presets}
          allowClear={false}
        />
      </div>

      {/* Row 1: 4 equal stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>运行健康度</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#52c41a' }}>
                  {dashboardStats.healthScore}%
                </div>
                <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>
                  较昨日 {dashboardStats.healthChange}
                </div>
              </div>
              <HeartOutlined style={{ fontSize: 36, color: '#52c41a', opacity: 0.3 }} />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="数字员工总数"
              value={dashboardStats.totalEmployees}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              suffix={<span style={{ fontSize: 12, color: '#52c41a' }}><ArrowUpOutlined /> {dashboardStats.monthNewPercent}%</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="智能体总数"
              value={dashboardStats.totalAgents}
              prefix={<RobotOutlined style={{ color: '#722ed1' }} />}
              suffix={<span style={{ fontSize: 12, color: '#999' }}>自有 {dashboardStats.ownRatio}%</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Tokens 消耗"
              value={dashboardStats.todayTokens}
              prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: 4 equal stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="平均任务完成率"
              value={dashboardStats.avgTaskRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>效能评级 {dashboardStats.efficiencyGrade}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="用户总数"
              value={dashboardStats.totalUsers}
              prefix={<UserOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="活跃用户"
              value={dashboardStats.todayActiveUsers}
              prefix={<FireOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="任务数"
                  value={dashboardStats.todayTaskCount}
                  prefix={<DashboardOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="平均响应时间"
                  value={dashboardStats.avgResponseTime}
                  prefix={<FieldTimeOutlined style={{ color: '#13c2c2' }} />}
                  valueStyle={{ fontSize: 20, color: '#13c2c2' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Row 3: Tokens trend + Level distribution (same height) */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="Tokens 消耗趋势（近7天）" style={{ borderRadius: 12, height: 380 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tokensWeekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="text" name="文本 Tokens" fill="#1677ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="multimodal" name="视频/多模态 Tokens" fill="#1677ff" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="职级分布" style={{ borderRadius: 12, height: 380 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={levelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {levelDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              {levelDistribution.map((l) => (
                <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                  {l.name}
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row 4: Tokens cost summary - 3 equal cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="本月总消耗"
              value="152.8M"
              prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>
              <ArrowDownOutlined /> 较上月 -5.2%
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="预计月度结余"
              value="47.2M"
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="本月节省工时"
              value={efficiencyReport.savedHours}
              suffix="小时"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              ROI {efficiencyReport.roi} · 成本降低 {efficiencyReport.costReduction}%
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row 5: Tokens pie + Employee tokens table (same height) */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="Tokens消耗构成（按场景）" style={{ borderRadius: 12, height: 400 }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={tokensScenario}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {tokensScenario.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              {tokensScenario.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block' }} />
                  {s.name}
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="按员工Tokens消耗" style={{ borderRadius: 12, height: 400 }}>
            <Table
              size="small"
              dataSource={employeeTokens}
              rowKey="id"
              pagination={false}
              scroll={{ y: 290 }}
              columns={[
                { title: '员工', dataIndex: 'name', key: 'name' },
                { title: '部门', dataIndex: 'department', key: 'department', ellipsis: true },
                { title: '已用(M)', dataIndex: 'used', key: 'used', render: (v: number) => `${v.toFixed(1)}M` },
                { title: '配额(M)', dataIndex: 'quota', key: 'quota', render: (v: number) => `${v.toFixed(1)}M` },
                {
                  title: '使用率', dataIndex: 'rate', key: 'rate',
                  render: (v: number) => <Tag color={v > 80 ? 'red' : v > 50 ? 'orange' : 'green'}>{v}%</Tag>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 6: Usage trend + Department ranking (same height) */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={14}>
          <Card title="用户使用趋势" style={{ borderRadius: 12, height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userUsageTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" name="用户数" stroke="#1677ff" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sessions" name="会话数" stroke="#52c41a" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="tasks" name="任务数" stroke="#fa8c16" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={10}>
          <Card
            title="部门使用排行"
            extra={<Button type="link" size="small" onClick={() => setShowDeptDetail(true)}>查看更多 <RightOutlined /></Button>}
            style={{ borderRadius: 12, height: 400 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentUsage} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="department" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" name="用户数" fill="#1677ff" radius={[0, 4, 4, 0]} />
                <Bar dataKey="tasks" name="任务数" fill="#52c41a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Row 7: Hot employees + Recent tasks (same height) */}
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title="热门数字员工 TOP5"
            extra={<Button type="link" size="small" onClick={() => setShowFullRanking(true)}>查看全部</Button>}
            style={{ borderRadius: 12 }}
          >
            <List
              size="small"
              dataSource={hotEmployees}
              renderItem={(emp, idx) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <span style={{
                        display: 'inline-flex', width: 24, height: 24, borderRadius: '50%',
                        background: idx < 3 ? '#1677ff' : '#f0f0f0',
                        color: idx < 3 ? '#fff' : '#666',
                        alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                      }}>
                        {idx + 1}
                      </span>
                    }
                    title={<span style={{ fontSize: 13 }}>{emp.name}</span>}
                    description={<span style={{ fontSize: 12 }}>完成率 {emp.taskCompleteRate}% · {emp.department}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="最近任务"
            extra={<Button type="link" size="small" onClick={() => navigate('/admin/task-logs')}>查看全部</Button>}
            style={{ borderRadius: 12 }}
          >
            <List
              size="small"
              dataSource={recentTasks}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      task.status === '已完成' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                      task.status === '执行中' ? <ClockCircleOutlined style={{ color: '#1677ff' }} /> :
                      task.status === '已失败' ? <WarningOutlined style={{ color: '#ff4d4f' }} /> :
                      <ClockCircleOutlined style={{ color: '#999' }} />
                    }
                    title={<span style={{ fontSize: 13 }}>{task.title}</span>}
                    description={
                      <span style={{ fontSize: 12 }}>
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
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
