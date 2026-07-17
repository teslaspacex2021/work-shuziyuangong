import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Switch, Modal, Form, Input, Select,
  Row, Col, Statistic, message, Typography, Empty, Divider, DatePicker,
  Avatar, Badge, Segmented, TimePicker, InputNumber,
} from 'antd';
import {
  PlusOutlined, ScheduleOutlined, ClockCircleOutlined,
  CheckCircleOutlined, PauseCircleOutlined, DeleteOutlined,
  HistoryOutlined, CloseCircleOutlined, MinusCircleOutlined,
  SyncOutlined, MessageOutlined, SearchOutlined, RobotOutlined, IdcardOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import {
  getAllScheduledTasks, removeScheduledTask, scheduledTaskRuns, digitalEmployees, SCHEDULE_ASSISTANT_ID,
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

type FreqMode = 'period' | 'interval' | 'once';

const PERIOD_OPTIONS = [
  { value: '每天', cronSuffix: '* * *' },
  { value: '每周', cronSuffix: '* * 1' },
  { value: '双周', cronSuffix: '*/14 * *' },
  { value: '每月', cronSuffix: '1 * *' },
  { value: '每年', cronSuffix: '1 1 *' },
];

const WEEKDAY_OPTIONS = [
  { label: '周一', value: '1' },
  { label: '周二', value: '2' },
  { label: '周三', value: '3' },
  { label: '周四', value: '4' },
  { label: '周五', value: '5' },
  { label: '周六', value: '6' },
  { label: '周日', value: '0' },
];

function buildPeriodCron(period: string, time: Dayjs | null): { cronLabel: string; cron: string } {
  const matched = PERIOD_OPTIONS.find((o) => o.value === period) || PERIOD_OPTIONS[0];
  const hh = time?.hour() ?? 9;
  const mm = time?.minute() ?? 0;
  const timeLabel = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  return {
    cronLabel: `${matched.value} ${timeLabel}`,
    cron: `${mm} ${hh} ${matched.cronSuffix}`,
  };
}

function buildIntervalCron(every: number, weekdays: string[] = []): { cronLabel: string; cron: string } {
  const n = Math.max(1, every || 1);
  const days = (weekdays || []).filter(Boolean);
  const dayNames = days
    .map((d) => WEEKDAY_OPTIONS.find((w) => w.value === d)?.label)
    .filter(Boolean);
  const dayCron = days.length ? days.join(',') : '*';
  const dayLabel = dayNames.length ? `（${dayNames.join('、')}）` : '';
  return {
    cronLabel: `每 ${n} 小时${dayLabel}`,
    cron: `0 */${n} * * ${dayCron}`,
  };
}

/** 将历史/旧版频率文案归一到新选项 */
function normalizePeriodLabel(label: string): string {
  if (/^每天/.test(label)) return '每天';
  if (/^双周/.test(label)) return '双周';
  if (/^每年/.test(label)) return '每年';
  if (/^每周/.test(label)) return '每周';
  if (/^每月/.test(label)) return '每月';
  return '每天';
}

function parseIntervalWeekdays(label: string, cron: string): string[] {
  const fromLabel = WEEKDAY_OPTIONS
    .filter((w) => label.includes(w.label))
    .map((w) => w.value);
  if (fromLabel.length) return fromLabel;
  const cronDay = cron.trim().split(/\s+/)[4];
  if (!cronDay || cronDay === '*') return [];
  return cronDay.split(',').map((d) => d.trim()).filter((d) => WEEKDAY_OPTIONS.some((w) => w.value === d));
}

function parseFreqFromTask(task: ScheduledTask): {
  freqMode: FreqMode;
  period: string;
  periodTime: Dayjs;
  intervalEvery: number;
  intervalWeekdays: string[];
  onceAt: Dayjs | null;
} {
  const label = task.cronLabel || '';
  if (label.startsWith('单次')) {
    const raw = label.replace(/^单次\s*/, '').trim();
    return {
      freqMode: 'once',
      period: '每天',
      periodTime: dayjs('09:00', 'HH:mm'),
      intervalEvery: 1,
      intervalWeekdays: [],
      onceAt: raw ? dayjs(raw) : dayjs().add(1, 'hour'),
    };
  }
  const intervalMatch = label.match(/^每\s*(\d+)\s*小时/);
  if (intervalMatch || /^0 \*\/\d+ /.test(task.cron)) {
    return {
      freqMode: 'interval',
      period: '每天',
      periodTime: dayjs('09:00', 'HH:mm'),
      intervalEvery: Number(intervalMatch?.[1] || task.cron.match(/\*\/(\d+)/)?.[1] || 1),
      intervalWeekdays: parseIntervalWeekdays(label, task.cron),
      onceAt: null,
    };
  }
  const legacyInterval = label.match(/^每\s*(\d+)\s*(分钟|天)$/);
  if (legacyInterval) {
    return {
      freqMode: 'interval',
      period: '每天',
      periodTime: dayjs('09:00', 'HH:mm'),
      intervalEvery: Number(legacyInterval[1]) || 1,
      intervalWeekdays: [],
      onceAt: null,
    };
  }
  const timePart = label.split(/\s+/).find((p) => /^\d{1,2}:\d{2}$/.test(p)) || '09:00';
  return {
    freqMode: 'period',
    period: normalizePeriodLabel(label),
    periodTime: dayjs(timePart, 'HH:mm'),
    intervalEvery: 1,
    intervalWeekdays: [],
    onceAt: null,
  };
}

const runStatusColor: Record<ScheduledTaskRun['status'], string> = {
  待执行: 'warning',
  已完成: 'success',
  执行中: 'processing',
  已失败: 'error',
  已跳过: 'default',
};

const runStatusIcon: Record<ScheduledTaskRun['status'], React.ReactNode> = {
  待执行: <ClockCircleOutlined />,
  已完成: <CheckCircleOutlined />,
  执行中: <SyncOutlined spin />,
  已失败: <CloseCircleOutlined />,
  已跳过: <MinusCircleOutlined />,
};

/** 按间隔：周一～周日多选 */
const IntervalWeekdayPicker: React.FC<{
  value?: string[];
  onChange?: (value: string[]) => void;
}> = ({ value = [], onChange }) => {
  const selected = value || [];
  const toggle = (day: string) => {
    const next = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day];
    onChange?.(next);
  };
  return (
    <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
      {WEEKDAY_OPTIONS.map((day) => {
        const active = selected.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            onClick={() => toggle(day.value)}
            style={{
              height: 32,
              minWidth: 44,
              padding: '0 10px',
              border: `1px solid ${active ? BRAND_PRIMARY : '#d9d9d9'}`,
              borderRadius: 6,
              background: active ? '#fff1f0' : '#f5f5f5',
              color: active ? BRAND_PRIMARY : '#666',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
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
      `${base}/chat?intent=createSchedule&employeeId=${employeeId}&draft=${encodeURIComponent(draft)}`,
    );
  };

  const enabledCount = tasks.filter((t) => t.enabled).length;
  const disabledCount = tasks.filter((t) => !t.enabled).length;

  const runHistory = useMemo(() => {
    if (!selectedTask) return [];
    const history = scheduledTaskRuns
      .filter((r) => r.taskId === selectedTask.id)
      .sort((a, b) => b.startTime.localeCompare(a.startTime));

    const nextRun = selectedTask.nextRun?.trim();
    if (!selectedTask.enabled || !nextRun || nextRun === '-') return history;

    const hasPendingNext = history.some(
      (r) => r.status === '待执行' && r.startTime === nextRun,
    );
    if (hasPendingNext) return history;

    const pending: ScheduledTaskRun = {
      id: `${selectedTask.id}-pending-next`,
      taskId: selectedTask.id,
      status: '待执行',
      startTime: nextRun,
      result: '等待到达调度时间后自动执行',
    };
    return [pending, ...history.filter((r) => r.status !== '待执行')];
  }, [selectedTask]);

  const openDetail = (task: ScheduledTask) => {
    setSelectedTask(task);
    const freq = parseFreqFromTask(task);
    editForm.setFieldsValue({
      name: task.name,
      employeeId: task.employeeId,
      description: task.description,
      enabled: task.enabled,
      freqMode: freq.freqMode,
      period: freq.period,
      periodTime: freq.periodTime,
      intervalEvery: freq.intervalEvery,
      intervalWeekdays: freq.intervalWeekdays,
      onceAt: freq.onceAt,
      cron: task.cron,
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

  const freqMode = Form.useWatch('freqMode', editForm) as FreqMode | undefined;
  const isOnceFreq = freqMode === 'once';

  const syncCronFromFreq = (mode: FreqMode, values?: Record<string, unknown>) => {
    const v = values || editForm.getFieldsValue();
    if (mode === 'period') {
      const built = buildPeriodCron(v.period as string, v.periodTime as Dayjs | null);
      editForm.setFieldsValue({ cron: built.cron, cronLabel: built.cronLabel });
      return built;
    }
    if (mode === 'interval') {
      const built = buildIntervalCron(
        Number(v.intervalEvery) || 1,
        (v.intervalWeekdays as string[]) || [],
      );
      editForm.setFieldsValue({ cron: built.cron, cronLabel: built.cronLabel });
      return built;
    }
    const onceAt = v.onceAt as Dayjs | null;
    const label = onceAt ? `单次 ${onceAt.format('YYYY-MM-DD HH:mm')}` : '单次';
    editForm.setFieldsValue({ cron: '-', cronLabel: label });
    return { cronLabel: label, cron: '-' };
  };

  const handleSaveEdit = () => {
    if (!selectedTask) return;
    editForm.validateFields().then((values) => {
      const mode = (values.freqMode as FreqMode) || 'period';
      const built = syncCronFromFreq(mode, values);
      const range = values.effectiveRange as [Dayjs | null, Dayjs | null] | undefined;
      const onceAt = values.onceAt as Dayjs | null;

      let nextRun = selectedTask.nextRun;
      if (mode === 'once' && onceAt) {
        nextRun = onceAt.format('YYYY-MM-DD HH:mm');
      } else if (mode === 'period' && values.periodTime) {
        const t = values.periodTime as Dayjs;
        nextRun = dayjs().hour(t.hour()).minute(t.minute()).second(0)
          .add(1, 'day').format('YYYY-MM-DD HH:mm');
      }

      const updated: ScheduledTask = {
        ...selectedTask,
        name: values.name,
        employeeId: values.employeeId,
        employeeName: digitalEmployees.find((e) => e.id === values.employeeId)?.name || '',
        cronLabel: built.cronLabel,
        cron: built.cron,
        description: values.description || '',
        enabled: values.enabled,
        nextRun,
        effectiveFrom: mode === 'once'
          ? undefined
          : (range?.[0] ? range[0].format('YYYY-MM-DD') : undefined),
        effectiveTo: mode === 'once'
          ? undefined
          : (range?.[1] ? range[1].format('YYYY-MM-DD') : undefined),
      };
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTask(updated);
      message.success('定时任务已更新');
      closeDetail();
    });
  };

  const handleDelete = () => {
    if (!selectedTask) return;
    Modal.confirm({
      title: '确认删除定时任务',
      icon: <ExclamationCircleFilled />,
      content: (
        <p>
          确定要删除定时任务 <strong>「{selectedTask.name}」</strong> 吗？删除后不可恢复。
        </p>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const taskId = selectedTask.id;
        removeScheduledTask(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        message.success('定时任务已删除');
        closeDetail();
      },
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
        if (!record.effectiveFrom) return '始终生效';
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
        footer={
          <Space>
            <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete}>
              删除
            </Button>
            <Button key="cancel" onClick={closeDetail}>
              取消
            </Button>
            <Button key="save" type="primary" onClick={handleSaveEdit}>
              保存
            </Button>
          </Space>
        }
      >
        {selectedTask && (
          <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
            <div style={{ flex: 1, minWidth: 0, minHeight: 0, padding: '20px 24px', overflow: 'auto' }}>
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
                  required
                  style={{ marginBottom: 8 }}
                >
                  <Form.Item name="freqMode" noStyle initialValue="period">
                    <Segmented
                      block
                      options={[
                        { label: '周期', value: 'period' },
                        { label: '按间隔', value: 'interval' },
                        { label: '单次', value: 'once' },
                      ]}
                      onChange={(value) => {
                        const mode = value as FreqMode;
                        if (mode === 'once') {
                          editForm.setFieldsValue({
                            onceAt: editForm.getFieldValue('onceAt') || dayjs().add(1, 'day').hour(9).minute(0),
                            effectiveRange: undefined,
                          });
                        }
                        syncCronFromFreq(mode);
                      }}
                      style={{ marginBottom: 12 }}
                    />
                  </Form.Item>

                  {freqMode !== 'interval' && freqMode !== 'once' && (
                    <Space.Compact style={{ width: '100%' }}>
                      <Form.Item
                        name="period"
                        noStyle
                        rules={[{ required: true, message: '请选择周期' }]}
                      >
                        <Select
                          style={{ width: '50%' }}
                          options={PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.value }))}
                          onChange={() => syncCronFromFreq('period')}
                        />
                      </Form.Item>
                      <Form.Item
                        name="periodTime"
                        noStyle
                        rules={[{ required: true, message: '请选择时间' }]}
                      >
                        <TimePicker
                          style={{ width: '50%' }}
                          format="HH:mm"
                          minuteStep={5}
                          onChange={() => syncCronFromFreq('period')}
                        />
                      </Form.Item>
                    </Space.Compact>
                  )}

                  {freqMode === 'interval' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <Space.Compact style={{ width: 180, flexShrink: 0 }}>
                        <Input
                          style={{ width: 40, pointerEvents: 'none', background: '#fafafa', textAlign: 'center' }}
                          value="每"
                          readOnly
                        />
                        <Form.Item
                          name="intervalEvery"
                          noStyle
                          rules={[{ required: true, message: '请输入间隔' }]}
                          initialValue={1}
                        >
                          <InputNumber
                            min={1}
                            max={999}
                            style={{ width: 72 }}
                            onChange={() => syncCronFromFreq('interval')}
                          />
                        </Form.Item>
                        <Input
                          style={{ width: 52, pointerEvents: 'none', background: '#fafafa', textAlign: 'center' }}
                          value="小时"
                          readOnly
                        />
                      </Space.Compact>
                      <Form.Item name="intervalWeekdays" noStyle initialValue={[]}>
                        <IntervalWeekdayPicker
                          onChange={(days) => {
                            syncCronFromFreq('interval', {
                              ...editForm.getFieldsValue(),
                              intervalWeekdays: days,
                            });
                          }}
                        />
                      </Form.Item>
                    </div>
                  )}

                  {freqMode === 'once' && (
                    <Form.Item
                      name="onceAt"
                      noStyle
                      rules={[{ required: true, message: '请选择执行时间' }]}
                    >
                      <DatePicker
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        style={{ width: '100%' }}
                        placeholder="选择单次执行时间"
                        onChange={() => syncCronFromFreq('once')}
                      />
                    </Form.Item>
                  )}
                </Form.Item>
                <Form.Item name="cronLabel" hidden>
                  <Input />
                </Form.Item>
                {!isOnceFreq && (
                  <Form.Item label="Cron 表达式" name="cron">
                    <Input placeholder="例：0 8 * * *" />
                  </Form.Item>
                )}
                {!isOnceFreq && (
                  <Form.Item
                    label="生效日期"
                    name="effectiveRange"
                    extra="留空表示始终生效"
                  >
                    <DatePicker.RangePicker
                      style={{ width: '100%' }}
                      allowEmpty={[true, true]}
                      placeholder={['生效开始日期（可选）', '结束日期（可选）']}
                    />
                  </Form.Item>
                )}
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
                          <span style={{ fontSize: 12, color: '#999' }}>
                            {run.duration || (run.status === '待执行' ? '待开始' : '-')}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#333', marginBottom: 4 }}>
                          {run.status === '待执行' ? `计划执行 ${run.startTime}` : run.startTime}
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
