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
import {
  positions, BUSINESS_LINES, BUSINESS_LINE_COLORS, type BusinessLine,
} from '../../mock/data';

const DEFAULT_LINE_ID = 'LN012';

interface BusinessLineItem {
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

const LINE_META: Record<BusinessLine, { code: string; description: string }> = {
  渠道: { code: 'CHANNEL', description: '负责销售渠道开拓、渠道管理、渠道支持类岗位' },
  市场: { code: 'MARKET', description: '负责市场推广、品牌运营、商机挖掘类岗位' },
  研发: { code: 'RD', description: '负责产品研发、技术开发、系统架构类岗位' },
  客服: { code: 'CS', description: '面向客户服务、咨询、工单处理类岗位' },
  云网: { code: 'CLOUD_NET', description: '负责云网络运维、系统监控、故障处理类岗位' },
  政企: { code: 'GOV_ENT', description: '面向政企客户支持、定制化服务类岗位' },
  数发: { code: 'DATA_DEV', description: '负责数据治理、数据标注、数据应用开发类岗位' },
  财务: { code: 'FINANCE', description: '负责财务核算、报表分析、报销审核类岗位' },
  人力: { code: 'HR', description: '负责人力资源管理、招聘、培训类岗位' },
  法律: { code: 'LEGAL', description: '负责法务合规、合同审核、风险管控类岗位' },
  企发: { code: 'ENTERPRISE', description: '负责企业战略规划、经营分析、业务发展类岗位' },
  办公室: { code: 'OFFICE', description: '负责综合管理、行政事务、文档处理类岗位' },
  党群: { code: 'PARTY', description: '负责党建工作、群众工作、思想教育类岗位' },
  工会: { code: 'UNION', description: '负责工会工作、员工关怀、活动组织类岗位' },
  纪检: { code: 'DISCIPLINE', description: '负责纪检监察、廉政建设、监督检查类岗位' },
  审计: { code: 'AUDIT', description: '负责内部审计、合规检查、风险识别类岗位' },
};

const buildInitialLines = (): BusinessLineItem[] => {
  const positionCountMap: Record<string, number> = {};
  const employeeCountMap: Record<string, number> = {};
  positions.forEach((p) => {
    positionCountMap[p.category] = (positionCountMap[p.category] || 0) + 1;
    employeeCountMap[p.category] = (employeeCountMap[p.category] || 0) + p.employeeCount;
  });

  return BUSINESS_LINES.map((name, index) => {
    const id = `LN${String(index + 1).padStart(3, '0')}`;
    const meta = LINE_META[name];
    return {
      id,
      name,
      code: meta.code,
      color: BUSINESS_LINE_COLORS[name] || '#1677ff',
      description: meta.description,
      positionCount: positionCountMap[name] || 0,
      employeeCount: employeeCountMap[name] || 0,
      isDefault: id === DEFAULT_LINE_ID,
      createTime: '2026-01-15',
      sortOrder: index + 1,
    };
  });
};

const PositionTypeConfig: React.FC = () => {
  const [data, setData] = useState<BusinessLineItem[]>(buildInitialLines());
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessLineItem | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    return data.filter((line) => {
      return !searchText || line.name.includes(searchText) || line.code.includes(searchText);
    }).sort((a, b) => {
      if (a.isDefault) return 1;
      if (b.isDefault) return -1;
      return a.sortOrder - b.sortOrder;
    });
  }, [data, searchText]);

  const customCount = data.filter((line) => !line.isDefault).length;
  const totalPositions = data.reduce((sum, line) => sum + line.positionCount, 0);
  const totalEmployees = data.reduce((sum, line) => sum + line.employeeCount, 0);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ color: '#1677ff', sortOrder: data.length + 1 });
    setModalVisible(true);
  };

  const handleEdit = (record: BusinessLineItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (record: BusinessLineItem) => {
    if (record.isDefault) return;

    const defaultLine = data.find((line) => line.isDefault);
    const defaultName = defaultLine?.name || '办公室';

    Modal.confirm({
      title: '确认删除条线',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p>确定要删除条线 <strong>「{record.name}」</strong> 吗？</p>
          {(record.positionCount > 0 || record.employeeCount > 0) && (
            <div style={{
              background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8,
              padding: '12px 16px', marginTop: 8,
            }}>
              <p style={{ margin: 0, fontWeight: 500, color: '#d48806' }}>
                <ExclamationCircleFilled style={{ marginRight: 6 }} />
                该条线下有 <strong>{record.positionCount}</strong> 个岗位、
                <strong>{record.employeeCount}</strong> 位数字员工
              </p>
              <p style={{ margin: '8px 0 0', color: '#666', fontSize: 13 }}>
                删除后，这些岗位和员工将自动归入默认条线「{defaultName}」。
                <br />员工运行状态不受影响。
              </p>
            </div>
          )}
          {record.positionCount === 0 && record.employeeCount === 0 && (
            <p style={{ color: '#999', fontSize: 13 }}>该条线下暂无关联岗位和员工。</p>
          )}
        </div>
      ),
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk() {
        setData((prev) => {
          const defaultItem = prev.find((line) => line.isDefault);
          if (!defaultItem) return prev.filter((line) => line.id !== record.id);

          return prev
            .filter((line) => line.id !== record.id)
            .map((line) =>
              line.id === defaultItem.id
                ? {
                    ...line,
                    positionCount: line.positionCount + record.positionCount,
                    employeeCount: line.employeeCount + record.employeeCount,
                  }
                : line,
            );
        });
        message.success(
          record.positionCount > 0
            ? `已删除「${record.name}」，${record.positionCount} 个岗位和 ${record.employeeCount} 位员工已归入「${defaultName}」`
            : `已删除条线「${record.name}」`,
        );
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const colorValue = typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#1677ff';
      if (editingItem) {
        setData((prev) =>
          prev.map((line) => (line.id === editingItem.id ? { ...line, ...values, color: colorValue } : line)),
        );
        message.success('条线已更新');
      } else {
        const newItem: BusinessLineItem = {
          id: `LN${String(data.length + 1).padStart(3, '0')}`,
          ...values,
          color: colorValue,
          isDefault: false,
          positionCount: 0,
          employeeCount: 0,
          createTime: new Date().toISOString().split('T')[0],
        };
        setData((prev) => [...prev, newItem]);
        message.success('条线已创建');
      }
      setModalVisible(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<BusinessLineItem> = [
    { title: '条线ID', dataIndex: 'id', key: 'id', width: 90 },
    {
      title: '条线名称', dataIndex: 'name', key: 'name', width: 140,
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
      <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>岗位所属条线</h2>
      <p style={{ color: '#999', marginBottom: 20 }}>管理数字员工的岗位所属条线体系，定义条线的编码、颜色和排序。系统内置默认条线「办公室」不可编辑删除。</p>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="条线总数" value={data.length} prefix={<TagOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="自定义条线" value={customCount} prefix={<AppstoreOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
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
            placeholder="搜索条线名称/编码"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增条线</Button>
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
        title={editingItem ? '编辑条线' : '新增条线'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        width={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="条线名称" rules={[{ required: true, message: '请输入条线名称' }]}>
            <Input placeholder="如：渠道、市场、客服" />
          </Form.Item>
          <Form.Item name="code" label="条线编码" rules={[{ required: true, message: '请输入条线编码' }]}>
            <Input placeholder="如：CHANNEL、MARKET（全大写英文）" disabled={!!editingItem} />
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
            <Input.TextArea rows={3} placeholder="请输入条线的描述说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PositionTypeConfig;
