import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Modal, Form, Input, Select, InputNumber,
  Row, Col, Statistic, message, Radio, Tooltip,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  AppstoreOutlined, CheckCircleOutlined, StopOutlined, TeamOutlined,
  ExclamationCircleFilled, SwapOutlined, PauseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { positions, type PositionItem } from '../../mock/data';

const categoryColors: Record<string, string> = {
  '服务类': 'blue',
  '技术类': 'cyan',
  '运营类': 'green',
  '合规类': 'orange',
  '管理类': 'purple',
  '财务类': 'gold',
  '分析类': 'magenta',
  '综合类': 'default',
};

const allSkillOptions = [
  '智能问答', '工单处理', '情感分析', '数据标注', '数据清洗',
  '文案撰写', '用户画像', '竞品分析', '商机挖掘', '客户画像',
  '工作底稿', '风险识别', '简历筛选', '人岗匹配', '报销审核',
  '预算分析', '故障诊断', '日志分析', '自动巡检', '文件解析',
  '摘要生成', '经营报告', '指标分析', '可视化', '报告生成',
];

const departmentOptions = [
  '客户服务部', '数据运营中心', '数字化运营部', '审计部',
  '人力资源部', '财务共享中心', 'IT运维部', '综合管理部', '经营分析部', '法务部',
];

const categoryOptions = ['服务类', '技术类', '运营类', '合规类', '管理类', '财务类', '分析类', '综合类'];

const PositionSettings: React.FC = () => {
  const [data, setData] = useState<PositionItem[]>(positions);
  const [searchText, setSearchText] = useState('');
  const [deptFilter, setDeptFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PositionItem | null>(null);
  const [form] = Form.useForm();

  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<PositionItem | null>(null);
  const [suspendAction, setSuspendAction] = useState<'migrate' | 'suspend'>('suspend');
  const [migrateTarget, setMigrateTarget] = useState<string | undefined>(undefined);

  const filteredData = useMemo(() => {
    return data.filter((p) => {
      const matchSearch = !searchText || p.name.includes(searchText) || p.id.includes(searchText);
      const matchDept = !deptFilter || p.department === deptFilter;
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [data, searchText, deptFilter, statusFilter]);

  const enabledCount = data.filter((p) => p.status === '启用').length;
  const disabledCount = data.filter((p) => p.status === '停用').length;
  const totalEmployeeCount = data.reduce((sum, p) => sum + p.employeeCount, 0);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: PositionItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleToggleStatus = (record: PositionItem) => {
    if (record.status === '停用') {
      setData((prev) => prev.map((p) => (p.id === record.id ? { ...p, status: '启用' } : p)));
      message.success(`已启用岗位：${record.name}`);
      return;
    }

    if (record.employeeCount > 0) {
      setSuspendTarget(record);
      setSuspendAction('suspend');
      setMigrateTarget(undefined);
      setSuspendModalVisible(true);
    } else {
      setData((prev) => prev.map((p) => (p.id === record.id ? { ...p, status: '停用' } : p)));
      message.success(`已停用岗位：${record.name}`);
    }
  };

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

  const handleDelete = (record: PositionItem) => {
    if (record.employeeCount > 0 && record.status === '启用') {
      Modal.warning({
        title: '无法删除',
        icon: <ExclamationCircleFilled />,
        content: (
          <div>
            <p>该岗位下仍有 <strong>{record.employeeCount}</strong> 位在职数字员工，请先完成人员迁移后再删除。</p>
            <p style={{ color: '#999', fontSize: 13 }}>
              建议先停用该岗位（选择迁移方案），待员工全部迁出后再执行删除操作。
            </p>
          </div>
        ),
        okText: '知道了',
      });
      return;
    }

    Modal.confirm({
      title: '确认删除岗位',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p>确定要删除岗位 <strong>「{record.name}」</strong> 吗？</p>
          {record.employeeCount > 0 && record.status === '停用' && (
            <p style={{ color: '#999', fontSize: 13 }}>
              该岗位下有 {record.employeeCount} 位已暂停/离职员工，历史数据中岗位名称将保留为快照。
            </p>
          )}
          <p style={{ color: '#999', fontSize: 13 }}>此操作需要审批确认。</p>
        </div>
      ),
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk() {
        setData((prev) => prev.filter((p) => p.id !== record.id));
        message.success(`岗位「${record.name}」删除审批已发起`);
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        setData((prev) =>
          prev.map((p) => (p.id === editingItem.id ? { ...p, ...values } : p)),
        );
        message.success('岗位已更新');
      } else {
        const newItem: PositionItem = {
          id: `POS${String(data.length + 1).padStart(3, '0')}`,
          ...values,
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
    { title: '岗位ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '岗位名称', dataIndex: 'name', key: 'name', width: 140 },
    { title: '所属部门', dataIndex: 'department', key: 'department', width: 130 },
    {
      title: '岗位分类', dataIndex: 'category', key: 'category', width: 100,
      render: (cat: string) => <Tag color={categoryColors[cat] || 'default'}>{cat}</Tag>,
    },
    { title: '等级要求', dataIndex: 'level', key: 'level', width: 100 },
    {
      title: '所需技能', dataIndex: 'requiredSkills', key: 'requiredSkills', width: 200,
      render: (skillList: string[]) => (
        <Space wrap size={[4, 4]}>
          {skillList.map((s) => <Tag key={s} color="blue">{s}</Tag>)}
        </Space>
      ),
    },
    {
      title: '在岗/上限', key: 'employeeQuota', width: 110, align: 'center',
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
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status: string) => (
        <Tag color={status === '启用' ? 'success' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 200, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          </Tooltip>
          <Button
            type="link"
            size="small"
            danger={record.status === '启用'}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === '启用' ? '停用' : '启用'}
          </Button>
          <Tooltip title="删除">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              删除
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>岗位设置</h2>
      <p style={{ color: '#999', marginBottom: 20 }}>维护数字员工的岗位选项，设置各岗位所需技能、等级要求和员工数量上限</p>

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
              placeholder="搜索岗位名称/ID"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="部门筛选"
              style={{ width: 150 }}
              allowClear
              value={deptFilter}
              onChange={setDeptFilter}
              options={departmentOptions.map((d) => ({ label: d, value: d }))}
            />
            <Select
              placeholder="状态筛选"
              style={{ width: 120 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: '启用', value: '启用' },
                { label: '停用', value: '停用' },
              ]}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增岗位</Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

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
          <Form.Item name="name" label="岗位名称" rules={[{ required: true, message: '请输入岗位名称' }]}>
            <Input placeholder="请输入岗位名称" />
          </Form.Item>
          <Form.Item name="department" label="所属部门" rules={[{ required: true, message: '请选择所属部门' }]}>
            <Select placeholder="请选择部门" options={departmentOptions.map((d) => ({ label: d, value: d }))} />
          </Form.Item>
          <Form.Item name="category" label="岗位分类" rules={[{ required: true, message: '请选择岗位分类' }]}>
            <Select
              placeholder="请选择分类"
              options={categoryOptions.map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
          <Form.Item name="level" label="等级要求" rules={[{ required: true, message: '请输入等级要求' }]}>
            <Input placeholder="如 L2-L3" />
          </Form.Item>
          <Form.Item name="maxEmployeeCount" label="员工数量上限" rules={[{ required: true, message: '请输入数量上限' }]}>
            <InputNumber min={1} max={100} placeholder="该岗位最多可安排的员工数" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="requiredSkills" label="所需技能" rules={[{ required: true, message: '请选择所需技能' }]}>
            <Select
              mode="multiple"
              placeholder="请选择技能"
              options={allSkillOptions.map((s) => ({ label: s, value: s }))}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入岗位描述" />
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
