import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Avatar, Modal, Input, Select,
  Row, Col, Statistic, Badge, message, Switch, Tooltip, Empty,
} from 'antd';
import {
  SearchOutlined, SettingOutlined, TeamOutlined,
  ThunderboltOutlined, DatabaseOutlined, FileTextOutlined,
  BookOutlined, InfoCircleOutlined, SyncOutlined,
  CheckCircleOutlined, ExperimentOutlined,
  PlusOutlined, ControlOutlined, DeleteOutlined,
} from '@ant-design/icons';
import {
  digitalEmployees, skills, knowledgeBases,
  hasEmployeeNumber, getEffectiveEmploymentStatus,
  FEATURE_FLAG_META, DEFAULT_FEATURE_FLAGS, getEmployeeFeatureFlags,
  type DigitalEmployee, type EmployeeFeatureFlags,
} from '../../mock/data';
import EmployeeFormModal, { fullHeightModalStyles, type EmployeeFormValues } from '../../components/EmployeeFormModal';
import EmployeeFieldSections from '../../components/EmployeeFieldSections';
import AiToolPickerModal, { type AiToolPickerItem, type AiToolPickerType } from '../../components/AiToolPickerModal';

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
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedKBIds, setSelectedKBIds] = useState<string[]>([]);
  const [featureFlags, setFeatureFlags] = useState<EmployeeFeatureFlags>({ ...DEFAULT_FEATURE_FLAGS });
  const [pickerType, setPickerType] = useState<AiToolPickerType | null>(null);

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

  const openConfig = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setSelectedSkillIds([...emp.skillIds]);
    setSelectedKBIds([...emp.knowledgeIds]);
    setFeatureFlags(getEmployeeFeatureFlags(emp));
    setConfigVisible(true);
  };

  const removeSkill = (id: string) => {
    setSelectedSkillIds((prev) => prev.filter((x) => x !== id));
  };

  const removeKnowledge = (id: string) => {
    setSelectedKBIds((prev) => prev.filter((x) => x !== id));
  };

  const skillPickerItems: AiToolPickerItem[] = skills.map((s) => ({
    id: s.id,
    name: s.name,
    desc: `${s.category} · ${s.description}`,
    icon: '⚡',
    color: levelColor[s.level] || '#1677ff',
    selected: selectedSkillIds.includes(s.id),
  }));

  const knowledgePickerItems: AiToolPickerItem[] = knowledgeBases.map((kb) => ({
    id: kb.id,
    name: kb.name,
    desc: `${kb.type} · ${kb.description}`,
    icon: kb.type === '知识卡片' ? '📄' : kb.type === '数据集' ? '📊' : '📘',
    color: kb.type === '知识卡片' ? '#52c41a' : kb.type === '数据集' ? '#722ed1' : '#1677ff',
    selected: selectedKBIds.includes(kb.id),
  }));

  const handlePickerSelectionChange = (type: AiToolPickerType, selected: AiToolPickerItem[]) => {
    const ids = selected.map((item) => item.id);
    if (type === 'skill') setSelectedSkillIds(ids);
    if (type === 'knowledge') setSelectedKBIds(ids);
  };

  const saveConfig = () => {
    if (!selectedEmployee) return;
    const newSkillNames = skills.filter((s) => selectedSkillIds.includes(s.id)).map((s) => s.name);
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === selectedEmployee.id
          ? {
              ...e,
              skillIds: selectedSkillIds,
              skills: newSkillNames,
              knowledgeIds: selectedKBIds,
              featureFlags: { ...featureFlags },
            }
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
    const empNo = values.employeeNumber.trim().toUpperCase();
    const duplicated = employees.some(
      (e) => e.id === empNo || e.employeeNumber?.trim().toUpperCase() === empNo,
    );
    if (duplicated) {
      message.error('该工号已被其他数字员工使用');
      return;
    }

    const id = empNo || generateEmployeeId(employees);
    const today = new Date().toISOString().slice(0, 10);
    const onboardDate = values.onboardDate
      ? values.onboardDate.format('YYYY-MM-DD')
      : today;
    const displayName = values.alias?.trim() || values.name.trim();
    const newEmp: DigitalEmployee = {
      id,
      employeeNumber: empNo,
      positionName: values.name.trim(),
      name: displayName,
      avatar: values.avatar
        ?? `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b6e3f4`,
      department: values.department,
      position: values.position.trim(),
      status: 'TRAINING',
      employmentStatus: '离职',
      owner: values.operationOwner.trim(),
      ownerType: values.ownerType,
      skills: [],
      skillIds: [],
      knowledgeIds: [],
      description: values.responsibility.trim(),
      level: capabilityToLevel(values.capabilityLevel),
      tokensQuota: 2000000,
      tokensUsed: 0,
      taskCompleteRate: 0,
      lastActive: '尚未上线',
      onboardDate,
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
      featureFlags: { ...DEFAULT_FEATURE_FLAGS },
      suggestedQuestions: [],
    };
    setEmployees((prev) => [newEmp, ...prev]);
    message.success(`已创建数字员工「${newEmp.name}」，可设为在职`);
    setAddVisible(false);
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
      title: '操作', key: 'action', width: 100, fixed: 'right' as const,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space size={4}>
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

  const selectedSkills = skills.filter((s) => selectedSkillIds.includes(s.id));
  const selectedKBs = knowledgeBases.filter((k) => selectedKBIds.includes(k.id));
  const availableSkills = skills.filter((s) => !selectedSkillIds.includes(s.id));
  const availableKBs = knowledgeBases.filter((k) => !selectedKBIds.includes(k.id));

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

      {/* Config Modal: left skills/knowledge tabs, right feature config */}
      <Modal
        title={`配置 — ${selectedEmployee?.name}`}
        open={configVisible}
        onCancel={() => setConfigVisible(false)}
        onOk={saveConfig}
        okText="提交审批"
        width={1080}
        styles={{ body: { paddingTop: 12 } }}
      >
        {selectedEmployee && (
          <div style={{ display: 'flex', gap: 0, minHeight: 420, border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ flex: 1, minWidth: 0, padding: '12px 16px 16px', overflow: 'auto' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>基础配置</div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
                仅展示已配置项；点击加号添加，点击删除移除
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ThunderboltOutlined style={{ color: '#e4393c' }} />
                    技能配置
                    <Tag style={{ marginLeft: 4 }}>{selectedSkills.length}</Tag>
                  </div>
                  <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    disabled={!availableSkills.length}
                    onClick={() => setPickerType('skill')}
                  >
                    添加技能
                  </Button>
                </div>
                {!selectedSkills.length ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂未配置技能，点击右上角添加"
                    style={{ margin: '12px 0' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedSkills.map((skill) => (
                      <div
                        key={skill.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                          background: '#fff',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 500 }}>{skill.name}</span>
                            <Tag color={levelColor[skill.level]} style={{ fontSize: 10, color: '#fff', margin: 0 }}>
                              {skill.level}
                            </Tag>
                            <Tag style={{ fontSize: 10, margin: 0 }}>{skill.category}</Tag>
                          </div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{skill.description}</div>
                        </div>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          aria-label={`移除技能 ${skill.name}`}
                          onClick={() => removeSkill(skill.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DatabaseOutlined style={{ color: '#1677ff' }} />
                    知识配置
                    <Tag style={{ marginLeft: 4 }}>{selectedKBs.length}</Tag>
                  </div>
                  <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    disabled={!availableKBs.length}
                    onClick={() => setPickerType('knowledge')}
                  >
                    添加知识
                  </Button>
                </div>
                {!selectedKBs.length ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂未配置知识，点击右上角添加"
                    style={{ margin: '12px 0' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedKBs.map((kb) => (
                      <div
                        key={kb.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                          background: '#fff',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {typeIcon[kb.type]}
                            <span style={{ fontWeight: 500 }}>{kb.name}</span>
                            <Tag
                              color={kb.status === '已发布' ? 'success' : kb.status === '学习中' ? 'processing' : 'warning'}
                              style={{ fontSize: 10, margin: 0 }}
                            >
                              {kb.status === '学习中' && <SyncOutlined spin style={{ marginRight: 2 }} />}
                              {kb.status}
                            </Tag>
                          </div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{kb.description}</div>
                          <div style={{ fontSize: 11, color: '#1677ff', marginTop: 2 }}>
                            {kb.type} · {kb.docCount} 篇文档
                          </div>
                        </div>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          aria-label={`移除知识 ${kb.name}`}
                          onClick={() => removeKnowledge(kb.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                width: 300,
                flexShrink: 0,
                borderLeft: '1px solid #f0f0f0',
                background: '#fafafa',
                padding: '16px 14px',
                overflow: 'auto',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ControlOutlined />
                功能配置
              </div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 14, lineHeight: 1.5 }}>
                仅开启的功能会在用户端对话框底部展示入口，关闭后入口不可见
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FEATURE_FLAG_META
                  .filter((item) => item.key !== 'deepThinking' && item.key !== 'webSearch')
                  .map((item) => (
                    <Card key={item.key} size="small" style={{ borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{item.description}</div>
                        </div>
                        <Switch
                          size="small"
                          checked={featureFlags[item.key]}
                          checkedChildren="开"
                          unCheckedChildren="关"
                          onChange={(checked) =>
                            setFeatureFlags((prev) => ({ ...prev, [item.key]: checked }))
                          }
                        />
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <AiToolPickerModal
        open={!!pickerType}
        type={pickerType}
        items={pickerType === 'skill' ? skillPickerItems : pickerType === 'knowledge' ? knowledgePickerItems : undefined}
        showCreate={pickerType === 'skill'}
        onClose={() => setPickerType(null)}
        onSelectionChange={handlePickerSelectionChange}
      />

      {/* Detail Modal */}
      <Modal
        title={`员工详情 — ${selectedEmployee?.name}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={900}
        centered={false}
        style={{ top: 0, paddingBottom: 0, maxWidth: '100vw' }}
        styles={fullHeightModalStyles}
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
