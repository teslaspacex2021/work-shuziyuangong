import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Modal, Form, Input, Select, InputNumber,
  Row, Col, Statistic, message, Radio, Result,
} from 'antd';
import {
  SearchOutlined, PlusOutlined,
  AppstoreOutlined, CheckCircleOutlined, StopOutlined, TeamOutlined,
  ExclamationCircleFilled, SwapOutlined, PauseCircleOutlined, LinkOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { positions, BUSINESS_LINES, BUSINESS_LINE_COLORS, CAPABILITY_LEVEL_COLORS, type PositionItem } from '../../mock/data';

const categoryOptions: string[] = [...BUSINESS_LINES];

const departmentOptions = [
  '客户服务部', '数据运营中心', '数字化运营部', '审计部',
  '人力资源部', '财务共享中心', 'IT运维部', '综合管理部', '经营分析部', '法务部',
];

const parseRequiredSkills = (text: string): string[] =>
  text.split(/[\n,，、]+/).map((s) => s.trim()).filter(Boolean);

const PositionSettings: React.FC = () => {
  const [data, setData] = useState<PositionItem[]>(positions);
  const [searchText, setSearchText] = useState('');
  const [lineFilter, setLineFilter] = useState<string | undefined>(undefined);
  const [oaVisible, setOaVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem] = useState<PositionItem | null>(null);
  const [form] = Form.useForm();

  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<PositionItem | null>(null);
  const [suspendAction, setSuspendAction] = useState<'migrate' | 'suspend'>('suspend');
  const [migrateTarget, setMigrateTarget] = useState<string | undefined>(undefined);

  const filteredData = useMemo(() => {
    return data.filter((p) => {
      const matchSearch = !searchText || p.name.includes(searchText) || p.benchmarkPosition.includes(searchText);
      const matchLine = !lineFilter || p.category === lineFilter;
      return matchSearch && matchLine;
    });
  }, [data, searchText, lineFilter]);

  const enabledCount = data.filter((p) => p.status === '启用').length;
  const disabledCount = data.filter((p) => p.status === '停用').length;
  const totalEmployeeCount = data.reduce((sum, p) => sum + p.employeeCount, 0);


  const handleSuspendConfirm = () => {
    if (!suspendTarget) return;

    if (suspendAction === 'migrate' && !migrateTarget) {
      message.warning('请选择迁移目标岗位');
      return;
    }

    if (suspendAction === 'migrate') {
      const targetPos = data.find((p) => p.id === migrateTarget);
      setData((prev) => prev.map((p) => {
        if (p.id === suspendTarget.id) return { ...p, status: '停用' as const, employeeCount: 0 };
        if (p.id === migrateTarget) return { ...p, employeeCount: p.employeeCount + suspendTarget.employeeCount };
        return p;
      }));
      message.success(`已停用「${suspendTarget.name}」，${suspendTarget.employeeCount} 位员工已迁移至「${targetPos?.name}」，调岗审批已发起`);
    } else {
      setData((prev) => prev.map((p) => (p.id === suspendTarget.id ? { ...p, status: '停用' as const } : p)));
      message.success(`已停用「${suspendTarget.name}」，${suspendTarget.employeeCount} 位关联员工已暂停（SUSPENDED），审批已发起`);
    }

    setSuspendModalVisible(false);
    setSuspendTarget(null);
  };


  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const { requiredSkillsText, ...rest } = values;
      const requiredSkills = parseRequiredSkills(requiredSkillsText || '');
      if (editingItem) {
        setData((prev) =>
          prev.map((p) => (p.id === editingItem.id ? { ...p, ...rest, requiredSkills } : p)),
        );
        message.success('岗位已更新');
      } else {
        const newItem: PositionItem = {
          id: `POS${String(data.length + 1).padStart(3, '0')}`,
          ...rest,
          description: '',
          benchmarkPosition: rest.benchmarkPosition || rest.name,
          requiredSkills,
          level: values.level || 'L2',
          status: '启用',
          employeeCount: 0,
          createTime: new Date().toISOString().split('T')[0],
        };
        setData((prev) => [...prev, newItem]);
        message.success('岗位已创建');
      }
      setModalVisible(false);
      form.resetFields();
    });
  };

  const migrateOptions = useMemo(() => {
    if (!suspendTarget) return [];
    return data
      .filter((p) => p.id !== suspendTarget.id && p.status === '启用')
      .map((p) => ({ label: `${p.name}（${p.department}，在岗 ${p.employeeCount}/${p.maxEmployeeCount}）`, value: p.id }));
  }, [data, suspendTarget]);

  const columns: ColumnsType<PositionItem> = [
    { title: '数字员工名称', dataIndex: 'name', key: 'name', width: 180, ellipsis: true },
    {
      title: '所属条线', dataIndex: 'category', key: 'category', width: 90,
      render: (cat: string) => <Tag color={BUSINESS_LINE_COLORS[cat] || 'default'}>{cat}</Tag>,
    },
    { title: '所属部门', dataIndex: 'department', key: 'department', width: 130, ellipsis: true },
    { title: '基准岗位', dataIndex: 'benchmarkPosition', key: 'benchmarkPosition', ellipsis: true },
    {
      title: '级别', dataIndex: 'capabilityLevel', key: 'capabilityLevel', width: 80,
      render: (v: string | undefined) => v
        ? <Tag color={CAPABILITY_LEVEL_COLORS[v as keyof typeof CAPABILITY_LEVEL_COLORS] || 'default'}>{v}</Tag>
        : <span style={{ color: '#999' }}>—</span>,
    },
    {
      title: '所需技能', dataIndex: 'requiredSkills', key: 'requiredSkills', width: 180,
      render: (skillList: string[]) => {
        const shown = skillList.slice(0, 2);
        const rest = skillList.length - 2;
        if (shown.length === 0) return <span style={{ color: '#999' }}>—</span>;
        return (
          <Space wrap size={[4, 4]}>
            {shown.map((s) => <Tag key={s} color="blue">{s}</Tag>)}
            {rest > 0 && <Tag>+{rest}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '在岗/上限', key: 'employeeQuota', width: 100, align: 'center',
      render: (_, record) => {
        const ratio = record.maxEmployeeCount > 0 ? (record.employeeCount / record.maxEmployeeCount) * 100 : 0;
        return (
          <div>
            <span style={{ fontWeight: 500 }}>{record.employeeCount}</span>
            <span style={{ color: '#999' }}> / {record.maxEmployeeCount}</span>
            {ratio >= 100 && <Tag color="red" style={{ marginLeft: 4, fontSize: 10 }}>满员</Tag>}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>岗位设置</h2>
      <p style={{ color: '#999', marginBottom: 20 }}>维护数字员工的岗位选项，设置所属条线、级别、所需技能及员工数量上限</p>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="岗位总数" value={data.length} prefix={<AppstoreOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="启用岗位" value={enabledCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="停用岗位" value={disabledCount} prefix={<StopOutlined style={{ color: '#999' }} />} valueStyle={{ color: '#999' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="关联员工数" value={totalEmployeeCount} prefix={<TeamOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Space wrap>
            <Input
              placeholder="搜索数字员工名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="条线筛选"
              style={{ width: 120 }}
              allowClear
              value={lineFilter}
              onChange={setLineFilter}
              options={categoryOptions.map((c) => ({ label: c, value: c }))}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增岗位
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      {/* OA申请提示 Modal */}
      <Modal
        open={oaVisible}
        onCancel={() => setOaVisible(false)}
        footer={null}
        width={480}
        centered
      >
        <Result
          status="info"
          title="请前往 OA 系统申请"
          subTitle="新增岗位需通过 OA 系统提交申请，经上级审批后由系统管理员统一创建。"
          extra={[
            <Button
              type="primary"
              key="oa"
              icon={<LinkOutlined />}
              href="https://oa.example.com/apply/position"
              target="_blank"
              onClick={() => setOaVisible(false)}
            >
              前往 OA 申请入口
            </Button>,
            <Button key="cancel" onClick={() => setOaVisible(false)}>取消</Button>,
          ]}
        />
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        title={editingItem ? '编辑岗位' : '新增岗位'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="数字员工名称" rules={[{ required: true, message: '请输入数字员工名称' }]}>
            <Input placeholder="例如：综合支撑-财务-财务管理" />
          </Form.Item>
          <Form.Item name="benchmarkPosition" label="基准岗位" rules={[{ required: true, message: '请输入基准岗位' }]}>
            <Input placeholder="例如：综合支撑-财务-财务管理" />
          </Form.Item>
          <Form.Item name="category" label="所属条线" rules={[{ required: true, message: '请选择所属条线' }]}>
            <Select
              placeholder="请选择所属条线"
              options={categoryOptions.map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
          <Form.Item name="capabilityLevel" label="级别" rules={[{ required: true, message: '请选择级别' }]}>
            <Select
              placeholder="请选择级别"
              options={['工具型', '智能型', '超级型'].map((l) => ({ label: l, value: l }))}
            />
          </Form.Item>
          <Form.Item
            name="requiredSkillsText"
            label="所需技能"
            rules={[{ required: true, message: '请输入所需技能' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入所需技能，多个技能可用换行或逗号分隔" />
          </Form.Item>
          <Form.Item name="department" label="所属部门" rules={[{ required: true, message: '请选择所属部门' }]}>
            <Select placeholder="请选择部门" options={departmentOptions.map((d) => ({ label: d, value: d }))} />
          </Form.Item>
          <Form.Item name="maxEmployeeCount" label="员工数量上限" rules={[{ required: true, message: '请输入数量上限' }]}>
            <InputNumber min={1} max={100} placeholder="该岗位最多可安排的员工数" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Suspend/Migrate Confirmation Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleFilled style={{ color: '#faad14' }} />
            <span>停用岗位 — {suspendTarget?.name}</span>
          </Space>
        }
        open={suspendModalVisible}
        onOk={handleSuspendConfirm}
        onCancel={() => { setSuspendModalVisible(false); setSuspendTarget(null); }}
        okText="提交审批"
        cancelText="取消"
        width={560}
      >
        {suspendTarget && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8,
              padding: '12px 16px', marginBottom: 16,
            }}>
              <p style={{ margin: 0, fontWeight: 500, color: '#d48806' }}>
                该岗位下有 <strong>{suspendTarget.employeeCount}</strong> 位在职数字员工
              </p>
              <p style={{ margin: '4px 0 0', color: '#666', fontSize: 13 }}>
                停用前请选择员工的处理方案：
              </p>
            </div>

            <Radio.Group
              value={suspendAction}
              onChange={(e) => { setSuspendAction(e.target.value); setMigrateTarget(undefined); }}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="migrate" style={{ width: '100%' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      <SwapOutlined style={{ marginRight: 6, color: '#1677ff' }} />
                      方案A：迁移至其他岗位
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginLeft: 22 }}>
                      关联员工将走调岗流程，迁移至选定的目标岗位
                    </div>
                  </div>
                </Radio>

                {suspendAction === 'migrate' && (
                  <div style={{ paddingLeft: 24, marginBottom: 8 }}>
                    <Select
                      placeholder="请选择迁移目标岗位"
                      style={{ width: '100%' }}
                      value={migrateTarget}
                      onChange={setMigrateTarget}
                      options={migrateOptions}
                    />
                  </div>
                )}

                <Radio value="suspend" style={{ width: '100%' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      <PauseCircleOutlined style={{ marginRight: 6, color: '#faad14' }} />
                      方案B：暂停关联员工
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginLeft: 22 }}>
                      关联员工运行状态将变更为"已暂停"（SUSPENDED）
                    </div>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PositionSettings;
