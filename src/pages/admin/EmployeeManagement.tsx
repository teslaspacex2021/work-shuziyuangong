import React, { useMemo, useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Avatar, Modal, Input, Select,
  Row, Col, Statistic, Badge, message, Switch, Empty,
} from 'antd';
import {
  SearchOutlined, ThunderboltOutlined, DatabaseOutlined, FileTextOutlined,
  BookOutlined, SyncOutlined, PlusOutlined, ControlOutlined, DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  digitalEmployees, skills, knowledgeBases,
  hasEmployeeNumber, getEffectiveEmploymentStatus,
  FEATURE_FLAG_META, DEFAULT_FEATURE_FLAGS, getEmployeeFeatureFlags,
  getEmployeeCapabilityLevel,
  type DigitalEmployee, type EmployeeFeatureFlags,
} from '../../mock/data';
import CapabilityLevelTag from '../../components/CapabilityLevelTag';
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
  const [deptFilter, setDeptFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [runStatusFilter, setRunStatusFilter] = useState<string | undefined>(undefined);
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedDept, setAppliedDept] = useState<string | undefined>(undefined);
  const [appliedStatus, setAppliedStatus] = useState<string | undefined>(undefined);
  const [appliedRunStatus, setAppliedRunStatus] = useState<string | undefined>(undefined);
  const [addVisible, setAddVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedKBIds, setSelectedKBIds] = useState<string[]>([]);
  const [featureFlags, setFeatureFlags] = useState<EmployeeFeatureFlags>({ ...DEFAULT_FEATURE_FLAGS });
  const [pickerType, setPickerType] = useState<AiToolPickerType | null>(null);

  const departmentOptions = useMemo(
    () => [...new Set(employees.map((e) => e.department).filter(Boolean))].map((d) => ({ label: d, value: d })),
    [employees],
  );

  const filtered = employees.filter((e) => {
    const empNo = e.employeeNumber ?? '';
    const matchSearch =
      !appliedSearch
      || e.name.includes(appliedSearch)
      || empNo.includes(appliedSearch)
      || e.id.includes(appliedSearch)
      || e.department.includes(appliedSearch)
      || e.position.includes(appliedSearch);
    const effectiveStatus = getEffectiveEmploymentStatus(e);
    const matchStatus = !appliedStatus || effectiveStatus === appliedStatus;
    const matchDept = !appliedDept || e.department === appliedDept;
    const matchRun = !appliedRunStatus || e.status === appliedRunStatus;
    return matchSearch && matchStatus && matchDept && matchRun;
  });

  const handleSearch = () => {
    setAppliedSearch(searchText.trim());
    setAppliedDept(deptFilter);
    setAppliedStatus(statusFilter);
    setAppliedRunStatus(runStatusFilter);
  };

  const handleReset = () => {
    setSearchText('');
    setDeptFilter(undefined);
    setStatusFilter(undefined);
    setRunStatusFilter(undefined);
    setAppliedSearch('');
    setAppliedDept(undefined);
    setAppliedStatus(undefined);
    setAppliedRunStatus(undefined);
  };

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
      title: 'ID',
      key: 'id',
      width: 120,
      render: (_: unknown, record: DigitalEmployee) => (
        <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
          {record.employeeNumber || record.id}
        </span>
      ),
    },
    {
      title: '数字员工', key: 'name', width: 200,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Badge dot color={record.status === 'ACTIVE' ? '#52c41a' : record.status === 'TRAINING' ? '#722ed1' : '#faad14'} offset={[-2, 32]}>
            <Avatar src={record.avatar} size={36} />
          </Badge>
          <div>
            <div style={{ fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>{record.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{record.owner}（{record.ownerType}）</div>
          </div>
        </Space>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 140,
      ellipsis: true,
    },
    {
      title: '岗位',
      dataIndex: 'position',
      key: 'position',
      width: 200,
      ellipsis: true,
    },
    {
      title: '所属条线', dataIndex: 'businessLine', key: 'businessLine', width: 100,
      render: (v: string | undefined) => v ? <Tag>{v}</Tag> : <span style={{ color: '#999' }}>—</span>,
    },
    {
      title: '级别', key: 'capabilityLevel', width: 100,
      render: (_: unknown, record: DigitalEmployee) => (
        <CapabilityLevelTag level={getEmployeeCapabilityLevel(record)} />
      ),
    },
    {
      title: '配置技能', key: 'skills', width: 240,
      render: (_: unknown, record: DigitalEmployee) => {
        const shown = record.skills.slice(0, 3);
        const rest = record.skills.length - 3;
        if (shown.length === 0) return <span style={{ color: '#999', fontSize: 12 }}>暂未配置</span>;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {shown.map((s) => (
              <Tag key={s} className="admin-skill-tag">{s}</Tag>
            ))}
            {rest > 0 && <Tag className="admin-skill-tag">+{rest}</Tag>}
          </div>
        );
      },
    },
    {
      title: '关联智能体',
      key: 'relatedAgents',
      width: 160,
      render: (_: unknown, record: DigitalEmployee) => {
        const agents = record.relatedAgents ?? [];
        if (!agents.length) return <span style={{ color: '#999', fontSize: 12 }}>—</span>;
        const shown = agents.slice(0, 2);
        const rest = agents.length - 2;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {shown.map((a) => (
              <Tag key={a} className="admin-skill-tag">{a}</Tag>
            ))}
            {rest > 0 && <Tag className="admin-skill-tag">+{rest}</Tag>}
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
      title: '操作', key: 'action', width: 140, fixed: 'right' as const,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space size={8}>
          <Button type="link" className="admin-link-btn" onClick={() => openConfig(record)}>
            配置
          </Button>
          <Button type="link" className="admin-link-btn" onClick={() => showDetail(record)}>
            查看详情
          </Button>
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
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card className="admin-stat-card" size="small">
            <Statistic title="数字员工总数" value={employees.length} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="admin-stat-card" size="small">
            <Statistic title="在职" value={inServiceCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="admin-stat-card" size="small">
            <Statistic title="在线" value={activeCount} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="admin-stat-card" size="small">
            <Statistic title="训练中" value={trainingCount} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      <Card className="admin-panel" styles={{ body: { paddingBottom: 12 } }}>
        <div className="admin-filter-bar">
          <Input
            placeholder="关键词（名称/工号/部门）"
            prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="部门"
            style={{ width: 160 }}
            allowClear
            value={deptFilter}
            onChange={setDeptFilter}
            options={departmentOptions}
          />
          <Select
            placeholder="在岗状态"
            style={{ width: 120 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '在职', value: '在职' },
              { label: '离职', value: '离职' },
            ]}
          />
          <Select
            placeholder="运行状态"
            style={{ width: 120 }}
            allowClear
            value={runStatusFilter}
            onChange={setRunStatusFilter}
            options={[
              { label: '在线', value: 'ACTIVE' },
              { label: '训练中', value: 'TRAINING' },
              { label: '已暂停', value: 'SUSPENDED' },
              { label: '已停用', value: 'TERMINATED' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>查询</Button>
          <Button onClick={handleReset}>重置</Button>
        </div>

        <div className="admin-table-toolbar">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
            新增员工
          </Button>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleSearch}
            aria-label="刷新列表"
          />
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          size="middle"
          scroll={{ x: 1400 }}
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
                    <ThunderboltOutlined style={{ color: '#1677ff' }} />
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
