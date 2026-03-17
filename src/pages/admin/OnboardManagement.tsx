import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Modal, Input, Select,
  Descriptions, Steps,
} from 'antd';
import {
  SearchOutlined, EyeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, LoadingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { onboardRecords, type OnboardRecord } from '../../mock/data';

const statusColorMap: Record<OnboardRecord['status'], string> = {
  '待提交': 'default',
  '部门审批': 'processing',
  '人力审批': 'processing',
  '技术配置': 'warning',
  '已完成': 'success',
  '已驳回': 'error',
};

const stepStatusMap: Record<string, 'finish' | 'process' | 'wait' | 'error'> = {
  '已完成': 'finish',
  '进行中': 'process',
  '待处理': 'wait',
  '已驳回': 'error',
};

const stepIconMap: Record<string, React.ReactNode> = {
  '已完成': <CheckCircleOutlined />,
  '进行中': <LoadingOutlined />,
  '待处理': <ClockCircleOutlined />,
  '已驳回': <CloseCircleOutlined />,
};

const OnboardManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<OnboardRecord | null>(null);

  const filteredData = useMemo(() => {
    return onboardRecords.filter((r) => {
      const matchSearch =
        !searchText ||
        r.employeeName.includes(searchText) ||
        r.id.includes(searchText);
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchText, statusFilter]);

  const columns: ColumnsType<OnboardRecord> = [
    { title: '申请单号', dataIndex: 'id', key: 'id', width: 110 },
    { title: '员工名称', dataIndex: 'employeeName', key: 'employeeName', width: 120 },
    { title: '所属自然人', dataIndex: 'owner', key: 'owner', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 130 },
    { title: '申请日期', dataIndex: 'applyDate', key: 'applyDate', width: 120 },
    {
      title: '当前状态', dataIndex: 'status', key: 'status', width: 110,
      render: (status: OnboardRecord['status']) => (
        <Tag color={statusColorMap[status]}>{status}</Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 80, fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => { setCurrentRecord(record); setDetailVisible(true); }}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>入职管理</h2>

      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="搜索员工名称/申请单号"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="状态筛选"
            style={{ width: 140 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '待提交', value: '待提交' },
              { label: '部门审批', value: '部门审批' },
              { label: '人力审批', value: '人力审批' },
              { label: '技术配置', value: '技术配置' },
              { label: '已完成', value: '已完成' },
              { label: '已驳回', value: '已驳回' },
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Modal
        title="入职申请详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={720}
      >
        {currentRecord && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="申请单号">{currentRecord.id}</Descriptions.Item>
              <Descriptions.Item label="员工名称">{currentRecord.employeeName}</Descriptions.Item>
              <Descriptions.Item label="所属自然人">{currentRecord.owner}</Descriptions.Item>
              <Descriptions.Item label="身份">
                <Tag color={currentRecord.ownerType === '自有' ? 'blue' : 'orange'}>{currentRecord.ownerType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="部门">{currentRecord.department}</Descriptions.Item>
              <Descriptions.Item label="岗位">{currentRecord.position}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{currentRecord.applyDate}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={statusColorMap[currentRecord.status]}>{currentRecord.status}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginBottom: 16, fontWeight: 600 }}>审批流程</h4>
            <Steps
              current={currentRecord.currentStep - 1}
              direction="vertical"
              size="small"
              items={currentRecord.approvalSteps.map((s) => ({
                title: s.step,
                status: stepStatusMap[s.status],
                icon: stepIconMap[s.status],
                description: (
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {s.approver && <div>审批人：{s.approver}</div>}
                    {s.time && <div>时间：{s.time}</div>}
                    {s.remark && <div>备注：{s.remark}</div>}
                  </div>
                ),
              }))}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default OnboardManagement;
