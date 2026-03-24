import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Modal, Form,
  Row, Col, Statistic, message,
} from 'antd';
import {
  MessageOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, SearchOutlined,
} from '@ant-design/icons';
import { feedbackList, type FeedbackItem } from '../../mock/data';

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

const AdminFeedbackList: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(feedbackList);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [replyVisible, setReplyVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [replyForm] = Form.useForm();

  const filtered = feedbacks.filter((f) => {
    const matchSearch = f.title.includes(searchText) || f.content.includes(searchText) || f.employeeName.includes(searchText) || f.userName.includes(searchText);
    const matchType = typeFilter === 'all' || f.type === typeFilter;
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const pendingCount = feedbacks.filter((f) => f.status === '待处理').length;
  const processingCount = feedbacks.filter((f) => f.status === '处理中').length;
  const resolvedCount = feedbacks.filter((f) => f.status === '已解决').length;

  const handleReply = () => {
    replyForm.validateFields().then((values) => {
      if (!selectedFeedback) return;
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === selectedFeedback.id
            ? { ...f, reply: values.reply, status: values.status, updateTime: now }
            : f
        ),
      );
      message.success('回复成功');
      replyForm.resetFields();
      setReplyVisible(false);
    });
  };

  const columns = [
    {
      title: 'ID', dataIndex: 'id', key: 'id', width: 80,
      render: (t: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t}</span>,
    },
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
      title: '提交人', key: 'user', width: 140,
      render: (_: unknown, record: FeedbackItem) => (
        <span>{record.userName} ({record.department})</span>
      ),
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
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 160 },
    {
      title: '操作', key: 'action', width: 120, fixed: 'right' as const,
      render: (_: unknown, record: FeedbackItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setSelectedFeedback(record); setDetailVisible(true); }}>
            详情
          </Button>
          {(record.status === '待处理' || record.status === '处理中') && (
            <Button type="link" size="small" onClick={() => {
              setSelectedFeedback(record);
              replyForm.setFieldsValue({ status: '已解决', reply: record.reply || '' });
              setReplyVisible(true);
            }}>
              回复
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>意见反馈管理</h2>
      <p style={{ color: '#666', marginBottom: 20, marginTop: -12 }}>
        查看和处理用户对数字员工的反馈意见。
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
        title="反馈列表"
        extra={
          <Space>
            <Input
              placeholder="搜索反馈标题/内容/用户..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
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
          </Space>
        }
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条反馈` }}
          size="middle"
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={`回复反馈 - ${selectedFeedback?.title}`}
        open={replyVisible}
        onCancel={() => { replyForm.resetFields(); setReplyVisible(false); }}
        onOk={handleReply}
        okText="提交回复"
        width={560}
      >
        {selectedFeedback && (
          <div>
            <Card size="small" style={{ borderRadius: 8, marginBottom: 16, background: '#fafafa' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                {selectedFeedback.userName} · {selectedFeedback.createTime}
              </div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{selectedFeedback.title}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{selectedFeedback.content}</div>
            </Card>
            <Form form={replyForm} layout="vertical">
              <Form.Item label="处理状态" name="status" rules={[{ required: true }]}>
                <Select options={[
                  { label: '处理中', value: '处理中' },
                  { label: '已解决', value: '已解决' },
                  { label: '已关闭', value: '已关闭' },
                ]} />
              </Form.Item>
              <Form.Item label="回复内容" name="reply" rules={[{ required: true, message: '请输入回复内容' }]}>
                <Input.TextArea rows={4} placeholder="请输入回复内容..." />
              </Form.Item>
            </Form>
          </div>
        )}
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminFeedbackList;
