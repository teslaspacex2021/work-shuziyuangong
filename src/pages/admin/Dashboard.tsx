import React from 'react';
import { Card, Row, Col, Statistic, Tag, List, Badge, Button } from 'antd';
import {
  AlertOutlined,
  AuditOutlined,
  HeartOutlined,
  TeamOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  dashboardStats, tokensWeekly, levelDistribution, alerts,
  digitalEmployees, tasks,
} from '../../mock/data';

const Dashboard: React.FC = () => {
  const unhandledAlerts = alerts.filter((a) => !a.handled);
  const riskAlerts = unhandledAlerts.filter((a) => a.type === '风险预警');
  const pendingApprovals = unhandledAlerts.filter((a) => a.type === '待办审批');

  const hotEmployees = [...digitalEmployees]
    .sort((a, b) => b.taskCompleteRate - a.taskCompleteRate)
    .slice(0, 5);

  const recentTasks = [...tasks].sort((a, b) =>
    new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  ).slice(0, 5);

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>运营驾驶舱</h2>

      {/* Alert Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>风险预警</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#ff4d4f' }}>
                  {dashboardStats.riskAlerts}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  含{riskAlerts.length}项合规风险
                </div>
              </div>
              <AlertOutlined style={{ fontSize: 36, color: '#ff4d4f', opacity: 0.3 }} />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>待办审批</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#1677ff' }}>
                  {dashboardStats.pendingApprovals}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  入职{pendingApprovals.filter((a) => a.title.includes('入职')).length}，上架审核{pendingApprovals.filter((a) => a.title.includes('上架')).length}
                </div>
              </div>
              <AuditOutlined style={{ fontSize: 36, color: '#1677ff', opacity: 0.3 }} />
            </div>
          </Card>
        </Col>
        <Col span={8}>
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
      </Row>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="数字员工总数"
              value={dashboardStats.totalEmployees}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              suffix={
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> {dashboardStats.monthNewPercent}% 本月新增
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="智能体总数"
              value={dashboardStats.totalAgents}
              prefix={<RobotOutlined style={{ color: '#722ed1' }} />}
              suffix={
                <span style={{ fontSize: 12, color: '#999' }}>
                  自有 {dashboardStats.ownRatio}% / 外包 {dashboardStats.outsourceRatio}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="今日 Tokens 消耗"
              value={dashboardStats.todayTokens}
              prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
              suffix={
                <span style={{ fontSize: 12, color: '#ff4d4f' }}>
                  预计本月超支风险低
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="平均任务完成率"
              value={dashboardStats.avgTaskRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              效能评级 {dashboardStats.efficiencyGrade}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={16}>
          <Card title="Tokens 消耗趋势（近7天）" style={{ borderRadius: 12 }}>
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
          <Card title="能力等级分布" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={levelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
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

      {/* Bottom Row */}
      <Row gutter={16}>
        <Col span={8}>
          <Card
            title="预警与待办"
            extra={<Button type="link" size="small">查看全部</Button>}
            style={{ borderRadius: 12 }}
          >
            <List
              size="small"
              dataSource={unhandledAlerts.slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge
                        color={item.level === 'critical' ? '#ff4d4f' : item.level === 'warning' ? '#faad14' : '#1677ff'}
                      />
                    }
                    title={<span style={{ fontSize: 13 }}>{item.title}</span>}
                    description={
                      <span style={{ fontSize: 12 }}>
                        <Tag
                          color={item.type === '风险预警' ? 'red' : item.type === '待办审批' ? 'blue' : 'default'}
                          style={{ fontSize: 11 }}
                        >
                          {item.type}
                        </Tag>
                        {item.time}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="热门数字员工 TOP5"
            extra={<Button type="link" size="small">查看全部</Button>}
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
                        display: 'inline-flex',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: idx < 3 ? '#1677ff' : '#f0f0f0',
                        color: idx < 3 ? '#fff' : '#666',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {idx + 1}
                      </span>
                    }
                    title={<span style={{ fontSize: 13 }}>{emp.name}</span>}
                    description={
                      <span style={{ fontSize: 12 }}>
                        完成率 {emp.taskCompleteRate}% · {emp.department}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="最近任务"
            extra={<Button type="link" size="small">查看全部</Button>}
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
