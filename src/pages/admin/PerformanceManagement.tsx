import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Modal, Select, Row, Col, Steps,
  Descriptions, Progress, message, Form, Input, Tabs, DatePicker,
  Avatar,
} from 'antd';
import {
  EyeOutlined,
  EditOutlined, FileTextOutlined, ArrowLeftOutlined,
  PlusOutlined, DeleteOutlined, TrophyOutlined, LoginOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  performanceReviews, digitalEmployees,
  assessmentRecords, assessmentConfigs,
  type PerformanceReview, type PerformanceEmployeeRecord,
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

const PerformanceManagement: React.FC = () => {
  const [reviews] = useState(performanceReviews);
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [periodFilter, setPeriodFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [detailReview, setDetailReview] = useState<PerformanceReview | null>(null);
  const [actionVisible, setActionVisible] = useState(false);
  const [actionType] = useState('');
  const [selectedEmpRecord, setSelectedEmpRecord] = useState<PerformanceEmployeeRecord | null>(null);
  const [empDetailVisible, setEmpDetailVisible] = useState(false);
  const [actionForm] = Form.useForm();

  // Assessment config state (restored from original)
  const [configs, setConfigs] = useState<AssessmentConfig[]>(assessmentConfigs);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AssessmentConfig | null>(null);
  const [configForm] = Form.useForm();

  // Assessment records filters
  const [cycleFilter, setCycleFilter] = useState<string | undefined>(undefined);
  const [positionFilter, setPositionFilter] = useState<string | undefined>(undefined);
  const [deptFilter, setDeptFilter] = useState<string | undefined>(undefined);
  const [recordYearFilter, setRecordYearFilter] = useState<string | undefined>(undefined);
  const [recordStatusFilter, setRecordStatusFilter] = useState<string | undefined>(undefined);

  const filteredReviews = reviews.filter((r) => {
    const matchYear = !yearFilter || r.year === yearFilter;
    const matchPeriod = !periodFilter || r.period === periodFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchYear && matchPeriod && matchStatus;
  });

  const years = [...new Set(reviews.map((r) => r.year))].sort((a, b) => b - a);
  const periods = [...new Set(reviews.map((r) => r.period))];

  const showEmpDetail = (emp: PerformanceEmployeeRecord) => {
    setSelectedEmpRecord(emp);
    setEmpDetailVisible(true);
  };


  const submitAction = () => {
    actionForm.validateFields().then(() => {
      message.success(`${actionType} 已提交`);
      setActionVisible(false);
    });
  };

  // Assessment records
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
      const matchYear = !recordYearFilter || r.period.startsWith(recordYearFilter);
      const deriveStatus = (score: number) => score >= 60 ? '已通过' : '未通过';
      const matchStatus = !recordStatusFilter || deriveStatus(r.score) === recordStatusFilter;
      return matchCycle && matchPosition && matchDept && matchYear && matchStatus;
    });
  }, [sortedRecords, cycleFilter, positionFilter, deptFilter, recordYearFilter, recordStatusFilter]);

  const positionOptions = useMemo(
    () => [...new Set(assessmentRecords.map((r) => r.position))],
    [],
  );
  const deptOptions = useMemo(
    () => [...new Set(assessmentRecords.map((r) => r.department))],
    [],
  );
  const recordYearOptions = useMemo(
    () => [...new Set(assessmentRecords.map((r) => r.period.split('-')[0]))].sort((a, b) => b.localeCompare(a)),
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

  // Config CRUD
  const handleAddConfig = () => {
    setEditingConfig(null);
    configForm.resetFields();
    setConfigModalVisible(true);
  };

  const handleEditConfig = (record: AssessmentConfig) => {
    setEditingConfig(record);
    configForm.setFieldsValue({
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
    configForm.validateFields().then((values) => {
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
      configForm.resetFields();
    });
  };

  const columns: ColumnsType<PerformanceReview> = [
    { title: '年度', dataIndex: 'year', key: 'year', width: 80 },
    {
      title: '周期', dataIndex: 'period', key: 'period', width: 100,
      render: (p: string) => <Tag>{p}</Tag>,
    },
    {
      title: '活动名称', dataIndex: 'name', key: 'name', width: 260,
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: '当前步骤', dataIndex: 'currentStep', key: 'currentStep', width: 120,
      render: (step: string) => step === '--' ? <span style={{ color: '#999' }}>--</span> : <Tag color="processing">{step}</Tag>,
    },
    {
      title: '绩效状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => (
        <Tag color={status === '进行中' ? 'processing' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 120, fixed: 'right',
      render: (_, record) => (
        <Button type="primary" size="small" icon={<LoginOutlined />} onClick={() => setDetailReview(record)}>进入</Button>
      ),
    },
  ];

  const empColumns: ColumnsType<PerformanceEmployeeRecord> = [
    {
      title: '年度', key: 'reviewYear', width: 80,
      render: () => detailReview?.year,
    },
    {
      title: '周期', key: 'reviewPeriod', width: 100,
      render: () => <Tag>{detailReview?.period}</Tag>,
    },
    {
      title: '活动名称', key: 'reviewName', width: 200,
      render: () => <span style={{ fontWeight: 500 }}>{detailReview?.name}</span>,
    },
    {
      title: '当前步骤', key: 'reviewStep', width: 120,
      render: () => detailReview?.currentStep === '--'
        ? <span style={{ color: '#999' }}>--</span>
        : <Tag color="processing">{detailReview?.currentStep}</Tag>,
    },
    {
      title: '考核状态', key: 'reviewStatus', width: 100,
      render: () => (
        <Tag color={detailReview?.status === '进行中' ? 'processing' : 'default'}>{detailReview?.status}</Tag>
      ),
    },
    { title: '员工名称', dataIndex: 'employeeName', key: 'employeeName', width: 120 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 120 },
    {
      title: '任务完成率', dataIndex: 'taskCompleteRate', key: 'taskCompleteRate', width: 150,
      render: (v: number) => <Progress percent={v} size="small" style={{ width: 100 }} />,
    },
    {
      title: 'Tokens消耗', key: 'tokensUsed', width: 100,
      render: (_, r) => `${(r.tokensUsed / 10000).toFixed(0)}万`,
    },
    {
      title: '职级', dataIndex: 'level', key: 'level', width: 80,
      render: (l: string) => <Tag color="blue">{l}</Tag>,
    },
    {
      title: '综合评分', dataIndex: 'score', key: 'score', width: 100,
      render: (s: number) => (
        <span style={{ fontWeight: 700, fontSize: 16, color: s >= 90 ? '#52c41a' : s >= 80 ? '#1677ff' : '#faad14' }}>{s}</span>
      ),
    },
    {
      title: '操作', key: 'action', width: 80,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => showEmpDetail(record)}>详情</Button>
      ),
    },
  ];

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
      render: (_: unknown, record: AssessmentRecord & { rank: number }) => {
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
      render: (_: unknown, record: AssessmentRecord) => `${(record.tokensUsed / 10000).toFixed(0)}万`,
    },
    {
      title: '职级', dataIndex: 'level', key: 'level', width: 90,
      render: (level: string) => (
        <Tag color={levelColorMap[level]} style={{ color: level === 'L4' ? '#fff' : undefined }}>{level}</Tag>
      ),
    },
    {
      title: '综合评分', dataIndex: 'score', key: 'score', width: 100, align: 'center',
      sorter: (a: AssessmentRecord & { rank: number }, b: AssessmentRecord & { rank: number }) => a.score - b.score,
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
      render: (_: unknown, record: AssessmentConfig) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditConfig(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteConfig(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  // Detail sub-page for a specific review
  if (detailReview) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => setDetailReview(null)}>返回列表</Button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{detailReview.name}</h2>
          <Tag color={detailReview.status === '进行中' ? 'processing' : 'default'}>{detailReview.status}</Tag>
        </div>

        <Card style={{ borderRadius: 12, marginBottom: 20 }}>
          <Descriptions column={4} size="small">
            <Descriptions.Item label="年度">{detailReview.year}</Descriptions.Item>
            <Descriptions.Item label="周期">{detailReview.period}</Descriptions.Item>
            <Descriptions.Item label="类型">{detailReview.periodType}</Descriptions.Item>
            <Descriptions.Item label="当前环节">
              {detailReview.currentStep === '--' ? '--' : <Tag color="processing">{detailReview.currentStep}</Tag>}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {detailReview.employees.length > 0 && (
          <Card title={`考核员工列表（共 ${detailReview.employees.length} 人）`} size="small" style={{ borderRadius: 12 }}>
            <Table
              columns={empColumns}
              dataSource={detailReview.employees}
              rowKey="employeeId"
              pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
              size="small"
              scroll={{ x: 900 }}
            />
          </Card>
        )}

        {/* Employee Performance Detail Modal */}
        <Modal
          title={`绩效详情 — ${selectedEmpRecord?.employeeName}`}
          open={empDetailVisible}
          onCancel={() => setEmpDetailVisible(false)}
          footer={null}
          width={700}
        >
          {selectedEmpRecord && (
            <div>
              <Card size="small" title="绩效考核流程" style={{ marginBottom: 16, borderRadius: 8 }}>
                <Steps
                  current={detailReview.steps.findIndex((s) => s.status === '进行中')}
                  size="small"
                  items={detailReview.steps.map((step) => ({
                    title: step.label,
                    description: step.deadline ? `截止 ${step.deadline}` : undefined,
                    status: step.status === '已完成' ? 'finish' : step.status === '进行中' ? 'process' : 'wait',
                  }))}
                />
              </Card>
              <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="员工">{selectedEmpRecord.employeeName}</Descriptions.Item>
                <Descriptions.Item label="部门">{selectedEmpRecord.department}</Descriptions.Item>
                <Descriptions.Item label="岗位">{selectedEmpRecord.position}</Descriptions.Item>
                <Descriptions.Item label="职级"><Tag color="blue">{selectedEmpRecord.level}</Tag></Descriptions.Item>
                <Descriptions.Item label="任务完成率" span={2}>
                  <Progress percent={selectedEmpRecord.taskCompleteRate} size="small" style={{ width: 200 }} />
                </Descriptions.Item>
                <Descriptions.Item label="Tokens消耗">{(selectedEmpRecord.tokensUsed / 10000).toFixed(0)}万</Descriptions.Item>
                <Descriptions.Item label="综合评分">
                  <span style={{ fontWeight: 700, fontSize: 20, color: selectedEmpRecord.score >= 90 ? '#52c41a' : '#1677ff' }}>
                    {selectedEmpRecord.score}
                  </span>
                </Descriptions.Item>
              </Descriptions>
              {selectedEmpRecord.selfEvaluation && (
                <Card size="small" title="自我评价" style={{ marginBottom: 12, borderRadius: 8 }}>
                  <p style={{ margin: 0, color: '#666' }}>{selectedEmpRecord.selfEvaluation}</p>
                </Card>
              )}
              {selectedEmpRecord.managerEvaluation && (
                <Card size="small" title="主管评价" style={{ borderRadius: 8 }}>
                  <p style={{ margin: 0, color: '#666' }}>{selectedEmpRecord.managerEvaluation}</p>
                </Card>
              )}
            </div>
          )}
        </Modal>

        {/* Action Modal */}
        <Modal
          title={`${actionType} — ${detailReview?.name}`}
          open={actionVisible}
          onCancel={() => setActionVisible(false)}
          onOk={submitAction}
          okText="提交"
          width={560}
        >
          <Form form={actionForm} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="content" label={`${actionType}内容`} rules={[{ required: true, message: '请填写内容' }]}>
              <Input.TextArea rows={4} placeholder={`请填写${actionType}内容...`} />
            </Form.Item>
            <Form.Item name="score" label="评分" rules={[{ required: true, message: '请输入评分' }]}>
              <Input type="number" placeholder="请输入评分（0-100）" suffix="分" />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} placeholder="补充说明（选填）" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        绩效管理
      </h2>
      <p style={{ color: '#999', marginBottom: 20 }}>人力部每个季度发起绩效考核流程，管理数字员工的绩效评定</p>

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="reviews"
          items={[
            {
              key: 'reviews',
              label: '绩效考核',
              children: (
                <>
                  <Row gutter={12} style={{ marginBottom: 16 }}>
                    <Col>
                      <Select
                        placeholder="年度"
                        style={{ width: 100 }}
                        allowClear
                        value={yearFilter}
                        onChange={setYearFilter}
                        options={years.map((y) => ({ label: `${y}`, value: y }))}
                      />
                    </Col>
                    <Col>
                      <Select
                        placeholder="周期"
                        style={{ width: 120 }}
                        allowClear
                        value={periodFilter}
                        onChange={setPeriodFilter}
                        options={periods.map((p) => ({ label: p, value: p }))}
                      />
                    </Col>
                    <Col>
                      <Select
                        placeholder="绩效状态"
                        style={{ width: 120 }}
                        allowClear
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                          { label: '进行中', value: '进行中' },
                          { label: '已结束', value: '已结束' },
                        ]}
                      />
                    </Col>
                  </Row>

                  <Table
                    columns={columns}
                    dataSource={filteredReviews}
                    rowKey="id"
                    pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
                    scroll={{ x: 900 }}
                  />
                </>
              ),
            },
            {
              key: 'records',
              label: '考核记录',
              children: (
                <>
                  <Row gutter={12} style={{ marginBottom: 16 }}>
                    <Col>
                      <Select
                        placeholder="年度"
                        style={{ width: 100 }}
                        allowClear
                        value={recordYearFilter}
                        onChange={setRecordYearFilter}
                        options={recordYearOptions.map((y) => ({ label: y, value: y }))}
                      />
                    </Col>
                    <Col>
                      <Select
                        placeholder="考核周期"
                        style={{ width: 120 }}
                        allowClear
                        value={cycleFilter}
                        onChange={setCycleFilter}
                        options={[
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
                    <Col>
                      <Select
                        placeholder="考核状态"
                        style={{ width: 120 }}
                        allowClear
                        value={recordStatusFilter}
                        onChange={setRecordStatusFilter}
                        options={[
                          { label: '已通过', value: '已通过' },
                          { label: '未通过', value: '未通过' },
                        ]}
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

      {/* Config Modal */}
      <Modal
        title={editingConfig ? '编辑考核配置' : '新增考核配置'}
        open={configModalVisible}
        onOk={handleConfigSubmit}
        onCancel={() => { setConfigModalVisible(false); configForm.resetFields(); }}
        width={560}
        destroyOnHidden
      >
        <Form form={configForm} layout="vertical" style={{ marginTop: 16 }}>
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
          <Form.Item name="scope" label="考核范围">
            <Select
              mode="multiple"
              placeholder="请选择考核范围（部门/人员）"
              options={[...new Set(digitalEmployees.map((e) => e.department))].map((d) => ({ label: d, value: d }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PerformanceManagement;
