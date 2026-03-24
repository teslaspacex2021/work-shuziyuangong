import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Avatar, Modal, Form, Input, Select,
  Row, Col, Statistic, Descriptions, Checkbox, Badge, message, Tabs, Progress,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, SettingOutlined, TeamOutlined,
  ThunderboltOutlined, DatabaseOutlined, FileTextOutlined,
  BookOutlined, InfoCircleOutlined, SyncOutlined, EditOutlined,
  CheckCircleOutlined, ExperimentOutlined, SolutionOutlined,
} from '@ant-design/icons';
import {
  digitalEmployees, skills, knowledgeBases, positions,
  type DigitalEmployee, type Skill, type KnowledgeBase,
} from '../../mock/data';

const levelColor: Record<string, string> = {
  L1: '#8c8c8c', L2: '#2f54eb', L3: '#1677ff', L4: '#13c2c2',
};

const typeIcon: Record<string, React.ReactNode> = {
  '知识库': <DatabaseOutlined style={{ color: '#1677ff' }} />,
  '知识卡片': <FileTextOutlined style={{ color: '#52c41a' }} />,
  '数据集': <BookOutlined style={{ color: '#722ed1' }} />,
};

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState(digitalEmployees);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [addVisible, setAddVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [configTab, setConfigTab] = useState('skills');
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedKBIds, setSelectedKBIds] = useState<string[]>([]);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [posApplyVisible, setPosApplyVisible] = useState(false);
  const [posApplyForm] = Form.useForm();

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.includes(searchText) || e.id.includes(searchText) || e.department.includes(searchText);
    const matchStatus = !statusFilter || e.employmentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalDocs = knowledgeBases.reduce((s, k) => s + k.docCount, 0);
  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const trainingCount = employees.filter((e) => e.status === 'TRAINING').length;
  const inServiceCount = employees.filter((e) => e.employmentStatus === '在职').length;

  const nextId = `DE-${new Date().getFullYear()}${String(employees.length + 1).padStart(3, '0')}`;

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
    message.success(`已为 ${selectedEmployee.name} 更新配置`);
    setConfigVisible(false);
  };

  const showDetail = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setDetailVisible(true);
  };

  const openEdit = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    editForm.setFieldsValue({
      name: emp.name,
      department: emp.department,
      position: emp.position,
      owner: emp.owner,
      ownerType: emp.ownerType,
      tokensQuota: emp.tokensQuota,
      description: emp.description,
    });
    setEditVisible(true);
  };

  const handleEdit = () => {
    editForm.validateFields().then((values) => {
      if (!selectedEmployee) return;
      setEmployees((prev) =>
        prev.map((e) => e.id === selectedEmployee.id ? { ...e, ...values } : e),
      );
      message.success('员工信息已更新，变更审批已发起');
      setEditVisible(false);
    });
  };

  const handleAddEmployee = () => {
    addForm.validateFields().then((values) => {
      const newEmp: DigitalEmployee = {
        id: nextId,
        name: values.name,
        avatar: values.avatarUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(values.name)}&backgroundColor=b6e3f4`,
        department: values.department,
        position: values.position,
        status: 'TRAINING',
        employmentStatus: '在职',
        owner: values.owner,
        ownerType: values.ownerType,
        skills: [],
        skillIds: [],
        knowledgeIds: [],
        description: values.description || '',
        level: 'L1',
        tokensQuota: Number(values.tokensQuota) || 2000000,
        tokensUsed: 0,
        taskCompleteRate: 0,
        lastActive: '-',
        onboardDate: new Date().toISOString().slice(0, 10),
        relatedAgents: [],
        likes: 0,
        dislikes: 0,
        heat: 0,
      };
      setEmployees((prev) => [...prev, newEmp]);
      message.success('新增员工成功，入职流程已发起');
      addForm.resetFields();
      setAddVisible(false);
    });
  };

  const columns = [
    {
      title: '工号', dataIndex: 'id', key: 'id', width: 120,
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '数字员工', key: 'name', width: 180,
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
    { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 120 },
    {
      title: '已配置技能', key: 'skills', width: 220,
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
      title: '已关联知识', key: 'knowledge', width: 180,
      render: (_: unknown, record: DigitalEmployee) => {
        const kbs = knowledgeBases.filter((kb) => record.knowledgeIds.includes(kb.id));
        if (kbs.length === 0) return <span style={{ color: '#999', fontSize: 12 }}>暂未关联</span>;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {kbs.map((kb) => (
              <Tag key={kb.id} icon={typeIcon[kb.type]} style={{ margin: 0 }}>{kb.name}</Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: '职级', dataIndex: 'level', key: 'level', width: 80,
      render: (l: string) => (
        <Tag color={levelColor[l]} style={{ color: '#fff' }}>{l}</Tag>
      ),
    },
    {
      title: '运行状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => {
        const color = s === 'ACTIVE' ? 'success' : s === 'TRAINING' ? 'processing' : s === 'SUSPENDED' ? 'warning' : 'error';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: '在职状态', dataIndex: 'employmentStatus', key: 'employmentStatus', width: 90,
      render: (s: string) => <Tag color={s === '在职' ? 'green' : 'default'}>{s}</Tag>,
    },
    { title: '最近活跃', dataIndex: 'lastActive', key: 'lastActive', width: 100 },
    {
      title: '操作', key: 'action', width: 200, fixed: 'right' as const,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Button type="primary" size="small" icon={<SettingOutlined />} onClick={() => openConfig(record)}>
            配置
          </Button>
          {record.employmentStatus === '在职' && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>员工管理</h2>
          <p style={{ color: '#666', margin: 0 }}>
            管理数字员工信息，配置技能与知识资源，全面掌控数字员工能力。
          </p>
        </div>
        <Button
          icon={<SolutionOutlined />}
          onClick={() => setPosApplyVisible(true)}
          style={{ borderRadius: 8 }}
        >
          岗位申请
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={5}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="数字员工总数" value={employees.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={5}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="在职" value={inServiceCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={5}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="ACTIVE" value={activeCount} prefix={<CheckCircleOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={5}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="TRAINING" value={trainingCount} prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="总文档数" value={totalDocs} prefix={<FileTextOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title="数字员工列表"
        extra={
          <Space>
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
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { addForm.setFieldsValue({ id: nextId }); setAddVisible(true); }}>
              新增员工
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* Add Employee Modal */}
      <Modal
        title="新增数字员工"
        open={addVisible}
        onCancel={() => { addForm.resetFields(); setAddVisible(false); }}
        onOk={handleAddEmployee}
        okText="提交"
        width={640}
      >
        <Form form={addForm} layout="vertical" initialValues={{ id: nextId }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="员工名称" name="name" rules={[{ required: true, message: '请输入员工名称' }]}>
                <Input placeholder="例：小翼·xxx" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="工号（自动生成）" name="id">
                <Input disabled style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="所属自然人" name="owner" rules={[{ required: true, message: '请输入归属人姓名' }]}>
                <Input placeholder="请输入归属人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="身份类型" name="ownerType" rules={[{ required: true, message: '请选择身份类型' }]}>
                <Select options={[{ value: '自有', label: '自有' }, { value: '外包', label: '外包' }]} placeholder="请选择" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="岗位" name="position" rules={[{ required: true, message: '请选择岗位' }]}>
                <Select
                  placeholder="请选择岗位"
                  options={positions.filter((p) => p.status === '启用').map((p) => ({ value: p.name, label: `${p.name}（${p.department}）` }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="部门" name="department" rules={[{ required: true, message: '请输入部门' }]}>
                <Input placeholder="请输入所属部门" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tokens配额" name="tokensQuota">
                <Input type="number" placeholder="默认200万" suffix="tokens" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="头像URL" name="avatarUrl" tooltip="非必填，留空将自动生成">
                <Input placeholder="可选，输入头像图片地址" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="请描述该数字员工的职责和能力" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Unified Config Modal with Tabs */}
      <Modal
        title={`配置 — ${selectedEmployee?.name}`}
        open={configVisible}
        onCancel={() => setConfigVisible(false)}
        onOk={saveConfig}
        okText="保存配置"
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

      {/* Edit Employee Modal */}
      <Modal
        title={`编辑员工信息 — ${selectedEmployee?.name}`}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={handleEdit}
        okText="提交审批"
        width={600}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="员工名称" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="部门" name="department" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="岗位" name="position" rules={[{ required: true }]}>
                <Select
                  options={positions.filter((p) => p.status === '启用').map((p) => ({ value: p.name, label: p.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所属自然人" name="owner" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="身份类型" name="ownerType">
                <Select options={[{ value: '自有', label: '自有' }, { value: '外包', label: '外包' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tokens配额" name="tokensQuota">
                <Input type="number" suffix="tokens" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal - includes OnDuty info */}
      <Modal
        title={`员工详情 — ${selectedEmployee?.name}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={750}
      >
        {selectedEmployee && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <Avatar size={64} src={selectedEmployee.avatar} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{selectedEmployee.name}</div>
                <div style={{ color: '#999', marginTop: 4 }}>{selectedEmployee.description}</div>
              </div>
            </div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="工号">
                <span style={{ fontFamily: 'monospace' }}>{selectedEmployee.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="在职状态">
                <Tag color={selectedEmployee.employmentStatus === '在职' ? 'green' : 'default'}>{selectedEmployee.employmentStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="运行状态">
                <Tag color={selectedEmployee.status === 'ACTIVE' ? 'success' : selectedEmployee.status === 'TRAINING' ? 'processing' : 'warning'}>{selectedEmployee.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="职级">
                <Tag color={levelColor[selectedEmployee.level]} style={{ color: '#fff' }}>
                  {selectedEmployee.level}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="部门">{selectedEmployee.department}</Descriptions.Item>
              <Descriptions.Item label="岗位">{selectedEmployee.position}</Descriptions.Item>
              <Descriptions.Item label="所属自然人">{selectedEmployee.owner}</Descriptions.Item>
              <Descriptions.Item label="身份类型">
                <Tag color={selectedEmployee.ownerType === '自有' ? 'blue' : 'orange'}>{selectedEmployee.ownerType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="入职日期">{selectedEmployee.onboardDate}</Descriptions.Item>
              <Descriptions.Item label="最近活跃">{selectedEmployee.lastActive}</Descriptions.Item>
              <Descriptions.Item label="Tokens配额" span={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Progress
                    percent={Math.round((selectedEmployee.tokensUsed / selectedEmployee.tokensQuota) * 100)}
                    size="small"
                    style={{ width: 200 }}
                    status={selectedEmployee.tokensUsed / selectedEmployee.tokensQuota > 0.8 ? 'exception' : 'active'}
                  />
                  <span>{(selectedEmployee.tokensUsed / 1000000).toFixed(1)}M / {(selectedEmployee.tokensQuota / 1000000).toFixed(1)}M</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="任务完成率" span={2}>
                <Progress percent={selectedEmployee.taskCompleteRate} size="small" style={{ width: 200 }} />
              </Descriptions.Item>
              <Descriptions.Item label="已配置技能" span={2}>
                {selectedEmployee.skills.length > 0
                  ? selectedEmployee.skills.map((s) => <Tag key={s} color="processing">{s}</Tag>)
                  : <span style={{ color: '#999' }}>暂未配置</span>}
              </Descriptions.Item>
              <Descriptions.Item label="已关联知识" span={2}>
                {(() => {
                  const kbs = knowledgeBases.filter((kb) => selectedEmployee.knowledgeIds.includes(kb.id));
                  return kbs.length > 0
                    ? kbs.map((kb) => <Tag key={kb.id} icon={typeIcon[kb.type]}>{kb.name}</Tag>)
                    : <span style={{ color: '#999' }}>暂未关联</span>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="关联智能体" span={2}>
                {selectedEmployee.relatedAgents.map((a) => <Tag key={a}>{a}</Tag>)}
              </Descriptions.Item>
              <Descriptions.Item label="热度">{selectedEmployee.heat}</Descriptions.Item>
              <Descriptions.Item label="点赞/踩">{selectedEmployee.likes} / {selectedEmployee.dislikes}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Position Application Modal */}
      <Modal
        title="岗位申请"
        open={posApplyVisible}
        onOk={() => {
          posApplyForm.validateFields().then(() => {
            message.success('岗位申请已提交，请等待审批');
            posApplyForm.resetFields();
            setPosApplyVisible(false);
          });
        }}
        onCancel={() => { posApplyForm.resetFields(); setPosApplyVisible(false); }}
        okText="提交申请"
        width={640}
      >
        {/* Approval workflow diagram */}
        <div style={{
          background: '#f8fafc', borderRadius: 12, padding: '16px 20px',
          marginBottom: 20, border: '1px solid #e8ecf1',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2332', marginBottom: 12 }}>审批流程</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {[
              { label: '提交申请', color: '#1677ff' },
              { label: '部门经理审批', color: '#faad14' },
              { label: '人力部门审核', color: '#faad14' },
              { label: '系统管理员确认', color: '#faad14' },
              { label: '完成创建', color: '#52c41a' },
            ].map((step, index, arr) => (
              <React.Fragment key={step.label}>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: step.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 6px', fontSize: 14, fontWeight: 600,
                  }}>{index + 1}</div>
                  <div style={{ fontSize: 11, color: '#5a6b7d', lineHeight: 1.3 }}>{step.label}</div>
                </div>
                {index < arr.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, background: '#e0e6ed',
                    marginBottom: 18, minWidth: 20,
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Form form={posApplyForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="positionName" label="岗位名称" rules={[{ required: true, message: '请输入岗位名称' }]}>
                <Input placeholder="如：智能客服专员" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="所属部门" rules={[{ required: true, message: '请选择部门' }]}>
                <Select placeholder="选择部门" options={
                  Array.from(new Set(digitalEmployees.map((e) => e.department))).map((d) => ({ label: d, value: d }))
                } />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="level" label="岗位职级" rules={[{ required: true, message: '请选择职级' }]}>
                <Select placeholder="选择职级" options={[
                  { label: 'L1 基础', value: 'L1' },
                  { label: 'L2 进阶', value: 'L2' },
                  { label: 'L3 专家', value: 'L3' },
                  { label: 'L4 大师', value: 'L4' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="headcount" label="需求人数" rules={[{ required: true, message: '请输入人数' }]}>
                <Input type="number" min={1} placeholder="请输入人数" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="requiredSkills" label="技能要求">
            <Select mode="multiple" placeholder="选择所需技能" options={
              skills.map((s) => ({ label: s.name, value: s.id }))
            } />
          </Form.Item>
          <Form.Item name="description" label="岗位职责" rules={[{ required: true, message: '请输入岗位职责' }]}>
            <Input.TextArea rows={3} placeholder="请描述岗位职责和要求..." />
          </Form.Item>
          <Form.Item name="reason" label="申请原因" rules={[{ required: true, message: '请输入申请原因' }]}>
            <Input.TextArea rows={2} placeholder="请说明申请该岗位的原因..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;
