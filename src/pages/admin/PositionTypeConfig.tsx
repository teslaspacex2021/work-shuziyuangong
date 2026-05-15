import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Modal, Form, Input,
  Row, Col, Statistic, message, ColorPicker, Tooltip,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  AppstoreOutlined, LockOutlined, TagOutlined, TeamOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const DEFAULT_TYPE_ID = 'PT008';

interface PositionType {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  positionCount: number;
  employeeCount: number;
  isDefault: boolean;
  createTime: string;
  sortOrder: number;
}

const mockPositionTypes: PositionType[] = [
  { id: 'PT001', name: '服务类', code: 'SERVICE', color: '#1677ff', description: '面向客户服务、咨询类岗位', positionCount: 3, employeeCount: 5, isDefault: false, createTime: '2026-01-15', sortOrder: 1 },
  { id: 'PT002', name: '技术类', code: 'TECH', color: '#13c2c2', description: '涉及技术开发、运维、数据处理类岗位', positionCount: 4, employeeCount: 6, isDefault: false, createTime: '2026-01-15', sortOrder: 2 },
  { id: 'PT003', name: '运营类', code: 'OPERATION', color: '#fa541c', description: '业务运营、内容运营、市场运营类岗位', positionCount: 2, employeeCount: 3, isDefault: false, createTime: '2026-01-15', sortOrder: 3 },
  { id: 'PT004', name: '合规类', code: 'COMPLIANCE', color: '#52c41a', description: '审计、合规检查、风险管控类岗位', positionCount: 2, employeeCount: 2, isDefault: false, createTime: '2026-01-15', sortOrder: 4 },
  { id: 'PT005', name: '管理类', code: 'MANAGEMENT', color: '#eb2f96', description: '综合管理、行政事务类岗位', positionCount: 1, employeeCount: 1, isDefault: false, createTime: '2026-02-01', sortOrder: 5 },
  { id: 'PT006', name: '财务类', code: 'FINANCE', color: '#faad14', description: '财务核算、报表分析、报销审核类岗位', positionCount: 2, employeeCount: 2, isDefault: false, createTime: '2026-02-01', sortOrder: 6 },
  { id: 'PT007', name: '分析类', code: 'ANALYSIS', color: '#722ed1', description: '数据分析、经营分析、BI类岗位', positionCount: 1, employeeCount: 2, isDefault: false, createTime: '2026-02-15', sortOrder: 7 },
  { id: DEFAULT_TYPE_ID, name: '综合类', code: 'GENERAL', color: '#8c8c8c', description: '系统内置默认岗位类型，不可编辑删除。其他岗位类型被删除后，关联岗位和员工自动归入此类型。', positionCount: 1, employeeCount: 1, isDefault: true, createTime: '2026-01-01', sortOrder: 99 },
];

const PositionTypeConfig: React.FC = () => {
  const [data, setData] = useState<PositionType[]>(mockPositionTypes);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PositionType | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    return data.filter((pt) => {
      return !searchText || pt.name.includes(searchText) || pt.code.includes(searchText);
    }).sort((a, b) => {
      if (a.isDefault) return 1;
      if (b.isDefault) return -1;
      return a.sortOrder - b.sortOrder;
    });
  }, [data, searchText]);

  const customCount = data.filter((pt) => !pt.isDefault).length;
  const totalPositions = data.reduce((sum, pt) => sum + pt.positionCount, 0);
  const totalEmployees = data.reduce((sum, pt) => sum + pt.employeeCount, 0);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ color: '#1677ff', sortOrder: data.length + 1 });
    setModalVisible(true);
  };

  const handleEdit = (record: PositionType) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (record: PositionType) => {
    if (record.isDefault) return;

    const defaultType = data.find((pt) => pt.isDefault);
    const defaultName = defaultType?.name || '综合类';

    Modal.confirm({
      title: '确认删除岗位类型',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p>确定要删除岗位类型 <strong>「{record.name}」</strong> 吗？</p>
          {(record.positionCount > 0 || record.employeeCount > 0) && (
            <div style={{
              background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8,
              padding: '12px 16px', marginTop: 8,
            }}>
              <p style={{ margin: 0, fontWeight: 500, color: '#d48806' }}>
                <ExclamationCircleFilled style={{ marginRight: 6 }} />
                该类型下有 <strong>{record.positionCount}</strong> 个岗位、
                <strong>{record.employeeCount}</strong> 位数字员工
              </p>
              <p style={{ margin: '8px 0 0', color: '#666', fontSize: 13 }}>
                删除后，这些岗位和员工将自动归入默认岗位类型「{defaultName}」。
                <br />员工运行状态不受影响。
              </p>
            </div>
          )}
          {record.positionCount === 0 && record.employeeCount === 0 && (
            <p style={{ color: '#999', fontSize: 13 }}>该类型下暂无关联岗位和员工。</p>
          )}
        </div>
      ),
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk() {
        setData((prev) => {
          const defaultItem = prev.find((pt) => pt.isDefault);
          if (!defaultItem) return prev.filter((pt) => pt.id !== record.id);

          return prev
            .filter((pt) => pt.id !== record.id)
            .map((pt) =>
              pt.id === defaultItem.id
                ? {
                    ...pt,
                    positionCount: pt.positionCount + record.positionCount,
                    employeeCount: pt.employeeCount + record.employeeCount,
                  }
                : pt,
            );
        });
        message.success(
          record.positionCount > 0
            ? `已删除「${record.name}」，${record.positionCount} 个岗位和 ${record.employeeCount} 位员工已归入「${defaultName}」`
            : `已删除岗位类型「${record.name}」`,
        );
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const colorValue = typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#1677ff';
      if (editingItem) {
        setData((prev) =>
          prev.map((pt) => (pt.id === editingItem.id ? { ...pt, ...values, color: colorValue } : pt)),
        );
        message.success('岗位类型已更新');
      } else {
        const newItem: PositionType = {
          id: `PT${String(data.length + 1).padStart(3, '0')}`,
          ...values,
          color: colorValue,
          isDefault: false,
          positionCount: 0,
          employeeCount: 0,
          createTime: new Date().toISOString().split('T')[0],
        };
        setData((prev) => [...prev, newItem]);
        message.success('岗位类型已创建');
      }
      setModalVisible(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<PositionType> = [
    { title: '类型ID', dataIndex: 'id', key: 'id', width: 90 },
    {
      title: '类型名称', dataIndex: 'name', key: 'name', width: 140,
      render: (name: string, record) => (
        <Space>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: record.color, flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{name}</span>
          {record.isDefault && (
            <Tag color="default" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}>
              <LockOutlined style={{ marginRight: 2 }} />默认
            </Tag>
          )}
        </Space>
      ),
    },
    { title: '编码', dataIndex: 'code', key: 'code', width: 120, render: (code: string) => <Tag>{code}</Tag> },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '关联岗位', dataIndex: 'positionCount', key: 'positionCount', width: 100, align: 'center',
      render: (count: number) => <span style={{ fontWeight: 500 }}>{count}</span>,
    },
    {
      title: '关联员工', dataIndex: 'employeeCount', key: 'employeeCount', width: 100, align: 'center',
      render: (count: number) => <span style={{ fontWeight: 500 }}>{count}</span>,
    },
    {
      title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 70, align: 'center',
    },
    {
      title: '操作', key: 'action', width: 140, fixed: 'right',
      render: (_, record) => {
        if (record.isDefault) {
          return <span style={{ color: '#bbb', fontSize: 12 }}>系统内置，不可操作</span>;
        }
        return (
          <Space size="small">
            <Tooltip title="编辑">
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
            </Tooltip>
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>岗位类型配置</h2>
      <p style={{ color: '#999', marginBottom: 20 }}>管理数字员工的岗位分类体系，定义岗位类型的编码、颜色和排序。系统内置默认岗位类型「综合类」不可编辑删除。</p>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="类型总数" value={data.length} prefix={<TagOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="自定义类型" value={customCount} prefix={<AppstoreOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="关联岗位数" value={totalPositions} prefix={<AppstoreOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="关联员工数" value={totalEmployees} prefix={<TeamOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Input
            placeholder="搜索类型名称/编码"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增岗位类型</Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑岗位类型' : '新增岗位类型'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        width={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="类型名称" rules={[{ required: true, message: '请输入类型名称' }]}>
            <Input placeholder="如：服务类、技术类" />
          </Form.Item>
          <Form.Item name="code" label="类型编码" rules={[{ required: true, message: '请输入类型编码' }]}>
            <Input placeholder="如：SERVICE、TECH（全大写英文）" disabled={!!editingItem} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="color" label="标识颜色" rules={[{ required: true, message: '请选择颜色' }]}>
                <ColorPicker />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sortOrder" label="排序序号" rules={[{ required: true, message: '请输入排序' }]}>
                <Input type="number" placeholder="数字越小越靠前" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入岗位类型的描述说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PositionTypeConfig;
