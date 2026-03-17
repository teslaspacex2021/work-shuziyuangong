import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Modal, Form, Input, Select, InputNumber,
  Row, Col, Statistic, message,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, EditOutlined,
  AppstoreOutlined, CheckCircleOutlined, StopOutlined, TeamOutlined,
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

const PositionSettings: React.FC = () => {
  const [data, setData] = useState<PositionItem[]>(positions);
  const [searchText, setSearchText] = useState('');
  const [deptFilter, setDeptFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PositionItem | null>(null);
  const [form] = Form.useForm();

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
    const newStatus = record.status === '启用' ? '停用' : '启用';
    setData((prev) => prev.map((p) => (p.id === record.id ? { ...p, status: newStatus } : p)));
    message.success(`已${newStatus}岗位：${record.name}`);
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
      title: '操作', key: 'action', width: 180, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button
            type="link"
            size="small"
            danger={record.status === '启用'}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === '启用' ? '停用' : '启用'}
          </Button>
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
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

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
              options={['服务类', '技术类', '运营类', '合规类', '管理类', '财务类', '分析类'].map((c) => ({ label: c, value: c }))}
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
    </div>
  );
};

export default PositionSettings;
