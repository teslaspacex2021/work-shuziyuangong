import React, { useMemo, useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Modal,
  Row, Col, Statistic, Descriptions, message, Timeline, DatePicker, List, Avatar,
} from 'antd';
import {
  DownloadOutlined,
  CheckCircleOutlined, ClockCircleOutlined, WarningOutlined,
  ScheduleOutlined, SyncOutlined, FileTextOutlined, MessageOutlined,
  LikeOutlined, DislikeOutlined, UserOutlined, RobotOutlined,
} from '@ant-design/icons';
import {
  taskLogs, digitalEmployees, indicatorLakeRecords, scheduledTasks, scheduledTaskRuns,
  conversationSessions, type TaskLogItem, type ConversationSession,
} from '../../mock/data';

type LogType = '定时任务' | '会话';

type UnifiedLogItem = {
  id: string;
  logType: LogType;
  title: string;
  assignee: string;
  agentName: string;
  department: string;
  userName: string;
  status: string;
  createTime: string;
  finishTime?: string;
  duration?: string;
  result?: string;
  messageCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  sessionMessages?: ConversationSession['messages'];
  cronLabel?: string;
};

const scheduledTaskMap = new Map(scheduledTasks.map((t) => [t.id, t]));

const taskStatusIcon: Record<string, React.ReactNode> = {
  '待执行': <ClockCircleOutlined style={{ color: '#999' }} />,
  '执行中': <SyncOutlined spin style={{ color: '#1677ff' }} />,
  '已完成': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  '已失败': <WarningOutlined style={{ color: '#ff4d4f' }} />,
  '已跳过': <ClockCircleOutlined style={{ color: '#faad14' }} />,
};

const taskStatusTagColor: Record<string, string> = {
  '待执行': 'default',
  '执行中': 'processing',
  '已完成': 'success',
  '已失败': 'error',
  '已跳过': 'warning',
};

const sessionStatusTagColor: Record<string, string> = {
  '正常': 'success',
  '异常': 'error',
  '已归档': 'default',
};

function mapTaskLog(t: TaskLogItem): UnifiedLogItem {
  return {
    id: t.id,
    logType: '定时任务',
    title: t.taskName,
    assignee: t.assignee,
    agentName: t.agentName,
    department: t.department,
    userName: t.userName,
    status: t.status,
    createTime: t.createTime,
    finishTime: t.finishTime,
    duration: t.duration,
    result: t.result,
  };
}

function mapScheduledRun(run: (typeof scheduledTaskRuns)[0]): UnifiedLogItem {
  const task = scheduledTaskMap.get(run.taskId);
  const emp = digitalEmployees.find((e) => e.id === task?.employeeId);
  return {
    id: run.id,
    logType: '定时任务',
    title: task?.name ?? run.taskId,
    assignee: task?.employeeId ?? '',
    agentName: emp?.relatedAgents?.[0] ?? task?.employeeName ?? '-',
    department: emp?.department ?? '-',
    userName: '系统调度',
    status: run.status,
    createTime: run.startTime,
    finishTime: run.finishTime,
    duration: run.duration,
    result: run.result,
    cronLabel: task?.cronLabel,
  };
}

function mapSession(s: ConversationSession): UnifiedLogItem {
  return {
    id: s.id,
    logType: '会话',
    title: s.title,
    assignee: s.employeeId,
    agentName: s.employeeName,
    department: s.department,
    userName: s.userName,
    status: s.status,
    createTime: s.createTime,
    finishTime: s.updateTime,
    duration: `${s.messageCount} 轮`,
    result: `点赞 ${s.likeCount} · 点踩 ${s.dislikeCount}`,
    messageCount: s.messageCount,
    likeCount: s.likeCount,
    dislikeCount: s.dislikeCount,
    sessionMessages: s.messages,
  };
}

function buildUnifiedLogs(): UnifiedLogItem[] {
  const items = [
    ...taskLogs.map(mapTaskLog),
    ...scheduledTaskRuns.map(mapScheduledRun),
    ...conversationSessions.map(mapSession),
  ];
  return items.sort((a, b) => b.createTime.localeCompare(a.createTime));
}

const allUnifiedLogs = buildUnifiedLogs();
const allDepartments = [...new Set(allUnifiedLogs.map((t) => t.department))];

const TaskLogs: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<UnifiedLogItem | null>(null);

  const filtered = useMemo(() => allUnifiedLogs.filter((t) => {
    const matchSearch = t.title.includes(searchText)
      || t.agentName.includes(searchText)
      || t.userName.includes(searchText);
    const matchType = logTypeFilter === 'all' || t.logType === logTypeFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchEmployee = employeeFilter === 'all' || t.assignee === employeeFilter;
    const matchDept = departmentFilter === 'all' || t.department === departmentFilter;
    return matchSearch && matchType && matchStatus && matchEmployee && matchDept;
  }), [searchText, logTypeFilter, statusFilter, employeeFilter, departmentFilter]);

  const scheduleCount = allUnifiedLogs.filter((t) => t.logType === '定时任务').length;
  const sessionCount = allUnifiedLogs.filter((t) => t.logType === '会话').length;
  const completedCount = allUnifiedLogs.filter((t) =>
    t.status === '已完成' || t.status === '正常' || t.status === '已归档',
  ).length;
  const runningCount = allUnifiedLogs.filter((t) => t.status === '执行中').length;
  const failedCount = allUnifiedLogs.filter((t) => t.status === '已失败' || t.status === '异常').length;

  const statusOptions = useMemo(() => {
    if (logTypeFilter === '会话') {
      return [
        { value: 'all', label: '所有状态' },
        { value: '正常', label: '正常' },
        { value: '异常', label: '异常' },
        { value: '已归档', label: '已归档' },
      ];
    }
    if (logTypeFilter === '定时任务') {
      return [
        { value: 'all', label: '所有状态' },
        { value: '待执行', label: '待执行' },
        { value: '执行中', label: '执行中' },
        { value: '已完成', label: '已完成' },
        { value: '已失败', label: '已失败' },
        { value: '已跳过', label: '已跳过' },
      ];
    }
    return [
      { value: 'all', label: '所有状态' },
      { value: '待执行', label: '待执行' },
      { value: '执行中', label: '执行中' },
      { value: '已完成', label: '已完成' },
      { value: '已失败', label: '已失败' },
      { value: '已跳过', label: '已跳过' },
      { value: '正常', label: '正常' },
      { value: '异常', label: '异常' },
      { value: '已归档', label: '已归档' },
    ];
  }, [logTypeFilter]);

  const columns = [
    {
      title: '日志ID', dataIndex: 'id', key: 'id', width: 90,
      render: (t: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t}</span>,
    },
    {
      title: '类型', dataIndex: 'logType', key: 'logType', width: 90,
      render: (t: LogType) => (
        <Tag color={t === '定时任务' ? 'blue' : 'purple'} icon={t === '定时任务' ? <ScheduleOutlined /> : <MessageOutlined />}>
          {t}
        </Tag>
      ),
    },
    {
      title: '名称', dataIndex: 'title', key: 'title',
      render: (t: string, record: UnifiedLogItem) => (
        <Space>
          {record.logType === '定时任务' ? taskStatusIcon[record.status] : <MessageOutlined style={{ color: '#722ed1' }} />}
          <span style={{ fontWeight: 500 }}>{t}</span>
        </Space>
      ),
    },
    {
      title: '执行员工', dataIndex: 'assignee', key: 'assignee', width: 120,
      render: (id: string) => {
        const emp = digitalEmployees.find((e) => e.id === id);
        return emp ? emp.name : id || '-';
      },
    },
    {
      title: '使用人', dataIndex: 'userName', key: 'userName', width: 90,
    },
    {
      title: '智能体/员工', dataIndex: 'agentName', key: 'agentName', width: 120,
      render: (t: string, record: UnifiedLogItem) => (
        <Tag color={record.logType === '会话' ? 'purple' : 'processing'}>{t}</Tag>
      ),
    },
    {
      title: '部门', dataIndex: 'department', key: 'department', width: 120,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string, record: UnifiedLogItem) => (
        <Tag color={record.logType === '会话' ? sessionStatusTagColor[s] : taskStatusTagColor[s]}>{s}</Tag>
      ),
    },
    {
      title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150,
    },
    {
      title: '结束时间', dataIndex: 'finishTime', key: 'finishTime', width: 150,
      render: (t?: string) => t || '-',
    },
    {
      title: '耗时/轮次', dataIndex: 'duration', key: 'duration', width: 100,
      render: (t?: string) => t || '-',
    },
    {
      title: '操作', key: 'action', width: 80, fixed: 'right' as const,
      render: (_: unknown, record: UnifiedLogItem) => (
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
            <Statistic title="日志总数" value={allUnifiedLogs.length} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="定时任务"
              value={scheduleCount}
              prefix={<ScheduleOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="会话"
              value={sessionCount}
              prefix={<MessageOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="异常/失败"
              value={failedCount}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }} size="small">
            <Statistic title="已完成/正常" value={completedCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a', fontSize: 22 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }} size="small">
            <Statistic title="执行中" value={runningCount} prefix={<SyncOutlined spin style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff', fontSize: 22 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }} size="small">
            <Statistic title="筛选结果" value={filtered.length} prefix={<FileTextOutlined />} valueStyle={{ fontSize: 22 }} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title={
          <Space>
            <FileTextOutlined />
            <span>日志列表</span>
            <Tag>定时任务 + 会话</Tag>
          </Space>
        }
        extra={
          <Space wrap>
            <Select
              value={logTypeFilter}
              onChange={(v) => { setLogTypeFilter(v); setStatusFilter('all'); }}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部类型' },
                { value: '定时任务', label: '定时任务' },
                { value: '会话', label: '会话' },
              ]}
            />
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
              options={statusOptions}
            />
            <Input.Search
              placeholder="搜索名称/智能体/使用人..."
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
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title={`${selectedLog?.logType ?? ''}详情 - ${selectedLog?.id}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={680}
      >
        {selectedLog && selectedLog.logType === '定时任务' && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="日志ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="类型"><Tag color="blue">定时任务</Tag></Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={taskStatusTagColor[selectedLog.status]}>{selectedLog.status}</Tag>
              </Descriptions.Item>
              {selectedLog.cronLabel && (
                <Descriptions.Item label="调度周期">{selectedLog.cronLabel}</Descriptions.Item>
              )}
              <Descriptions.Item label="任务名称" span={2}>{selectedLog.title}</Descriptions.Item>
              <Descriptions.Item label="执行员工">
                {digitalEmployees.find((e) => e.id === selectedLog.assignee)?.name || selectedLog.assignee || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="使用人">{selectedLog.userName}</Descriptions.Item>
              <Descriptions.Item label="智能体">
                <Tag color="processing">{selectedLog.agentName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="部门">{selectedLog.department}</Descriptions.Item>
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
                { color: 'green', children: `${selectedLog.createTime} 任务创建/触发` },
                { color: 'blue', children: `分配给 ${digitalEmployees.find((e) => e.id === selectedLog.assignee)?.name || selectedLog.assignee || '未知员工'}` },
                ...(selectedLog.status !== '待执行' ? [{ color: 'blue' as const, children: `匹配智能体: ${selectedLog.agentName}，使用人: ${selectedLog.userName}` }] : []),
                ...(selectedLog.status === '执行中' ? [{ color: 'blue' as const, children: '任务正在执行中...' }] : []),
                ...(selectedLog.finishTime ? [{ color: 'green' as const, children: `${selectedLog.finishTime} 任务完成${selectedLog.duration ? ` (耗时 ${selectedLog.duration})` : ''}` }] : []),
                ...(selectedLog.status === '已失败' ? [{ color: 'red' as const, children: `执行失败: ${selectedLog.result}` }] : []),
                ...(selectedLog.status === '已跳过' ? [{ color: 'orange' as const, children: selectedLog.result ?? '本次调度已跳过' }] : []),
              ]}
            />
          </>
        )}

        {selectedLog && selectedLog.logType === '会话' && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="会话ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="类型"><Tag color="purple">会话</Tag></Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={sessionStatusTagColor[selectedLog.status]}>{selectedLog.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="消息轮次">{selectedLog.messageCount}</Descriptions.Item>
              <Descriptions.Item label="会话标题" span={2}>{selectedLog.title}</Descriptions.Item>
              <Descriptions.Item label="用户">
                <Space><UserOutlined />{selectedLog.userName}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="部门">{selectedLog.department}</Descriptions.Item>
              <Descriptions.Item label="数字员工">
                <Tag color="purple"><RobotOutlined /> {selectedLog.agentName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="反馈">
                <Space>
                  <span style={{ color: '#52c41a' }}><LikeOutlined /> {selectedLog.likeCount}</span>
                  <span style={{ color: '#ff4d4f' }}><DislikeOutlined /> {selectedLog.dislikeCount}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">{selectedLog.createTime}</Descriptions.Item>
              <Descriptions.Item label="最后活跃">{selectedLog.finishTime}</Descriptions.Item>
            </Descriptions>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>会话记录：</div>
            <List
              size="small"
              dataSource={selectedLog.sessionMessages ?? []}
              renderItem={(msg) => (
                <List.Item style={{ border: 'none', padding: '6px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        style={{
                          background: msg.role === 'user' ? '#1677ff' : '#722ed1',
                          fontSize: 11,
                        }}
                      >
                        {msg.role === 'user' ? '用' : 'AI'}
                      </Avatar>
                    }
                    title={<span style={{ fontSize: 12, color: '#999' }}>{msg.time}</span>}
                    description={msg.content}
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>

      <Card
        style={{ borderRadius: 12, marginTop: 20 }}
        title="产出指标入湖（集团宽表）"
        extra={
          <Button
            type="link"
            onClick={() => message.success('已触发同步至刘伟统一日志服务（演示）')}
          >
            同步入湖
          </Button>
        }
      >
        <p style={{ color: '#666', marginBottom: 12, fontSize: 13 }}>
          按集团「数字员工指标统一宽表」规范存储，经省侧汇总后进入全网数据交换枢纽 / 集团大数据湖。
        </p>
        <Table
          size="small"
          rowKey={(r) => r.indicatorCode}
          pagination={false}
          dataSource={indicatorLakeRecords}
          scroll={{ x: 1200 }}
          columns={[
            { title: '月账期', dataIndex: 'monthPeriod', width: 90 },
            { title: '省份', dataIndex: 'provinceCode', width: 70 },
            { title: '归属单位', dataIndex: 'belongUnit', width: 160, ellipsis: true },
            { title: '员工编码', dataIndex: 'employeeCode', width: 140, render: (t: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t}</span> },
            { title: '员工名称', dataIndex: 'employeeName', width: 110 },
            { title: '条线', dataIndex: 'businessLine', width: 70 },
            { title: '指标编码', dataIndex: 'indicatorCode', width: 180, ellipsis: true },
            { title: '指标名称', dataIndex: 'indicatorName', width: 110 },
            {
              title: '清单项(JSON)',
              dataIndex: 'listItemsJson',
              ellipsis: true,
              render: (t: string) => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{t}</span>,
            },
            { title: '数据来源', dataIndex: 'dataSource', width: 120 },
            {
              title: '同步状态',
              dataIndex: 'syncStatus',
              width: 90,
              render: (s: string) => (
                <Tag color={s === '已同步' ? 'success' : s === '失败' ? 'error' : 'processing'}>{s}</Tag>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default TaskLogs;
