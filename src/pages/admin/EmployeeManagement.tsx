import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Avatar, Modal, Input, Select,
  Row, Col, Statistic, Checkbox, Badge, message, Tabs,
  Tooltip, Form, Alert,
} from 'antd';
import {
  SearchOutlined, SettingOutlined, TeamOutlined,
  ThunderboltOutlined, DatabaseOutlined, FileTextOutlined,
  BookOutlined, InfoCircleOutlined, SyncOutlined,
  CheckCircleOutlined, ExperimentOutlined,
  IdcardOutlined, PlusOutlined,
} from '@ant-design/icons';
import {
  digitalEmployees, skills, knowledgeBases,
  hasEmployeeNumber, getEffectiveEmploymentStatus, canBeInService,
  type DigitalEmployee, type Skill, type KnowledgeBase, type BusinessLine,
} from '../../mock/data';
import EmployeeFormModal, { type EmployeeFormValues } from '../../components/EmployeeFormModal';
import EmployeeFieldSections from '../../components/EmployeeFieldSections';

const levelColor: Record<string, string> = {
  L1: '#8c8c8c', L2: '#2f54eb', L3: '#1677ff', L4: '#13c2c2',
};

const statusLabelMap: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};

const statusColorMap: Record<string, string> = {
  ACTIVE: 'success', TRAINING: 'processing', SUSPENDED: 'warning', TERMINATED: 'error',
};

const typeIcon: Record<string, React.ReactNode> = {
  '知识库': <DatabaseOutlined style={{ color: '#1677ff' }} />,
  '知识卡片': <FileTextOutlined style={{ color: '#52c41a' }} />,
  '数据集': <BookOutlined style={{ color: '#722ed1' }} />,
};

const businessLineDeptMap: Partial<Record<BusinessLine, string>> = {
  客服: '客户服务部', 研发: '数据运营中心', 市场: '数字化运营部', 审计: '审计部',
  财务: '财务共享中心', 人力: '人力资源部', 云网: 'IT运维部', 政企: '数字化运营部',
  数发: '数据运营中心',
};

const capabilityToLevel = (cap: EmployeeFormValues['capabilityLevel']): DigitalEmployee['level'] => {
  if (cap === '超级型') return 'L4';
  if (cap === '智能型') return 'L3';
  return 'L2';
};

const generateEmployeeId = (list: DigitalEmployee[]): string => {
  const maxNum = list.reduce((max, e) => {
    const m = e.id.match(/^DE-(\d+)$/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 2026000);
  return `DE-${maxNum + 1}`;
};

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState(digitalEmployees);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [addVisible, setAddVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [configTab, setConfigTab] = useState('skills');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedKBIds, setSelectedKBIds] = useState<string[]>([]);
  const [employeeNumberVisible, setEmployeeNumberVisible] = useState(false);
  const [employeeNumberForm] = Form.useForm<{ employeeNumber: string; setInService?: boolean }>();
  const draftEmployeeNumber = Form.useWatch('employeeNumber', employeeNumberForm);

  const filtered = employees.filter((e) => {
    const empNo = e.employeeNumber ?? '';
    const matchSearch =
      e.name.includes(searchText)
      || empNo.includes(searchText)
      || e.id.includes(searchText)
      || e.department.includes(searchText);
    const effectiveStatus = getEffectiveEmploymentStatus(e);
    const matchStatus = !statusFilter || effectiveStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const trainingCount = employees.filter((e) => e.status === 'TRAINING').length;
  const inServiceCount = employees.filter((e) => getEffectiveEmploymentStatus(e) === '在职').length;

  const openConfig = (emp: DigitalEmployee, tab: string = 'skills') => {
    setSelectedEmployee(emp);
    setSelectedSkillIds([...emp.skillIds]);
    setSelectedKBIds([...emp.knowledgeIds]);
    setConfigTab(tab);
    setConfigVisible(true);
  };

  const saveConfig = () => {
    if (!selectedEmployee) return;
    const newSkillNames = skills.filter((s) => selectedSkillIds.includes(s.id)).map((s) => s.name);
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === selectedEmployee.id
          ? { ...e, skillIds: selectedSkillIds, skills: newSkillNames, knowledgeIds: selectedKBIds }
          : e,
      ),
    );
    message.success(`已为 ${selectedEmployee.name} 提交配置变更审批`);
    setConfigVisible(false);
  };

  const showDetail = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setDetailVisible(true);
  };

  const createEmployee = (values: EmployeeFormValues) => {
    const id = generateEmployeeId(employees);
    const today = new Date().toISOString().slice(0, 10);
    const newEmp: DigitalEmployee = {
      id,
      name: values.name.trim(),
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(values.name)}&backgroundColor=b6e3f4`,
      department: businessLineDeptMap[values.businessLine] ?? `${values.businessLine}条线`,
      position: values.position.trim(),
      status: 'TRAINING',
      employmentStatus: '离职',
      owner: values.operationOwner.trim(),
      ownerType: '自有',
      skills: [],
      skillIds: [],
      knowledgeIds: [],
      description: values.responsibility.trim(),
      level: capabilityToLevel(values.capabilityLevel),
      tokensQuota: 2000000,
      tokensUsed: 0,
      taskCompleteRate: 0,
      lastActive: '尚未上线',
      onboardDate: today,
      relatedAgents: [],
      likes: 0,
      dislikes: 0,
      heat: 0,
      businessLine: values.businessLine,
      capabilityLevel: values.capabilityLevel,
      responsibility: values.responsibility.trim(),
      operationOwner: values.operationOwner.trim(),
      businessOwner: values.businessOwner.trim(),
      techOwner: values.techOwner.trim(),
      outputMetrics: values.outputMetrics.filter((m) => m.name.trim()),
      designMaxConcurrency: values.designMaxConcurrency,
      designTokensPerSec: values.designTokensPerSec,
      securityPassed: values.securityPassed,
      logAuditCompliant: values.logAuditCompliant,
      runSystems: values.runSystems.filter((s) => s.systemName.trim()),
    };
    setEmployees((prev) => [newEmp, ...prev]);
    message.success(`已创建数字员工「${newEmp.name}」，请填写工号后设为在职`);
    setAddVisible(false);
  };

  const openEmployeeNumberModal = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    employeeNumberForm.setFieldsValue({
      employeeNumber: emp.employeeNumber ?? '',
      setInService: emp.employmentStatus === '离职' && !hasEmployeeNumber(emp),
    });
    setEmployeeNumberVisible(true);
  };

  const saveEmployeeNumber = async () => {
    if (!selectedEmployee) return;
    try {
      const values = await employeeNumberForm.validateFields();
      const trimmed = values.employeeNumber.trim().toUpperCase();
      const duplicated = employees.some(
        (e) => e.id !== selectedEmployee.id && e.employeeNumber?.trim().toUpperCase() === trimmed,
      );
      if (duplicated) {
        message.error('该工号已被其他数字员工使用');
        return;
      }
      const wantInService = Boolean(values.setInService);
      if (wantInService && !trimmed) {
        message.error('未填写工号时不能设为在职');
        return;
      }
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id !== selectedEmployee.id) return e;
          const wasWithoutNumber = !hasEmployeeNumber(e);
          const next: DigitalEmployee = { ...e, employeeNumber: trimmed };
          if (wasWithoutNumber) {
            next.status = 'ACTIVE';
          }
          if (wantInService) {
            if (!canBeInService({ ...next, employeeNumber: trimmed })) {
              return e;
            }
            next.employmentStatus = '在职';
          } else if (e.employmentStatus === '在职' && !trimmed) {
            next.employmentStatus = '离职';
          }
          return next;
        }),
      );
      message.success(
        `已为 ${selectedEmployee.name} 保存工号${wantInService ? '并设为在职' : ''}${!hasEmployeeNumber(selectedEmployee) ? '，运行状态已切换为在线' : ''}`,
      );
      setEmployeeNumberVisible(false);
    } catch {
      /* 表单校验未通过 */
    }
  };

  const columns = [
    {
      title: '数字员工名称', key: 'name', width: 200,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Badge dot color={record.status === 'ACTIVE' ? '#52c41a' : record.status === 'TRAINING' ? '#1677ff' : '#faad14'} offset={[-2, 32]}>
            <Avatar src={record.avatar} />
          </Badge>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 11, color: '#999' }}>{record.owner} ({record.ownerType})</div>
          </div>
        </Space>
      ),
    },
    {
      title: '所属条线', dataIndex: 'businessLine', key: 'businessLine', width: 100,
      render: (v: string | undefined) => v ? <Tag>{v}</Tag> : <span style={{ color: '#999' }}>—</span>,
    },
    { title: '基准岗位', dataIndex: 'position', key: 'position', width: 220 },
    {
      title: '级别', dataIndex: 'capabilityLevel', key: 'capabilityLevel', width: 90,
      render: (v: string | undefined) => v ? <Tag color="blue">{v}</Tag> : <span style={{ color: '#999' }}>—</span>,
    },
    {
      title: '所需技能', key: 'skills', width: 240,
      render: (_: unknown, record: DigitalEmployee) => {
        const shown = record.skills.slice(0, 3);
        const rest = record.skills.length - 3;
        if (shown.length === 0) return <span style={{ color: '#999', fontSize: 12 }}>暂未配置</span>;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {shown.map((s) => <Tag key={s} color="processing" style={{ margin: 0 }}>{s}</Tag>)}
            {rest > 0 && <Tag style={{ margin: 0 }}>+{rest}</Tag>}
          </div>
        );
      },
    },
    {
      title: '在岗/上线', key: 'dutyStatus', width: 120,
      render: (_: unknown, record: DigitalEmployee) => {
        const effective = getEffectiveEmploymentStatus(record);
        return (
          <Space direction="vertical" size={2}>
            {effective === null
              ? <span style={{ color: '#999', fontSize: 12 }}>—</span>
              : <Tag color={effective === '在职' ? 'green' : 'default'}>{effective}</Tag>}
            <Tag color={statusColorMap[record.status]}>{statusLabelMap[record.status] || record.status}</Tag>
          </Space>
        );
      },
    },
    {
      title: '操作', key: 'action', width: 150, fixed: 'right' as const,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space size={4}>
          <Tooltip title={hasEmployeeNumber(record) ? '修改工号' : '填写工号'}>
            <Button
              size="small"
              icon={<IdcardOutlined />}
              onClick={() => openEmployeeNumberModal(record)}
              type={hasEmployeeNumber(record) ? 'default' : 'primary'}
            />
          </Tooltip>
          <Tooltip title="配置">
            <Button type="primary" size="small" icon={<SettingOutlined />} onClick={() => openConfig(record)} />
          </Tooltip>
          <Tooltip title="详情">
            <Button type="text" size="small" icon={<InfoCircleOutlined />} onClick={() => showDetail(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderSkillCard = (skill: Skill) => (
    <Col span={12} key={skill.id}>
      <Card
        size="small"
        hoverable
        style={{
          borderRadius: 8,
          borderColor: selectedSkillIds.includes(skill.id) ? '#1677ff' : '#f0f0f0',
          background: selectedSkillIds.includes(skill.id) ? '#f0f5ff' : '#fff',
        }}
      >
        <Checkbox value={skill.id} style={{ width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 500 }}>{skill.name}</span>
              <Tag color={levelColor[skill.level]} style={{ fontSize: 10, color: '#fff' }}>
                {skill.level}
              </Tag>
              <Tag style={{ fontSize: 10 }}>{skill.category}</Tag>
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{skill.description}</div>
            <div style={{ fontSize: 11, color: '#1677ff', marginTop: 2 }}>来源：{skill.source}</div>
          </div>
        </Checkbox>
      </Card>
    </Col>
  );

  const renderKbCard = (kb: KnowledgeBase) => (
    <Col span={12} key={kb.id}>
      <Card
        size="small"
        hoverable
        style={{
          borderRadius: 8,
          borderColor: selectedKBIds.includes(kb.id) ? '#1677ff' : '#f0f0f0',
          background: selectedKBIds.includes(kb.id) ? '#f0f5ff' : '#fff',
        }}
      >
        <Checkbox value={kb.id} style={{ width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {typeIcon[kb.type]}
              <span style={{ fontWeight: 500 }}>{kb.name}</span>
              <Tag
                color={kb.status === '已发布' ? 'success' : kb.status === '学习中' ? 'processing' : 'warning'}
                style={{ fontSize: 10 }}
              >
                {kb.status === '学习中' && <SyncOutlined spin style={{ marginRight: 2 }} />}
                {kb.status}
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{kb.description}</div>
            <div style={{ fontSize: 11, color: '#1677ff', marginTop: 2 }}>
              {kb.type} · {kb.docCount} 篇文档 · 更新于 {kb.lastUpdate}
            </div>
          </div>
        </Checkbox>
      </Card>
    </Col>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>员工管理</h2>
        <p style={{ color: '#666', margin: 0 }}>
          管理数字员工信息，配置技能与知识资源，全面掌控数字员工能力。
        </p>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="数字员工总数" value={employees.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="在职" value={inServiceCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="在线" value={activeCount} prefix={<CheckCircleOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="训练中" value={trainingCount} prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title="数字员工列表"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
              新增员工
            </Button>
            <Input
              placeholder="搜索员工名称/工号/部门..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="在职状态"
              style={{ width: 100 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: '在职', value: '在职' },
                { label: '离职', value: '离职' },
              ]}
            />
          </Space>
        }
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 1000 }}
        />
      </Card>

      <EmployeeFormModal
        open={addVisible}
        onCancel={() => setAddVisible(false)}
        onSubmit={createEmployee}
      />

      {/* Unified Config Modal with Tabs */}
      <Modal
        title={`配置 — ${selectedEmployee?.name}`}
        open={configVisible}
        onCancel={() => setConfigVisible(false)}
        onOk={saveConfig}
        okText="提交审批"
        width={720}
      >
        {selectedEmployee && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
              <Avatar size={48} src={selectedEmployee.avatar} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedEmployee.name}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{selectedEmployee.department} · {selectedEmployee.position}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{selectedEmployee.description}</div>
              </div>
            </div>
            <Tabs
              activeKey={configTab}
              onChange={setConfigTab}
              items={[
                {
                  key: 'skills',
                  label: <span><ThunderboltOutlined /> 技能配置</span>,
                  children: (
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 12 }}>
                        <InfoCircleOutlined style={{ marginRight: 4 }} />
                        勾选技能后，该数字员工将根据用户输入自动匹配并调用对应技能：
                      </div>
                      <Checkbox.Group
                        value={selectedSkillIds}
                        onChange={(vals) => setSelectedSkillIds(vals as string[])}
                        style={{ width: '100%' }}
                      >
                        <Row gutter={[12, 12]}>
                          {skills.map(renderSkillCard)}
                        </Row>
                      </Checkbox.Group>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
                        已选择 {selectedSkillIds.length} 项技能
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'knowledge',
                  label: <span><DatabaseOutlined /> 知识配置</span>,
                  children: (
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 12 }}>
                        <InfoCircleOutlined style={{ marginRight: 4 }} />
                        勾选知识资源，数字员工将基于这些知识来回答问题和处理任务：
                      </div>
                      <Checkbox.Group
                        value={selectedKBIds}
                        onChange={(vals) => setSelectedKBIds(vals as string[])}
                        style={{ width: '100%' }}
                      >
                        <Row gutter={[12, 12]}>
                          {knowledgeBases.map(renderKbCard)}
                        </Row>
                      </Checkbox.Group>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
                        已选择 {selectedKBIds.length} 个知识资源
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>


      {/* 工号填写 Modal */}
      <Modal
        title={`工号填写 — ${selectedEmployee?.name}`}
        open={employeeNumberVisible}
        onCancel={() => setEmployeeNumberVisible(false)}
        onOk={saveEmployeeNumber}
        okText="保存"
        destroyOnClose
        width={480}
      >
        {selectedEmployee && (
          <Form form={employeeNumberForm} layout="vertical" style={{ marginTop: 8 }}>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="未填写工号的数字员工不能设为在职状态。"
            />
            <Form.Item
              name="employeeNumber"
              label="工号"
              rules={[
                { required: true, message: '请输入工号' },
                { pattern: /^DE-\d{4,}$/i, message: '工号格式应为 DE- 加数字，如 DE-2026011' },
              ]}
            >
              <Input placeholder="例如 DE-2026011" style={{ fontFamily: 'monospace' }} allowClear />
            </Form.Item>
            {selectedEmployee.employmentStatus === '离职' && (
              <Form.Item name="setInService" valuePropName="checked">
                <Checkbox disabled={!draftEmployeeNumber?.trim()}>
                  保存后设为在职（须先填写工号）
                </Checkbox>
              </Form.Item>
            )}
          </Form>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`员工详情 — ${selectedEmployee?.name}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={900}
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
      >
        {selectedEmployee && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <Avatar size={64} src={selectedEmployee.avatar} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{selectedEmployee.name}</div>
                <Space style={{ marginTop: 8 }} wrap>
                  {hasEmployeeNumber(selectedEmployee)
                    ? <Tag style={{ fontFamily: 'monospace' }}>{selectedEmployee.employeeNumber}</Tag>
                    : <Tag color="warning">工号未填写</Tag>}
                  {(() => {
                    const effective = getEffectiveEmploymentStatus(selectedEmployee);
                    if (effective !== null) {
                      return <Tag color={effective === '在职' ? 'green' : 'default'}>{effective}</Tag>;
                    }
                    return null;
                  })()}
                  <Tag color={statusColorMap[selectedEmployee.status]}>{statusLabelMap[selectedEmployee.status]}</Tag>
                </Space>
              </div>
            </div>
            <EmployeeFieldSections employee={selectedEmployee} />
          </div>
        )}
      </Modal>

    </div>
  );
};

export default EmployeeManagement;
