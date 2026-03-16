import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Modal, Form,
  Row, Col, Statistic, Descriptions, message, Timeline,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, PlayCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, WarningOutlined,
  ReloadOutlined, ScheduleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { tasks, digitalEmployees, type TaskItem } from '../../mock/data';

const statusIcon: Record<string, React.ReactNode> = {
  '待执行': <ClockCircleOutlined style={{ color: '#999' }} />,
  '执行中': <SyncOutlined spin style={{ color: '#1677ff' }} />,
  '已完成': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  '已失败': <WarningOutlined style={{ color: '#ff4d4f' }} />,
};

const statusTagColor: Record<string, string> = {
  '待执行': 'default',
  '执行中': 'processing',
  '已完成': 'success',
  '已失败': 'error',
};

const priorityColor: Record<string, string> = {
  '高': 'red',
  '中': 'orange',
  '低': 'blue',
};

const TaskManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [form] = Form.useForm();

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.includes(searchText) || t.agentName.includes(searchText);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const completedCount = tasks.filter((t) => t.status === '已完成').length;
  const runningCount = tasks.filter((t) => t.status === '执行中').length;
  const failedCount = tasks.filter((t) => t.status === '已失败').length;

  const columns = [
    {
      title: '任务ID', dataIndex: 'id', key: 'id', width: 80,
      render: (t: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t}</span>,
    },
    {
      title: '任务名称', dataIndex: 'title', key: 'title',
      render: (t: string, record: TaskItem) => (
        <Space>
          {statusIcon[record.status]}
          <span style={{ fontWeight: 500 }}>{t}</span>
        </Space>
      ),
    },
    {
      title: '执行员工', dataIndex: 'assignee', key: 'assignee', width: 130,
      render: (id: string) => {
        const emp = digitalEmployees.find((e) => e.id === id);
        return emp ? emp.name : id;
      },
    },
    {
      title: '智能体', dataIndex: 'agentName', key: 'agentName', width: 100,
      render: (t: string) => <Tag color="processing">{t}</Tag>,
    },
    {
      title: '优先级', dataIndex: 'priority', key: 'priority', width: 80,
      render: (p: string) => <Tag color={priorityColor[p]}>{p}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => <Tag color={statusTagColor[s]}>{s}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
    { title: '完成时间', dataIndex: 'finishTime', key: 'finishTime', width: 150, render: (t?: string) => t || '-' },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: unknown, record: TaskItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setSelectedTask(record); setDetailVisible(true); }}>
            详情
          </Button>
          {record.status === '已失败' && (
            <Button type="link" size="small" icon={<ReloadOutlined />}
              onClick={() => message.success('任务已重新执行')}
            >
              重试
            </Button>
          )}
          {record.status === '待执行' && (
            <Button type="link" size="small" icon={<PlayCircleOutlined />}
              onClick={() => message.success('任务已开始执行')}
            >
              执行
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>任务调度</h2>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="任务总数" value={tasks.length} prefix={<ScheduleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="执行中" value={runningCount} prefix={<SyncOutlined spin style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="已完成" value={completedCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="失败" value={failedCount} prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title="任务列表"
        extra={
          <Space>
            <Input
              placeholder="搜索任务..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '所有状态' },
                { value: '待执行', label: '待执行' },
                { value: '执行中', label: '执行中' },
                { value: '已完成', label: '已完成' },
                { value: '已失败', label: '已失败' },
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: 110 }}
              options={[
                { value: 'all', label: '所有优先级' },
                { value: '高', label: '高优先级' },
                { value: '中', label: '中优先级' },
                { value: '低', label: '低优先级' },
              ]}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
              新建任务
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
        />
      </Card>

      <Modal
        title={`任务详情 - ${selectedTask?.id}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTask && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="任务ID">{selectedTask.id}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusTagColor[selectedTask.status]}>{selectedTask.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="任务名称" span={2}>{selectedTask.title}</Descriptions.Item>
              <Descriptions.Item label="执行员工">
                {digitalEmployees.find((e) => e.id === selectedTask.assignee)?.name || selectedTask.assignee}
              </Descriptions.Item>
              <Descriptions.Item label="智能体">{selectedTask.agentName}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={priorityColor[selectedTask.priority]}>{selectedTask.priority}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedTask.createTime}</Descriptions.Item>
              {selectedTask.finishTime && (
                <Descriptions.Item label="完成时间" span={2}>{selectedTask.finishTime}</Descriptions.Item>
              )}
              {selectedTask.result && (
                <Descriptions.Item label="执行结果" span={2}>{selectedTask.result}</Descriptions.Item>
              )}
            </Descriptions>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>执行日志：</div>
            <Timeline
              items={[
                { color: 'green', children: `${selectedTask.createTime} 任务创建` },
                { color: 'blue', children: `${selectedTask.createTime} 分配给 ${digitalEmployees.find((e) => e.id === selectedTask.assignee)?.name}` },
                ...(selectedTask.status !== '待执行' ? [{ color: 'blue' as const, children: `匹配智能体: ${selectedTask.agentName}` }] : []),
                ...(selectedTask.finishTime ? [{ color: 'green' as const, children: `${selectedTask.finishTime} 任务完成` }] : []),
                ...(selectedTask.status === '已失败' ? [{ color: 'red' as const, children: `执行失败: ${selectedTask.result}` }] : []),
              ]}
            />
          </>
        )}
      </Modal>

      <Modal
        title="新建任务"
        open={addVisible}
        onCancel={() => setAddVisible(false)}
        onOk={() => { message.success('任务创建成功'); setAddVisible(false); }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="任务名称" name="title" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="分配员工" name="assignee" rules={[{ required: true }]}>
                <Select
                  placeholder="选择数字员工"
                  options={digitalEmployees.filter((e) => e.status === 'ACTIVE').map((e) => ({
                    value: e.id, label: e.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="优先级" name="priority" rules={[{ required: true }]}>
                <Select options={[
                  { value: '高', label: '高' },
                  { value: '中', label: '中' },
                  { value: '低', label: '低' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="任务描述" name="description">
            <Input.TextArea rows={3} placeholder="请描述任务内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskManagement;
