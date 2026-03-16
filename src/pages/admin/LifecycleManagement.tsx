import React, { useState } from 'react';
import {
  Card, Tabs, Table, Tag, Button, Space, Avatar, Input, Select,
  Modal, Form, Progress, Descriptions, Tooltip, message,
  Row, Col,
} from 'antd';
import {
  PlusOutlined, SearchOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { digitalEmployees, type DigitalEmployee } from '../../mock/data';

const statusColor: Record<string, string> = {
  ACTIVE: 'success', TRAINING: 'processing', SUSPENDED: 'warning', TERMINATED: 'error',
};
const statusLabel: Record<string, string> = {
  ACTIVE: 'ACTIVE', TRAINING: 'TRAINING', SUSPENDED: 'SUSPENDED', TERMINATED: 'TERMINATED',
};

const LifecycleManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('onduty');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [onboardVisible, setOnboardVisible] = useState(false);
  const [exitVisible, setExitVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [form] = Form.useForm();

  const filtered = digitalEmployees.filter((e) => {
    const matchSearch = e.name.includes(searchText) || e.id.includes(searchText) || e.owner.includes(searchText);
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const showDetail = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setDetailVisible(true);
  };

  const onboardColumns = [
    {
      title: '工号', dataIndex: 'id', key: 'id', width: 120,
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '数字形象', dataIndex: 'avatar', key: 'avatar', width: 80,
      render: (_: string, record: DigitalEmployee) => (
        <Avatar style={{ background: '#1677ff' }}>{record.avatar}</Avatar>
      ),
    },
    { title: '所属自然人', dataIndex: 'owner', key: 'owner', width: 100 },
    {
      title: '身份', dataIndex: 'ownerType', key: 'ownerType', width: 80,
      render: (t: string) => <Tag color={t === '自有' ? 'blue' : 'orange'}>{t}</Tag>,
    },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 120 },
    { title: '入职日期', dataIndex: 'onboardDate', key: 'onboardDate', width: 110 },
    {
      title: '状态', key: 'status', width: 100,
      render: (_: unknown, record: DigitalEmployee) => (
        <Tag color={record.status === 'TRAINING' ? 'processing' : 'success'}>
          待审批
        </Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
          <Button type="link" size="small" onClick={() => message.success('已通过审批')}>通过</Button>
          <Button type="link" size="small" danger>驳回</Button>
        </Space>
      ),
    },
  ];

  const ondutyColumns = [
    {
      title: '工号', dataIndex: 'id', key: 'id', width: 120,
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '数字形象', dataIndex: 'avatar', key: 'avatar', width: 80,
      render: (_: string, record: DigitalEmployee) => (
        <Avatar style={{
          background: record.status === 'ACTIVE' ? '#1677ff' : record.status === 'TRAINING' ? '#722ed1' : '#999',
        }}>{record.avatar}</Avatar>
      ),
    },
    { title: '所属自然人', dataIndex: 'owner', key: 'owner', width: 100 },
    {
      title: '身份', dataIndex: 'ownerType', key: 'ownerType', width: 80,
      render: (t: string) => <Tag color={t === '自有' ? 'blue' : 'orange'}>{t}</Tag>,
    },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 120 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 110,
      render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag>,
    },
    { title: '最近活跃', dataIndex: 'lastActive', key: 'lastActive', width: 110 },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Tooltip title="详情"><Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button></Tooltip>
          <Tooltip title="日志"><Button type="link" size="small" icon={<FileTextOutlined />}>日志</Button></Tooltip>
        </Space>
      ),
    },
  ];

  const assessColumns = [
    {
      title: '工号', dataIndex: 'id', key: 'id', width: 120,
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '数字员工', key: 'name', width: 140,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Avatar size="small" style={{ background: '#1677ff' }}>{record.avatar}</Avatar>
          {record.name}
        </Space>
      ),
    },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 120 },
    {
      title: '任务完成率', key: 'taskRate', width: 140,
      render: (_: unknown, record: DigitalEmployee) => (
        <Progress percent={record.taskCompleteRate} size="small" status={record.taskCompleteRate > 90 ? 'success' : 'active'} />
      ),
    },
    {
      title: 'Tokens消耗', key: 'tokens', width: 120,
      render: (_: unknown, record: DigitalEmployee) => (
        <span>{(record.tokensUsed / 1000000).toFixed(1)}M</span>
      ),
    },
    {
      title: '能力等级', dataIndex: 'level', key: 'level', width: 90,
      render: (l: string) => <Tag color="blue">{l}</Tag>,
    },
    {
      title: '综合评分', key: 'score', width: 100,
      render: (_: unknown, record: DigitalEmployee) => {
        const score = Math.round(record.taskCompleteRate * 0.4 + (1 - record.tokensUsed / record.tokensQuota) * 100 * 0.3 + (record.level === 'L4' ? 95 : record.level === 'L3' ? 85 : record.level === 'L2' ? 75 : 65) * 0.3);
        return <span style={{ fontWeight: 600, color: score > 85 ? '#52c41a' : score > 70 ? '#1677ff' : '#ff4d4f' }}>{score}</span>;
      },
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
          <Button type="link" size="small">报告</Button>
        </Space>
      ),
    },
  ];

  const exitColumns = [
    {
      title: '工号', dataIndex: 'id', key: 'id', width: 120,
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '数字员工', key: 'name', width: 140,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Avatar size="small" style={{ background: '#999' }}>{record.avatar}</Avatar>
          {record.name}
        </Space>
      ),
    },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 120 },
    {
      title: '退出状态', key: 'exitStatus', width: 100,
      render: () => <Tag color="default">待审批</Tag>,
    },
    {
      title: '退出原因', key: 'reason', width: 150,
      render: () => <span>效能不达标 / 岗位调整</span>,
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
          <Button type="link" size="small" onClick={() => message.success('已批准退出')}>批准退出</Button>
          <Button type="link" size="small" danger>驳回</Button>
        </Space>
      ),
    },
  ];

  const onboardData = filtered.filter((e) => e.status === 'TRAINING');
  const ondutyData = filtered.filter((e) => e.status !== 'TERMINATED');
  const exitData = filtered.filter((e) => e.status === 'SUSPENDED');

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>全生命周期管理</h2>

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              <Input
                placeholder="搜索工号/姓名"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: '所有状态' },
                  { value: 'ACTIVE', label: 'ACTIVE' },
                  { value: 'TRAINING', label: 'TRAINING' },
                  { value: 'SUSPENDED', label: 'SUSPENDED' },
                ]}
              />
              {activeTab === 'onboard' && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setOnboardVisible(true)}>
                  新增入职
                </Button>
              )}
            </Space>
          }
          items={[
            {
              key: 'onboard',
              label: '入职管理',
              children: (
                <Table
                  dataSource={onboardData}
                  columns={onboardColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              ),
            },
            {
              key: 'onduty',
              label: '在岗管理',
              children: (
                <>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <Card size="small" style={{ borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: '#666' }}>效能评估</span>
                          <Progress type="dashboard" percent={85} size={60} strokeColor="#1677ff" />
                        </div>
                        <div style={{ fontSize: 12, color: '#999', textAlign: 'right' }}>85/100</div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" style={{ borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: '#666' }}>合规评估</span>
                          <Progress type="dashboard" percent={98} size={60} strokeColor="#52c41a" />
                        </div>
                        <div style={{ fontSize: 12, color: '#999', textAlign: 'right' }}>98/100</div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" style={{ borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: '#666' }}>安全评估</span>
                          <Progress type="dashboard" percent={70} size={60} strokeColor="#faad14" />
                        </div>
                        <div style={{ fontSize: 12, color: '#faad14', textAlign: 'right' }}>70/100 (需关注)</div>
                      </Card>
                    </Col>
                  </Row>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>数字员工列表</div>
                  <Table
                    dataSource={ondutyData}
                    columns={ondutyColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                  />
                </>
              ),
            },
            {
              key: 'assess',
              label: '考核管理',
              children: (
                <Table
                  dataSource={filtered}
                  columns={assessColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              ),
            },
            {
              key: 'exit',
              label: '退出管理',
              children: (
                <Table
                  dataSource={exitData}
                  columns={exitColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`数字员工详情 - ${selectedEmployee?.name}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={640}
      >
        {selectedEmployee && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <Avatar size={64} style={{ background: '#1677ff', fontSize: 24 }}>
                {selectedEmployee.avatar}
              </Avatar>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{selectedEmployee.name}</div>
                <div style={{ color: '#999', marginTop: 4 }}>{selectedEmployee.description}</div>
              </div>
            </div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="工号">{selectedEmployee.id}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColor[selectedEmployee.status]}>{selectedEmployee.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="部门">{selectedEmployee.department}</Descriptions.Item>
              <Descriptions.Item label="岗位">{selectedEmployee.position}</Descriptions.Item>
              <Descriptions.Item label="所属自然人">{selectedEmployee.owner}</Descriptions.Item>
              <Descriptions.Item label="身份">{selectedEmployee.ownerType}</Descriptions.Item>
              <Descriptions.Item label="能力等级"><Tag color="blue">{selectedEmployee.level}</Tag></Descriptions.Item>
              <Descriptions.Item label="入职日期">{selectedEmployee.onboardDate}</Descriptions.Item>
              <Descriptions.Item label="Tokens配额" span={2}>
                <Progress
                  percent={Math.round((selectedEmployee.tokensUsed / selectedEmployee.tokensQuota) * 100)}
                  format={() => `${(selectedEmployee.tokensUsed / 1000000).toFixed(1)}M / ${(selectedEmployee.tokensQuota / 1000000).toFixed(1)}M`}
                />
              </Descriptions.Item>
              <Descriptions.Item label="任务完成率" span={2}>
                <Progress percent={selectedEmployee.taskCompleteRate} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="技能" span={2}>
                {selectedEmployee.skills.map((s) => <Tag key={s} color="processing">{s}</Tag>)}
              </Descriptions.Item>
              <Descriptions.Item label="关联智能体" span={2}>
                {selectedEmployee.relatedAgents.map((a) => <Tag key={a}>{a}</Tag>)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Onboard Modal */}
      <Modal
        title="新增数字员工入职"
        open={onboardVisible}
        onCancel={() => setOnboardVisible(false)}
        onOk={() => {
          message.success('入职申请已提交，待审批');
          setOnboardVisible(false);
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="数字员工名称" name="name" rules={[{ required: true }]}>
                <Input placeholder="例：小翼·xxx" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所属自然人" name="owner" rules={[{ required: true }]}>
                <Input placeholder="请输入归属人姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="身份类型" name="ownerType" rules={[{ required: true }]}>
                <Select options={[{ value: '自有', label: '自有' }, { value: '外包', label: '外包' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="岗位" name="position" rules={[{ required: true }]}>
                <Input placeholder="请输入岗位名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="部门" name="department" rules={[{ required: true }]}>
                <Input placeholder="请输入所属部门" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tokens配额" name="tokensQuota">
                <Input type="number" placeholder="请输入配额（默认200万）" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="请描述该数字员工的职责" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Exit Modal */}
      <Modal
        title="发起退出申请"
        open={exitVisible}
        onCancel={() => setExitVisible(false)}
        onOk={() => {
          message.success('退出申请已提交');
          setExitVisible(false);
        }}
      >
        <Form layout="vertical">
          <Form.Item label="退出原因" rules={[{ required: true }]}>
            <Select options={[
              { value: 'performance', label: '效能不达标' },
              { value: 'adjust', label: '岗位调整' },
              { value: 'cost', label: '成本优化' },
              { value: 'other', label: '其他' },
            ]} />
          </Form.Item>
          <Form.Item label="详细说明">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LifecycleManagement;
