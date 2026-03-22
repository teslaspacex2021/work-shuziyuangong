import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, message,
} from 'antd';
import { SearchOutlined, EyeOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { onboardRecords, type OnboardRecord } from '../../mock/data';
import ApprovalDetailPage from '../../components/ApprovalDetailPage';

const statusColorMap: Record<OnboardRecord['status'], string> = {
  '待提交': 'default',
  '部门经理审批': 'processing',
  '人力部门审批': 'processing',
  '已完成': 'success',
  '已驳回': 'error',
};

const OnboardManagement: React.FC = () => {
  const [data, setData] = useState(onboardRecords);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [currentRecord, setCurrentRecord] = useState<OnboardRecord | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((r) => {
      const matchSearch =
        !searchText ||
        r.employeeName.includes(searchText) ||
        r.id.includes(searchText);
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchText, statusFilter]);

  const handleApprove = (opinion: string) => {
    if (!currentRecord) return;
    setData((prev) =>
      prev.map((r) => {
        if (r.id !== currentRecord.id) return r;
        const updatedSteps = r.approvalSteps.map((s) => {
          if (s.status === '进行中') return { ...s, status: '已完成' as const, opinion, remark: '同意' };
          return s;
        });
        const nextIdx = updatedSteps.findIndex((s) => s.status === '待处理');
        if (nextIdx >= 0) {
          updatedSteps[nextIdx] = { ...updatedSteps[nextIdx], status: '进行中' };
        }
        const allDone = updatedSteps.every((s) => s.status === '已完成');
        const newStatus = allDone ? '已完成' : updatedSteps.find((s) => s.status === '进行中')?.step as OnboardRecord['status'] || r.status;
        const updated = { ...r, approvalSteps: updatedSteps, status: newStatus, currentStep: r.currentStep + 1 };
        setCurrentRecord(updated);
        return updated;
      }),
    );
  };

  const handleReject = (opinion: string) => {
    if (!currentRecord) return;
    setData((prev) =>
      prev.map((r) => {
        if (r.id !== currentRecord.id) return r;
        const updatedSteps = r.approvalSteps.map((s) => {
          if (s.status === '进行中') return { ...s, status: '已驳回' as const, opinion, remark: '驳回' };
          return s;
        });
        const updated = { ...r, approvalSteps: updatedSteps, status: '已驳回' as const };
        setCurrentRecord(updated);
        return updated;
      }),
    );
    message.warning('已驳回');
  };

  const columns: ColumnsType<OnboardRecord> = [
    { title: '申请单号', dataIndex: 'id', key: 'id', width: 110 },
    { title: '员工名称', dataIndex: 'employeeName', key: 'employeeName', width: 120 },
    { title: '所属自然人', dataIndex: 'owner', key: 'owner', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 130 },
    { title: '申请日期', dataIndex: 'applyDate', key: 'applyDate', width: 120 },
    {
      title: '当前状态', dataIndex: 'status', key: 'status', width: 120,
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
          onClick={() => setCurrentRecord(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  if (currentRecord) {
    return (
      <ApprovalDetailPage
        title={`入职申请 - ${currentRecord.employeeName}`}
        status={currentRecord.status}
        statusColor={statusColorMap[currentRecord.status]}
        basicInfoItems={[
          { label: '申请单号', value: currentRecord.id },
          { label: '员工名称', value: currentRecord.employeeName },
          { label: '员工工号', value: currentRecord.employeeId },
          { label: '所属自然人', value: currentRecord.owner },
          { label: '身份类型', value: <Tag color={currentRecord.ownerType === '自有' ? 'blue' : 'orange'}>{currentRecord.ownerType}</Tag> },
          { label: '部门', value: currentRecord.department },
          { label: '岗位', value: currentRecord.position },
          { label: '申请日期', value: currentRecord.applyDate },
          { label: '当前状态', value: <Tag color={statusColorMap[currentRecord.status]}>{currentRecord.status}</Tag> },
        ]}
        approvalSteps={currentRecord.approvalSteps}
        currentStep={currentRecord.currentStep}
        onBack={() => setCurrentRecord(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isCompleted={currentRecord.status === '已完成' || currentRecord.status === '已驳回'}
      />
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>
        <UserAddOutlined style={{ marginRight: 8 }} />
        入职管理
      </h2>
      <p style={{ color: '#999', marginBottom: 20 }}>管理数字员工的入职申请与审批流程</p>

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
              { label: '部门经理审批', value: '部门经理审批' },
              { label: '人力部门审批', value: '人力部门审批' },
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
    </div>
  );
};

export default OnboardManagement;
