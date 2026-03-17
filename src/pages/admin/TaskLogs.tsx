import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Modal,
  Row, Col, Statistic, Descriptions, message, Timeline, DatePicker,
} from 'antd';
import {
  SearchOutlined, DownloadOutlined,
  CheckCircleOutlined, ClockCircleOutlined, WarningOutlined,
  ScheduleOutlined, SyncOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { taskLogs, digitalEmployees, type TaskLogItem } from '../../mock/data';

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

const allDepartments = [...new Set(taskLogs.map((t) => t.department))];

const TaskLogs: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TaskLogItem | null>(null);

  const filtered = taskLogs.filter((t) => {
    const matchSearch = t.taskName.includes(searchText) || t.agentName.includes(searchText) || t.userName.includes(searchText);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchEmployee = employeeFilter === 'all' || t.assignee === employeeFilter;
    const matchDept = departmentFilter === 'all' || t.department === departmentFilter;
    return matchSearch && matchStatus && matchEmployee && matchDept;
  });

  const completedCount = taskLogs.filter((t) => t.status === '已完成').length;
  const runningCount = taskLogs.filter((t) => t.status === '执行中').length;
  const failedCount = taskLogs.filter((t) => t.status === '已失败').length;

  const columns = [
    {
      title: '日志ID', dataIndex: 'id', key: 'id', width: 90,
      render: (t: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t}</span>,
    },
    {
      title: '任务名称', dataIndex: 'taskName', key: 'taskName',
      render: (t: string, record: TaskLogItem) => (
        <Space>
          {statusIcon[record.status]}
          <span style={{ fontWeight: 500 }}>{t}</span>
        </Space>
      ),
    },
    {
      title: '执行员工', dataIndex: 'assignee', key: 'assignee', width: 120,
      render: (id: string) => {
        const emp = digitalEmployees.find((e) => e.id === id);
        return emp ? emp.name : id;
      },
    },
    {
      title: '使用人', dataIndex: 'userName', key: 'userName', width: 80,
    },
    {
      title: '智能体', dataIndex: 'agentName', key: 'agentName', width: 110,
      render: (t: string) => <Tag color="processing">{t}</Tag>,
    },
    {
      title: '部门', dataIndex: 'department', key: 'department', width: 120,
    },
    {
      title: '优先级', dataIndex: 'priority', key: 'priority', width: 80,
      render: (p: string) => <Tag color={priorityColor[p]}>{p}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => <Tag color={statusTagColor[s]}>{s}</Tag>,
    },
    {
      title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150,
    },
    {
      title: '完成时间', dataIndex: 'finishTime', key: 'finishTime', width: 150,
      render: (t?: string) => t || '-',
    },
    {
      title: '耗时', dataIndex: 'duration', key: 'duration', width: 100,
      render: (t?: string) => t || '-',
    },
    {
      title: '操作', key: 'action', width: 80, fixed: 'right' as const,
      render: (_: unknown, record: TaskLogItem) => (
        <Button type="link" size="small" onClick={() => { setSelectedLog(record); setDetailVisible(true); }}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>任务调度日志</h2>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="日志总数" value={taskLogs.length} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="已完成" value={completedCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="执行中" value={runningCount} prefix={<SyncOutlined spin style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="失败数" value={failedCount} prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title={
          <Space>
            <ScheduleOutlined />
            <span>日志列表</span>
          </Space>
        }
        extra={
          <Space wrap>
            <Select
              value={employeeFilter}
              onChange={setEmployeeFilter}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: '全部数字员工' },
                ...digitalEmployees.map((e) => ({ value: e.id, label: e.name })),
              ]}
            />
            <DatePicker.RangePicker style={{ width: 240 }} placeholder={['开始时间', '结束时间']} />
            <Select
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: 140 }}
              options={[
                { value: 'all', label: '全部部门' },
                ...allDepartments.map((d) => ({ value: d, label: d })),
              ]}
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
            <Input.Search
              placeholder="搜索任务名称/智能体/使用人..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={setSearchText}
              style={{ width: 240 }}
              allowClear
            />
            <Button icon={<DownloadOutlined />} onClick={() => message.success('日志导出成功')}>
              导出记录
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条日志` }}
          size="middle"
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={`日志详情 - ${selectedLog?.id}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={640}
      >
        {selectedLog && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="日志ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusTagColor[selectedLog.status]}>{selectedLog.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="任务名称" span={2}>{selectedLog.taskName}</Descriptions.Item>
              <Descriptions.Item label="执行员工">
                {digitalEmployees.find((e) => e.id === selectedLog.assignee)?.name || selectedLog.assignee}
              </Descriptions.Item>
              <Descriptions.Item label="使用人">{selectedLog.userName}</Descriptions.Item>
              <Descriptions.Item label="智能体">
                <Tag color="processing">{selectedLog.agentName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="部门">{selectedLog.department}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={priorityColor[selectedLog.priority]}>{selectedLog.priority}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedLog.createTime}</Descriptions.Item>
              {selectedLog.finishTime && (
                <Descriptions.Item label="完成时间">{selectedLog.finishTime}</Descriptions.Item>
              )}
              {selectedLog.duration && (
                <Descriptions.Item label="耗时">{selectedLog.duration}</Descriptions.Item>
              )}
              {selectedLog.result && (
                <Descriptions.Item label="执行结果" span={2}>{selectedLog.result}</Descriptions.Item>
              )}
            </Descriptions>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>执行时间线：</div>
            <Timeline
              items={[
                { color: 'green', children: `${selectedLog.createTime} 任务创建` },
                { color: 'blue', children: `${selectedLog.createTime} 分配给 ${digitalEmployees.find((e) => e.id === selectedLog.assignee)?.name || selectedLog.assignee}` },
                ...(selectedLog.status !== '待执行' ? [{ color: 'blue' as const, children: `匹配智能体: ${selectedLog.agentName}，使用人: ${selectedLog.userName}` }] : []),
                ...(selectedLog.status === '执行中' ? [{ color: 'blue' as const, children: '任务正在执行中...' }] : []),
                ...(selectedLog.finishTime ? [{ color: 'green' as const, children: `${selectedLog.finishTime} 任务完成${selectedLog.duration ? ` (耗时 ${selectedLog.duration})` : ''}` }] : []),
                ...(selectedLog.status === '已失败' ? [{ color: 'red' as const, children: `执行失败: ${selectedLog.result}` }] : []),
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default TaskLogs;
