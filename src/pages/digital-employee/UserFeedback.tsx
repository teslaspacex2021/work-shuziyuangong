import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Modal, Form,
  Row, Col, Statistic, message, Rate, Empty,
} from 'antd';
import {
  PlusOutlined, MessageOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { feedbackList, digitalEmployees, type FeedbackItem } from '../../mock/data';

const typeColor: Record<string, string> = {
  '功能建议': 'blue',
  '体验问题': 'orange',
  '错误反馈': 'red',
  '其他': 'default',
};
const statusColor: Record<string, string> = {
  '待处理': 'default',
  '处理中': 'processing',
  '已解决': 'success',
  '已关闭': 'default',
};
const priorityColor: Record<string, string> = {
  '高': 'red',
  '中': 'orange',
  '低': 'blue',
};

const UserFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(feedbackList);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addVisible, setAddVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [form] = Form.useForm();

  const filtered = feedbacks.filter((f) => {
    const matchSearch = f.title.includes(searchText) || f.content.includes(searchText) || f.employeeName.includes(searchText);
    const matchType = typeFilter === 'all' || f.type === typeFilter;
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const pendingCount = feedbacks.filter((f) => f.status === '待处理').length;
  const processingCount = feedbacks.filter((f) => f.status === '处理中').length;
  const resolvedCount = feedbacks.filter((f) => f.status === '已解决').length;

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const newFeedback: FeedbackItem = {
        id: `FB${String(feedbacks.length + 1).padStart(3, '0')}`,
        userId: 'U004',
        userName: '当前用户',
        department: '客户服务部',
        employeeId: values.employeeId,
        employeeName: digitalEmployees.find((e) => e.id === values.employeeId)?.name || '',
        type: values.type,
        title: values.title,
        content: values.content,
        status: '待处理',
        priority: values.priority || '中',
        createTime: now,
        updateTime: now,
      };
      setFeedbacks((prev) => [newFeedback, ...prev]);
      message.success('反馈提交成功，感谢您的建议！');
      form.resetFields();
      setAddVisible(false);
    });
  };

  const columns = [
    {
      title: '标题', dataIndex: 'title', key: 'title', ellipsis: true,
      render: (text: string, record: FeedbackItem) => (
        <a onClick={() => { setSelectedFeedback(record); setDetailVisible(true); }}>{text}</a>
      ),
    },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (t: string) => <Tag color={typeColor[t]}>{t}</Tag>,
    },
    {
      title: '关联员工', dataIndex: 'employeeName', key: 'employeeName', width: 120,
      render: (t: string) => <Tag color="processing">{t}</Tag>,
    },
    {
      title: '优先级', dataIndex: 'priority', key: 'priority', width: 80,
      render: (p: string) => <Tag color={priorityColor[p]}>{p}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
    },
    { title: '提交时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
    {
      title: '操作', key: 'action', width: 80,
      render: (_: unknown, record: FeedbackItem) => (
        <Button type="link" size="small" onClick={() => { setSelectedFeedback(record); setDetailVisible(true); }}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageOutlined style={{ color: '#1677ff' }} />
        意见反馈
      </h2>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
        对数字员工的使用体验和功能提出宝贵意见，帮助我们持续改进。
      </p>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="反馈总数" value={feedbacks.length} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="待处理" value={pendingCount} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="处理中" value={processingCount} prefix={<ExclamationCircleOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="已解决" value={resolvedCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title="我的反馈"
        extra={
          <Space>
            <Input
              placeholder="搜索反馈..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 120 }} options={[
              { label: '全部类型', value: 'all' },
              { label: '功能建议', value: '功能建议' },
              { label: '体验问题', value: '体验问题' },
              { label: '错误反馈', value: '错误反馈' },
              { label: '其他', value: '其他' },
            ]} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }} options={[
              { label: '全部状态', value: 'all' },
              { label: '待处理', value: '待处理' },
              { label: '处理中', value: '处理中' },
              { label: '已解决', value: '已解决' },
              { label: '已关闭', value: '已关闭' },
            ]} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
              提交反馈
            </Button>
          </Space>
        }
      >
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="提交反馈"
        open={addVisible}
        onCancel={() => { form.resetFields(); setAddVisible(false); }}
        onOk={handleAdd}
        okText="提交"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="反馈标题" name="title" rules={[{ required: true, message: '请输入反馈标题' }]}>
            <Input placeholder="请简要描述您的反馈" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="反馈类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
                <Select placeholder="请选择" options={[
                  { label: '功能建议', value: '功能建议' },
                  { label: '体验问题', value: '体验问题' },
                  { label: '错误反馈', value: '错误反馈' },
                  { label: '其他', value: '其他' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="优先级" name="priority" initialValue="中">
                <Select options={[
                  { label: '高', value: '高' },
                  { label: '中', value: '中' },
                  { label: '低', value: '低' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="关联数字员工" name="employeeId" rules={[{ required: true, message: '请选择关联的数字员工' }]}>
            <Select
              placeholder="请选择"
              options={digitalEmployees.map((e) => ({ value: e.id, label: `${e.name} (${e.department})` }))}
            />
          </Form.Item>
          <Form.Item label="详细描述" name="content" rules={[{ required: true, message: '请输入详细描述' }]}>
            <Input.TextArea rows={4} placeholder="请详细描述您遇到的问题或建议..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`反馈详情 - ${selectedFeedback?.id}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedFeedback && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8 }}>{selectedFeedback.title}</h3>
              <Space>
                <Tag color={typeColor[selectedFeedback.type]}>{selectedFeedback.type}</Tag>
                <Tag color={statusColor[selectedFeedback.status]}>{selectedFeedback.status}</Tag>
                <Tag color={priorityColor[selectedFeedback.priority]}>优先级：{selectedFeedback.priority}</Tag>
              </Space>
            </div>
            <Card size="small" style={{ borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                {selectedFeedback.userName} ({selectedFeedback.department}) · {selectedFeedback.createTime}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.8 }}>{selectedFeedback.content}</div>
              <div style={{ marginTop: 8 }}>
                <Tag color="processing">关联：{selectedFeedback.employeeName}</Tag>
              </div>
            </Card>
            {selectedFeedback.reply && (
              <Card size="small" style={{ borderRadius: 8, background: '#f6ffed', borderColor: '#b7eb8f' }}>
                <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 8, fontWeight: 500 }}>
                  <CheckCircleOutlined /> 管理员回复 · {selectedFeedback.updateTime}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.8 }}>{selectedFeedback.reply}</div>
              </Card>
            )}
            {!selectedFeedback.reply && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂未回复" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserFeedback;
