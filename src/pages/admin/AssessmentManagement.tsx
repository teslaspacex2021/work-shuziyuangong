import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Avatar, Modal, Form, Input, Select,
  Row, Col, Progress, Tabs, message, DatePicker,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, FileTextOutlined, TrophyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  assessmentRecords, assessmentConfigs, digitalEmployees,
  type AssessmentRecord, type AssessmentConfig,
} from '../../mock/data';

const levelColorMap: Record<string, string> = {
  L1: '#C0C0C0', L2: '#6B7B8D', L3: '#1677ff', L4: '#0A1929',
};

const cycleColorMap: Record<string, string> = {
  '季度': 'blue', '半年': 'purple', '全年': 'gold',
};

const configStatusColorMap: Record<string, string> = {
  '进行中': 'processing', '已结束': 'default', '未开始': 'warning',
};

const metricsOptions = [
  '任务完成率', 'Tokens消耗效率', '用户满意度', '响应速度',
  '技能成长', '综合表现', '能力提升', '创新贡献', 'Tokens效率',
];

const AssessmentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');

  // Records state
  const [cycleFilter, setCycleFilter] = useState<string | undefined>(undefined);
  const [positionFilter, setPositionFilter] = useState<string | undefined>(undefined);
  const [deptFilter, setDeptFilter] = useState<string | undefined>(undefined);

  // Configs state
  const [configs, setConfigs] = useState<AssessmentConfig[]>(assessmentConfigs);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AssessmentConfig | null>(null);
  const [form] = Form.useForm();

  const sortedRecords = useMemo(() => {
    return [...assessmentRecords]
      .sort((a, b) => b.score - a.score)
      .map((r, idx) => ({ ...r, rank: idx + 1 }));
  }, []);

  const filteredRecords = useMemo(() => {
    return sortedRecords.filter((r) => {
      const matchCycle = !cycleFilter || r.cycle === cycleFilter;
      const matchPosition = !positionFilter || r.position === positionFilter;
      const matchDept = !deptFilter || r.department === deptFilter;
      return matchCycle && matchPosition && matchDept;
    });
  }, [sortedRecords, cycleFilter, positionFilter, deptFilter]);

  const positionOptions = useMemo(
    () => [...new Set(assessmentRecords.map((r) => r.position))],
    [],
  );
  const deptOptions = useMemo(
    () => [...new Set(assessmentRecords.map((r) => r.department))],
    [],
  );

  const getEmployee = (employeeId: string) =>
    digitalEmployees.find((e) => e.id === employeeId);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#1677ff';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const handleAddConfig = () => {
    setEditingConfig(null);
    form.resetFields();
    setConfigModalVisible(true);
  };

  const handleEditConfig = (record: AssessmentConfig) => {
    setEditingConfig(record);
    form.setFieldsValue({
      name: record.name,
      cycle: record.cycle,
      metrics: record.metrics,
    });
    setConfigModalVisible(true);
  };

  const handleDeleteConfig = (record: AssessmentConfig) => {
    setConfigs((prev) => prev.filter((c) => c.id !== record.id));
    message.success('考核配置已删除');
  };

  const handleConfigSubmit = () => {
    form.validateFields().then((values) => {
      const startDate = values.startDate?.format('YYYY-MM-DD') || '';
      const endDate = values.endDate?.format('YYYY-MM-DD') || '';
      if (editingConfig) {
        setConfigs((prev) =>
          prev.map((c) =>
            c.id === editingConfig.id ? { ...c, ...values, startDate, endDate } : c,
          ),
        );
        message.success('考核配置已更新');
      } else {
        const newConfig: AssessmentConfig = {
          id: `AC${String(configs.length + 1).padStart(3, '0')}`,
          ...values,
          startDate,
          endDate,
          status: '未开始',
        };
        setConfigs((prev) => [...prev, newConfig]);
        message.success('考核配置已创建');
      }
      setConfigModalVisible(false);
      form.resetFields();
    });
  };

  const recordColumns: ColumnsType<AssessmentRecord & { rank: number }> = [
    {
      title: '排名', dataIndex: 'rank', key: 'rank', width: 70, align: 'center',
      render: (rank: number) => (
        <span style={{
          display: 'inline-flex', width: 28, height: 28, borderRadius: '50%',
          background: rank <= 3 ? '#1677ff' : '#f0f0f0',
          color: rank <= 3 ? '#fff' : '#666',
          alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13,
        }}>
          {rank <= 3 ? <TrophyOutlined /> : rank}
        </span>
      ),
    },
    { title: '工号', dataIndex: 'employeeId', key: 'employeeId', width: 120 },
    {
      title: '数字员工', key: 'employee', width: 160,
      render: (_, record) => {
        const emp = getEmployee(record.employeeId);
        return (
          <Space>
            <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>{emp?.avatar || record.employeeName.charAt(0)}</Avatar>
            <span>{record.employeeName}</span>
          </Space>
        );
      },
    },
    { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 130 },
    {
      title: '任务完成率', dataIndex: 'taskCompleteRate', key: 'taskCompleteRate', width: 150,
      render: (rate: number) => <Progress percent={rate} size="small" style={{ width: 100 }} />,
    },
    {
      title: 'Tokens消耗', key: 'tokens', width: 120,
      render: (_, record) => `${(record.tokensUsed / 10000).toFixed(0)}万`,
    },
    {
      title: '能力等级', dataIndex: 'level', key: 'level', width: 90,
      render: (level: string) => (
        <Tag color={levelColorMap[level]} style={{ color: level === 'L4' ? '#fff' : undefined }}>{level}</Tag>
      ),
    },
    {
      title: '综合评分', dataIndex: 'score', key: 'score', width: 100, align: 'center',
      sorter: (a, b) => a.score - b.score,
      render: (score: number) => (
        <span style={{ fontSize: 18, fontWeight: 700, color: getScoreColor(score) }}>{score}</span>
      ),
    },
    {
      title: '操作', key: 'action', width: 120, fixed: 'right',
      render: () => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
          <Button type="link" size="small" icon={<FileTextOutlined />}>报告</Button>
        </Space>
      ),
    },
  ];

  const configColumns: ColumnsType<AssessmentConfig> = [
    { title: '考核名称', dataIndex: 'name', key: 'name', width: 200 },
    {
      title: '考核周期', dataIndex: 'cycle', key: 'cycle', width: 100,
      render: (cycle: string) => <Tag color={cycleColorMap[cycle]}>{cycle}</Tag>,
    },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
    {
      title: '考核指标', dataIndex: 'metrics', key: 'metrics', width: 300,
      render: (metrics: string[]) => (
        <Space wrap size={[4, 4]}>
          {metrics.map((m) => <Tag key={m} color="blue">{m}</Tag>)}
        </Space>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => <Tag color={configStatusColorMap[status]}>{status}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 130, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditConfig(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteConfig(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>考核管理</h2>

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'records',
              label: '考核记录',
              children: (
                <>
                  <Row gutter={12} style={{ marginBottom: 16 }}>
                    <Col>
                      <Select
                        placeholder="考核周期"
                        style={{ width: 120 }}
                        allowClear
                        value={cycleFilter}
                        onChange={setCycleFilter}
                        options={[
                          { label: '全部', value: undefined },
                          { label: '季度', value: '季度' },
                          { label: '半年', value: '半年' },
                          { label: '全年', value: '全年' },
                        ]}
                      />
                    </Col>
                    <Col>
                      <Select
                        placeholder="岗位"
                        style={{ width: 150 }}
                        allowClear
                        value={positionFilter}
                        onChange={setPositionFilter}
                        options={positionOptions.map((p) => ({ label: p, value: p }))}
                      />
                    </Col>
                    <Col>
                      <Select
                        placeholder="部门"
                        style={{ width: 150 }}
                        allowClear
                        value={deptFilter}
                        onChange={setDeptFilter}
                        options={deptOptions.map((d) => ({ label: d, value: d }))}
                      />
                    </Col>
                  </Row>
                  <Table
                    columns={recordColumns}
                    dataSource={filteredRecords}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                    pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
                  />
                </>
              ),
            },
            {
              key: 'configs',
              label: '考核配置',
              children: (
                <>
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddConfig}>新增考核</Button>
                  </div>
                  <Table
                    columns={configColumns}
                    dataSource={configs}
                    rowKey="id"
                    scroll={{ x: 1000 }}
                    pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingConfig ? '编辑考核配置' : '新增考核配置'}
        open={configModalVisible}
        onOk={handleConfigSubmit}
        onCancel={() => { setConfigModalVisible(false); form.resetFields(); }}
        width={560}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="考核名称" rules={[{ required: true, message: '请输入考核名称' }]}>
            <Input placeholder="请输入考核名称" />
          </Form.Item>
          <Form.Item name="cycle" label="考核周期" rules={[{ required: true, message: '请选择考核周期' }]}>
            <Select
              placeholder="请选择周期"
              options={[
                { label: '季度', value: '季度' },
                { label: '半年', value: '半年' },
                { label: '全年', value: '全年' },
              ]}
            />
          </Form.Item>
          <Form.Item name="startDate" label="开始日期" rules={[{ required: true, message: '请选择开始日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="结束日期" rules={[{ required: true, message: '请选择结束日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="metrics" label="考核指标" rules={[{ required: true, message: '请选择考核指标' }]}>
            <Select
              mode="multiple"
              placeholder="请选择考核指标"
              options={metricsOptions.map((m) => ({ label: m, value: m }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssessmentManagement;
