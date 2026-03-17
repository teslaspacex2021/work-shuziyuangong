import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Avatar, Modal, Input, Select,
  Row, Col, Statistic, Descriptions, Progress, Tooltip,
} from 'antd';
import {
  SearchOutlined, TeamOutlined, CheckCircleOutlined,
  ExperimentOutlined, PauseCircleOutlined, EyeOutlined, FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { digitalEmployees, type DigitalEmployee } from '../../mock/data';

const statusColorMap: Record<DigitalEmployee['status'], string> = {
  ACTIVE: 'success',
  TRAINING: 'processing',
  SUSPENDED: 'warning',
  TERMINATED: 'error',
};

const statusLabelMap: Record<DigitalEmployee['status'], string> = {
  ACTIVE: 'ACTIVE',
  TRAINING: 'TRAINING',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
};

const OnDutyManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [deptFilter, setDeptFilter] = useState<string | undefined>(undefined);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<DigitalEmployee | null>(null);

  const onDutyList = useMemo(
    () => digitalEmployees.filter((e) => e.status !== 'TERMINATED'),
    [],
  );

  const departments = useMemo(
    () => [...new Set(onDutyList.map((e) => e.department))],
    [onDutyList],
  );

  const filteredData = useMemo(() => {
    return onDutyList.filter((e) => {
      const matchSearch =
        !searchText ||
        e.name.includes(searchText) ||
        e.id.includes(searchText);
      const matchStatus = !statusFilter || e.status === statusFilter;
      const matchDept = !deptFilter || e.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [onDutyList, searchText, statusFilter, deptFilter]);

  const activeCount = onDutyList.filter((e) => e.status === 'ACTIVE').length;
  const trainingCount = onDutyList.filter((e) => e.status === 'TRAINING').length;
  const suspendedCount = onDutyList.filter((e) => e.status === 'SUSPENDED').length;

  const columns: ColumnsType<DigitalEmployee> = [
    { title: '工号', dataIndex: 'id', key: 'id', width: 120 },
    {
      title: '数字形象', dataIndex: 'avatar', key: 'avatar', width: 80,
      render: (text: string, record) => (
        <Avatar style={{ backgroundColor: '#1677ff' }}>{text || record.name.charAt(0)}</Avatar>
      ),
    },
    { title: '员工名称', dataIndex: 'name', key: 'name', width: 130 },
    { title: '所属自然人', dataIndex: 'owner', key: 'owner', width: 100 },
    {
      title: '身份', dataIndex: 'ownerType', key: 'ownerType', width: 80,
      render: (type: string) => (
        <Tag color={type === '自有' ? 'blue' : 'orange'}>{type}</Tag>
      ),
    },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 130 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: DigitalEmployee['status']) => (
        <Tag color={statusColorMap[status]}>{statusLabelMap[status]}</Tag>
      ),
    },
    { title: '最近活跃', dataIndex: 'lastActive', key: 'lastActive', width: 110 },
    {
      title: '操作', key: 'action', width: 130, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setCurrentEmployee(record); setDetailVisible(true); }}>详情</Button>
          <Button type="link" size="small" icon={<FileTextOutlined />}>日志</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>在岗管理</h2>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>效能评估</div>
              <Progress type="dashboard" percent={85} format={() => '85/100'} strokeColor="#1677ff" />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>合规评估</div>
              <Progress type="dashboard" percent={98} format={() => '98/100'} strokeColor="#52c41a" />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>安全评估</div>
              <Progress type="dashboard" percent={70} format={() => '70/100'} strokeColor="#faad14" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="在岗总数" value={onDutyList.length} prefix={<TeamOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="ACTIVE" value={activeCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="TRAINING" value={trainingCount} prefix={<ExperimentOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="SUSPENDED" value={suspendedCount} prefix={<PauseCircleOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="搜索员工名称/工号"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            placeholder="状态筛选"
            style={{ width: 140 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'ACTIVE', value: 'ACTIVE' },
              { label: 'TRAINING', value: 'TRAINING' },
              { label: 'SUSPENDED', value: 'SUSPENDED' },
            ]}
          />
          <Select
            placeholder="部门筛选"
            style={{ width: 160 }}
            allowClear
            value={deptFilter}
            onChange={setDeptFilter}
            options={departments.map((d) => ({ label: d, value: d }))}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Modal
        title="员工详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentEmployee && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="工号">{currentEmployee.id}</Descriptions.Item>
            <Descriptions.Item label="员工名称">{currentEmployee.name}</Descriptions.Item>
            <Descriptions.Item label="所属自然人">{currentEmployee.owner}</Descriptions.Item>
            <Descriptions.Item label="身份">
              <Tag color={currentEmployee.ownerType === '自有' ? 'blue' : 'orange'}>{currentEmployee.ownerType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="部门">{currentEmployee.department}</Descriptions.Item>
            <Descriptions.Item label="岗位">{currentEmployee.position}</Descriptions.Item>
            <Descriptions.Item label="能力等级">
              <Tag color="blue">{currentEmployee.level}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColorMap[currentEmployee.status]}>{statusLabelMap[currentEmployee.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="入职日期">{currentEmployee.onboardDate}</Descriptions.Item>
            <Descriptions.Item label="最近活跃">{currentEmployee.lastActive}</Descriptions.Item>
            <Descriptions.Item label="Tokens 配额">{currentEmployee.tokensQuota.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Tokens 已用">{currentEmployee.tokensUsed.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="任务完成率" span={2}>
              <Progress percent={currentEmployee.taskCompleteRate} size="small" style={{ width: 200 }} />
            </Descriptions.Item>
            <Descriptions.Item label="技能" span={2}>
              <Space wrap>
                {currentEmployee.skills.map((s) => <Tag key={s}>{s}</Tag>)}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="关联智能体" span={2}>
              <Space wrap>
                {currentEmployee.relatedAgents.map((a) => (
                  <Tooltip key={a} title={a}><Tag color="purple">{a}</Tag></Tooltip>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{currentEmployee.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OnDutyManagement;
