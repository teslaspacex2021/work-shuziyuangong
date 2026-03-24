import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Switch, Modal, Form, Input, Select,
  Row, Col, Statistic, message,
} from 'antd';
import {
  PlusOutlined, ScheduleOutlined, ClockCircleOutlined,
  CheckCircleOutlined, PauseCircleOutlined,
} from '@ant-design/icons';
import { scheduledTasks, digitalEmployees, type ScheduledTask } from '../../mock/data';

const EmployeeSchedule: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>(scheduledTasks);
  const [addVisible, setAddVisible] = useState(false);
  const [form] = Form.useForm();

  const enabledCount = tasks.filter((t) => t.enabled).length;
  const disabledCount = tasks.filter((t) => !t.enabled).length;

  const toggleEnabled = (id: string, enabled: boolean) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, enabled } : t));
    message.success(enabled ? '定时任务已启用' : '定时任务已暂停');
  };

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const newTask: ScheduledTask = {
        id: `ST${String(tasks.length + 1).padStart(3, '0')}`,
        name: values.name,
        employeeId: values.employeeId,
        employeeName: digitalEmployees.find((e) => e.id === values.employeeId)?.name || '',
        cron: values.cron || '0 9 * * *',
        cronLabel: values.cronLabel,
        enabled: true,
        nextRun: '2026-03-25 09:00',
        description: values.description || '',
      };
      setTasks((prev) => [...prev, newTask]);
      message.success('定时任务创建成功');
      form.resetFields();
      setAddVisible(false);
    });
  };

  const columns = [
    {
      title: '任务名称', dataIndex: 'name', key: 'name',
      render: (text: string, record: ScheduledTask) => (
        <Space>
          <ScheduleOutlined style={{ color: record.enabled ? '#1677ff' : '#999' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '执行员工', dataIndex: 'employeeName', key: 'employeeName',
      render: (text: string) => <Tag color="processing">{text}</Tag>,
    },
    {
      title: '执行频率', dataIndex: 'cronLabel', key: 'cronLabel',
      render: (text: string) => <Tag icon={<ClockCircleOutlined />}>{text}</Tag>,
    },
    { title: 'Cron表达式', dataIndex: 'cron', key: 'cron', render: (t: string) => <code style={{ fontSize: 12 }}>{t}</code> },
    { title: '上次执行', dataIndex: 'lastRun', key: 'lastRun', render: (t?: string) => t || '-' },
    { title: '下次执行', dataIndex: 'nextRun', key: 'nextRun' },
    {
      title: '状态', key: 'enabled',
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
            <Statistic title="已启用" value={enabledCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="已暂停" value={disabledCount} prefix={<PauseCircleOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title="定时任务列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
            新建定时任务
          </Button>
        }
      >
        <Table dataSource={tasks} columns={columns} rowKey="id" pagination={false} />
      </Card>

      <Modal
        title="新建定时任务"
        open={addVisible}
        onCancel={() => { form.resetFields(); setAddVisible(false); }}
        onOk={handleAdd}
        okText="创建"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="任务名称" name="name" rules={[{ required: true, message: '请输入任务名称' }]}>
            <Input placeholder="例：每日客户工单处理" />
          </Form.Item>
          <Form.Item label="执行员工" name="employeeId" rules={[{ required: true, message: '请选择执行员工' }]}>
            <Select
              placeholder="请选择数字员工"
              options={digitalEmployees.filter((e) => e.status === 'ACTIVE').map((e) => ({
                value: e.id, label: `${e.name} (${e.department})`,
              }))}
            />
          </Form.Item>
          <Form.Item label="执行频率" name="cronLabel" rules={[{ required: true, message: '请选择执行频率' }]}>
            <Select
              placeholder="请选择"
              options={[
                { value: '每天 08:00', label: '每天 08:00' },
                { value: '每天 09:00', label: '每天 09:00' },
                { value: '每周一 09:00', label: '每周一 09:00' },
                { value: '每周五 17:00', label: '每周五 17:00' },
                { value: '每月1日 09:00', label: '每月1日 09:00' },
                { value: '每月15日 09:00', label: '每月15日 09:00' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Cron 表达式（可选）" name="cron">
            <Input placeholder="例：0 8 * * *" />
          </Form.Item>
          <Form.Item label="任务描述" name="description">
            <Input.TextArea rows={3} placeholder="描述该定时任务的执行内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeSchedule;
