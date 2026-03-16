import React, { useState } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Tabs, Button, Select, DatePicker,
} from 'antd';
import {
  DollarOutlined, ThunderboltOutlined, RiseOutlined,
  DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';
import {
  tokensScenario, efficiencyReport, digitalEmployees, tokensWeekly,
} from '../../mock/data';

const employeeTokens = digitalEmployees.map((e) => ({
  name: e.name,
  id: e.id,
  quota: e.tokensQuota / 1000000,
  used: e.tokensUsed / 1000000,
  rate: Math.round((e.tokensUsed / e.tokensQuota) * 100),
  department: e.department,
}));

const skillTokens = [
  { skill: '智能问答', text: 12500, multimodal: 2300, total: 14800 },
  { skill: '文案撰写', text: 8900, multimodal: 1200, total: 10100 },
  { skill: '商机挖掘', text: 7600, multimodal: 3500, total: 11100 },
  { skill: '数据标注', text: 5200, multimodal: 800, total: 6000 },
  { skill: '报销审核', text: 4100, multimodal: 200, total: 4300 },
  { skill: '审计底稿', text: 3800, multimodal: 300, total: 4100 },
  { skill: '简历筛选', text: 3200, multimodal: 1500, total: 4700 },
];

const efficiencyData = [
  { month: '2025-10', tasks: 2800, quality: 88, calls: 15200 },
  { month: '2025-11', tasks: 3200, quality: 90, calls: 18500 },
  { month: '2025-12', tasks: 3800, quality: 91, calls: 21000 },
  { month: '2026-01', tasks: 4200, quality: 93, calls: 24800 },
  { month: '2026-02', tasks: 4600, quality: 94, calls: 27600 },
  { month: '2026-03', tasks: 4100, quality: 95, calls: 25200 },
];

const TokensEfficiency: React.FC = () => {
  const [activeTab, setActiveTab] = useState('consumption');

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>Tokens 与效益</h2>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'consumption',
            label: 'Tokens消耗统计',
            children: (
              <div>
                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col span={6}>
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
                  <Col span={6}>
                    <Card style={{ borderRadius: 12 }}>
                      <Statistic title="文本Tokens" value="128.5M" />
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>占比 84.1%</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{ borderRadius: 12 }}>
                      <Statistic title="视频/多模态" value="24.3M" />
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>占比 15.9%</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{ borderRadius: 12 }}>
                      <Statistic
                        title="预计月度结余"
                        value="47.2M"
                        prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col span={12}>
                    <Card title="Tokens消耗构成（按场景）" style={{ borderRadius: 12 }}>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={tokensScenario}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                    <Card title="消耗趋势（近7天）" style={{ borderRadius: 12 }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={tokensWeekly}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="text" name="文本" fill="#1677ff" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="multimodal" name="多模态" fill="#1677ff" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="按员工消耗" style={{ borderRadius: 12 }}>
                      <Table
                        size="small"
                        dataSource={employeeTokens}
                        rowKey="id"
                        pagination={false}
                        columns={[
                          { title: '员工', dataIndex: 'name', key: 'name' },
                          { title: '部门', dataIndex: 'department', key: 'department', ellipsis: true },
                          { title: '已用(M)', dataIndex: 'used', key: 'used', render: (v: number) => `${v.toFixed(1)}M` },
                          { title: '配额(M)', dataIndex: 'quota', key: 'quota', render: (v: number) => `${v.toFixed(1)}M` },
                          {
                            title: '使用率', dataIndex: 'rate', key: 'rate',
                            render: (v: number) => (
                              <Tag color={v > 80 ? 'red' : v > 50 ? 'orange' : 'green'}>{v}%</Tag>
                            ),
                          },
                        ]}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="按技能消耗" style={{ borderRadius: 12 }}>
                      <Table
                        size="small"
                        dataSource={skillTokens}
                        rowKey="skill"
                        pagination={false}
                        columns={[
                          { title: '技能', dataIndex: 'skill', key: 'skill' },
                          { title: '文本', dataIndex: 'text', key: 'text', render: (v: number) => `${(v / 1000).toFixed(1)}K` },
                          { title: '多模态', dataIndex: 'multimodal', key: 'multimodal', render: (v: number) => `${(v / 1000).toFixed(1)}K` },
                          { title: '合计', dataIndex: 'total', key: 'total', render: (v: number) => <strong>{(v / 1000).toFixed(1)}K</strong> },
                        ]}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'efficiency',
            label: '效能分析',
            children: (
              <div>
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

                <Card title="数字员工效能排名" style={{ borderRadius: 12 }}>
                  <Table
                    size="middle"
                    dataSource={digitalEmployees.map((e, i) => ({
                      ...e,
                      rank: i + 1,
                      taskCount: Math.floor(Math.random() * 500) + 100,
                      qualityScore: Math.floor(Math.random() * 15) + 85,
                      agentCalls: Math.floor(Math.random() * 3000) + 500,
                    })).sort((a, b) => b.taskCompleteRate - a.taskCompleteRate)}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
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
                      { title: '任务完成率', dataIndex: 'taskCompleteRate', key: 'taskCompleteRate', render: (v: number) => `${v}%` },
                      { title: '任务数', dataIndex: 'taskCount', key: 'taskCount' },
                      { title: '质量评分', dataIndex: 'qualityScore', key: 'qualityScore' },
                      { title: '智能体调用', dataIndex: 'agentCalls', key: 'agentCalls' },
                    ]}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default TokensEfficiency;
