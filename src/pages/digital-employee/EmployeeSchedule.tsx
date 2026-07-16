import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Switch, Modal, Form, Input, Select,
  Row, Col, Statistic, message, Typography, Empty, Divider, DatePicker,
  Avatar, Badge,
} from 'antd';
import {
  PlusOutlined, ScheduleOutlined, ClockCircleOutlined,
  CheckCircleOutlined, PauseCircleOutlined,
  HistoryOutlined, CloseCircleOutlined, MinusCircleOutlined,
  SyncOutlined, MessageOutlined, SearchOutlined, RobotOutlined, IdcardOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  getAllScheduledTasks, scheduledTaskRuns, digitalEmployees, SCHEDULE_ASSISTANT_ID,
  type ScheduledTask, type ScheduledTaskRun,
} from '../../mock/data';
import { BRAND_PRIMARY } from '../../theme/brand';
import { fullHeightModalStyles } from '../../components/EmployeeFormModal';

/** 新建定时任务时带入对话输入框的结构化提示词 */
function buildCreateScheduleDraft(employeeName: string): string {
  const today = dayjs().format('YYYY-MM-DD');
  const endDate = dayjs().add(6, 'month').format('YYYY-MM-DD');
  return [
    '请帮我创建一个定时任务，参数如下：',
    '',
    `【任务标题】${employeeName}·日常任务`,
    `【执行员工】${employeeName}`,
    '【执行频率】每天 08:00',
    '【Cron表达式】0 8 * * *',
    '【任务描述】请补充具体执行内容，例如：汇总待办、生成日报、巡检异常等',
    `【生效日期】${today} ~ ${endDate}`,
    '【启用状态】启用',
    '',
    '请按以上配置创建；如需调整标题、频率或描述，直接改上面字段后发送即可。',
  ].join('\n');
}

const empStatusColor: Record<string, string> = {
  ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
};
const empStatusLabel: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};

const CRON_OPTIONS = [
  { value: '每天 08:00', cron: '0 8 * * *' },
  { value: '每天 09:00', cron: '0 9 * * *' },
  { value: '每周一 09:00', cron: '0 9 * * 1' },
  { value: '每周五 17:00', cron: '0 17 * * 5' },
  { value: '每月1日 09:00', cron: '0 9 1 * *' },
  { value: '每月15日 09:00', cron: '0 9 15 * *' },
];

const runStatusColor: Record<ScheduledTaskRun['status'], string> = {
  已完成: 'success',
  执行中: 'processing',
  已失败: 'error',
  已跳过: 'default',
};

const runStatusIcon: Record<ScheduledTaskRun['status'], React.ReactNode> = {
  已完成: <CheckCircleOutlined />,
  执行中: <SyncOutlined spin />,
  已失败: <CloseCircleOutlined />,
  已跳过: <MinusCircleOutlined />,
};

const EmployeeSchedule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tasks, setTasks] = useState<ScheduledTask[]>(() => getAllScheduledTasks());
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  const [editForm] = Form.useForm();
  const [pickVisible, setPickVisible] = useState(false);
  const [pickSearch, setPickSearch] = useState('');

  useEffect(() => {
    setTasks(getAllScheduledTasks());
  }, [location.key]);

  const pickableEmployees = useMemo(() => {
    const list = digitalEmployees.filter((e) => e.id !== SCHEDULE_ASSISTANT_ID);
    if (!pickSearch.trim()) return list;
    const q = pickSearch.toLowerCase();
    return list.filter((e) =>
      e.name.toLowerCase().includes(q)
      || e.position.toLowerCase().includes(q)
      || e.department.toLowerCase().includes(q),
    );
  }, [pickSearch]);

  const openCreatePicker = () => {
    setPickSearch('');
    setPickVisible(true);
  };

  const goCreateViaChat = (employeeId: string) => {
    const base = location.pathname.startsWith('/user/') ? '/user' : '/digital-employee';
    const emp = digitalEmployees.find((e) => e.id === employeeId);
    const draft = buildCreateScheduleDraft(emp?.name || '数字员工');
    setPickVisible(false);
    setPickSearch('');
    navigate(
      `${base}/chat?employeeId=${employeeId}&draft=${encodeURIComponent(draft)}`,
    );
  };

  const enabledCount = tasks.filter((t) => t.enabled).length;
  const disabledCount = tasks.filter((t) => !t.enabled).length;

  const runHistory = useMemo(() => {
    if (!selectedTask) return [];
    return scheduledTaskRuns
      .filter((r) => r.taskId === selectedTask.id)
      .sort((a, b) => b.startTime.localeCompare(a.startTime));
  }, [selectedTask]);

  const openDetail = (task: ScheduledTask) => {
    setSelectedTask(task);
    editForm.setFieldsValue({
      name: task.name,
      employeeId: task.employeeId,
      cronLabel: task.cronLabel,
      cron: task.cron,
      description: task.description,
      enabled: task.enabled,
      effectiveRange: task.effectiveFrom
        ? [
            dayjs(task.effectiveFrom),
            task.effectiveTo ? dayjs(task.effectiveTo) : null,
          ]
        : undefined,
    });
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedTask(null);
    editForm.resetFields();
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, enabled } : t)));
    if (selectedTask?.id === id) {
      setSelectedTask((prev) => (prev ? { ...prev, enabled } : prev));
    }
    message.success(enabled ? '定时任务已启用' : '定时任务已暂停');
  };

  const handleSaveEdit = () => {
    if (!selectedTask) return;
    editForm.validateFields().then((values) => {
      const matched = CRON_OPTIONS.find((o) => o.value === values.cronLabel);
      const range = values.effectiveRange as [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined;
      const updated: ScheduledTask = {
        ...selectedTask,
        name: values.name,
        employeeId: values.employeeId,
        employeeName: digitalEmployees.find((e) => e.id === values.employeeId)?.name || '',
        cronLabel: values.cronLabel,
        cron: values.cron || matched?.cron || selectedTask.cron,
        description: values.description || '',
        enabled: values.enabled,
        effectiveFrom: range?.[0] ? range[0].format('YYYY-MM-DD') : undefined,
        effectiveTo: range?.[1] ? range[1].format('YYYY-MM-DD') : undefined,
      };
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTask(updated);
      message.success('定时任务已更新');
      closeDetail();
    });
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ScheduledTask) => (
        <Space>
          <ScheduleOutlined style={{ color: record.enabled ? '#1677ff' : '#999' }} />
          <Typography.Link
            onClick={() => openDetail(record)}
            style={{ fontWeight: 500 }}
          >
            {text}
          </Typography.Link>
        </Space>
      ),
    },
    {
      title: '执行员工',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text: string) => <Tag color="processing">{text}</Tag>,
    },
    {
      title: '执行频率',
      dataIndex: 'cronLabel',
      key: 'cronLabel',
      render: (text: string) => <Tag icon={<ClockCircleOutlined />}>{text}</Tag>,
    },
    {
      title: '生效日期',
      key: 'effectiveDate',
      width: 200,
      render: (_: unknown, record: ScheduledTask) => {
        if (!record.effectiveFrom) return '-';
        return record.effectiveTo
          ? `${record.effectiveFrom} ~ ${record.effectiveTo}`
          : `${record.effectiveFrom} 起`;
      },
    },
    {
      title: 'Cron表达式',
      dataIndex: 'cron',
      key: 'cron',
      render: (t: string) => <code style={{ fontSize: 12 }}>{t}</code>,
    },
    {
      title: '上次执行',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (t?: string) => t || '-',
    },
    { title: '下次执行', dataIndex: 'nextRun', key: 'nextRun' },
    {
      title: '状态',
      key: 'enabled',
      render: (_: unknown, record: ScheduledTask) => (
        <Switch
          checked={record.enabled}
          onChange={(checked) => toggleEnabled(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="暂停"
        />
      ),
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  ];

  const employeeOptions = digitalEmployees
    .filter((e) => e.status === 'ACTIVE')
    .map((e) => ({ value: e.id, label: `${e.name} (${e.department})` }));

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ScheduleOutlined style={{ color: '#1677ff' }} />
        定时任务管理
      </h2>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
        为数字员工配置周期性自动化任务，系统将按设定时间自动触发执行。
      </p>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="任务总数" value={tasks.length} prefix={<ScheduleOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="已启用"
              value={enabledCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="已暂停"
              value={disabledCount}
              prefix={<PauseCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title="定时任务列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreatePicker}>
            新建定时任务
          </Button>
        }
      >
        <div style={{ marginBottom: 12, fontSize: 13, color: '#999' }}>
          <MessageOutlined style={{ marginRight: 6 }} />
          点击「新建定时任务」先选择执行员工，再进入其对应对话页，通过自然语言创建定时任务
        </div>
        <Table dataSource={tasks} columns={columns} rowKey="id" pagination={false} />
      </Card>

      <Modal
        title={<span><RobotOutlined style={{ marginRight: 8 }} />选择执行定时任务的数字员工</span>}
        open={pickVisible}
        onCancel={() => { setPickVisible(false); setPickSearch(''); }}
        footer={null}
        width={800}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Input
          placeholder="搜索数字员工名称、岗位、部门..."
          prefix={<SearchOutlined />}
          value={pickSearch}
          onChange={(e) => setPickSearch(e.target.value)}
          allowClear
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
        <div style={{ maxHeight: 460, overflow: 'auto' }}>
          <Row gutter={[12, 12]}>
            {pickableEmployees.map((emp) => (
              <Col key={emp.id} xs={24} sm={12} md={8}>
                <Card
                  size="small"
                  hoverable
                  style={{ borderRadius: 10 }}
                  styles={{ body: { padding: '14px 16px' } }}
                  onClick={() => goCreateViaChat(emp.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge dot color={empStatusColor[emp.status]} offset={[-2, 32]}>
                      <Avatar size={40} src={emp.avatar} style={{ flexShrink: 0 }} />
                    </Badge>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</span>
                        <Tag
                          color={empStatusColor[emp.status]}
                          style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0, borderRadius: 4 }}
                        >
                          {empStatusLabel[emp.status]}
                        </Tag>
                      </div>
                      <div style={{
                        fontSize: 12, color: '#999', marginTop: 2,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <IdcardOutlined style={{ fontSize: 11 }} />
                        {emp.department} · {emp.position}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
            {pickableEmployees.length === 0 && (
              <Col span={24}>
                <Empty description="暂无匹配的数字员工" style={{ padding: 40 }} />
              </Col>
            )}
          </Row>
        </div>
      </Modal>

      <Modal
        title={
          <Space>
            <ScheduleOutlined style={{ color: BRAND_PRIMARY }} />
            <span>任务详情 — {selectedTask?.name}</span>
          </Space>
        }
        open={detailVisible}
        onCancel={closeDetail}
        width={1080}
        centered={false}
        style={{ top: 0, paddingBottom: 0, maxWidth: '100vw' }}
        styles={{
          ...fullHeightModalStyles,
          body: { ...fullHeightModalStyles.body, padding: 0, overflow: 'hidden' },
        }}
        footer={[
          <Button key="cancel" onClick={closeDetail}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveEdit}>
            保存
          </Button>,
        ]}
      >
        {selectedTask && (
          <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
            <div style={{ flex: 1, minWidth: 0, minHeight: 0, padding: '20px 24px', overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>基本信息</div>
              <Form form={editForm} layout="vertical">
                <Form.Item
                  label="名称"
                  name="name"
                  rules={[{ required: true, message: '请输入任务名称' }]}
                >
                  <Input placeholder="请输入任务名称" />
                </Form.Item>
                <Form.Item
                  label="执行员工"
                  name="employeeId"
                  rules={[{ required: true, message: '请选择执行员工' }]}
                >
                  <Select options={employeeOptions} />
                </Form.Item>
                <Form.Item label="任务描述" name="description">
                  <Input.TextArea rows={4} placeholder="描述该定时任务的执行内容" />
                </Form.Item>
                <Form.Item
                  label="执行频率"
                  name="cronLabel"
                  rules={[{ required: true, message: '请选择执行频率' }]}
                >
                  <Select
                    options={CRON_OPTIONS.map((o) => ({ value: o.value, label: o.value }))}
                    onChange={(value) => {
                      const matched = CRON_OPTIONS.find((o) => o.value === value);
                      if (matched) editForm.setFieldValue('cron', matched.cron);
                    }}
                  />
                </Form.Item>
                <Form.Item label="Cron 表达式" name="cron">
                  <Input placeholder="例：0 8 * * *" />
                </Form.Item>
                <Form.Item
                  label="生效日期"
                  name="effectiveRange"
                  rules={[{ required: true, message: '请选择生效日期' }]}
                >
                  <DatePicker.RangePicker
                    style={{ width: '100%' }}
                    allowEmpty={[false, true]}
                    placeholder={['生效开始日期', '结束日期（可选）']}
                  />
                </Form.Item>
                <Form.Item label="启用状态" name="enabled" valuePropName="checked">
                  <Switch checkedChildren="启用" unCheckedChildren="暂停" />
                </Form.Item>
                <div style={{ fontSize: 12, color: '#999' }}>
                  上次执行 {selectedTask.lastRun || '-'} · 下次执行 {selectedTask.nextRun}
                </div>
              </Form>
            </div>

            <div
              style={{
                width: 340,
                flexShrink: 0,
                borderLeft: '1px solid #f0f0f0',
                background: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f0f0f0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <HistoryOutlined />
                运行历史 ({runHistory.length})
              </div>
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '8px 12px 16px' }}>
                {!runHistory.length ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无运行记录"
                    style={{ marginTop: 48 }}
                  />
                ) : (
                  runHistory.map((run, index) => (
                    <div key={run.id}>
                      <div style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Tag color={runStatusColor[run.status]} icon={runStatusIcon[run.status]}>
                            {run.status}
                          </Tag>
                          <span style={{ fontSize: 12, color: '#999' }}>{run.duration || '-'}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#333', marginBottom: 4 }}>
                          {run.startTime}
                          {run.finishTime ? ` → ${run.finishTime.slice(11)}` : ''}
                        </div>
                        <Typography.Paragraph
                          type="secondary"
                          style={{ fontSize: 12, marginBottom: 0 }}
                          ellipsis={{ rows: 2 }}
                        >
                          {run.result || '无结果说明'}
                        </Typography.Paragraph>
                      </div>
                      {index < runHistory.length - 1 && <Divider style={{ margin: '0 8px' }} />}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeSchedule;
