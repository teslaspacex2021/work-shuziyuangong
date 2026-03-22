import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, message,
} from 'antd';
import { SearchOutlined, EyeOutlined, SolutionOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { demandRecords, type DemandRecord } from '../../mock/data';
import ApprovalDetailPage from '../../components/ApprovalDetailPage';

const statusColorMap: Record<DemandRecord['status'], string> = {
  '待提交': 'default',
  '部门经理审批': 'processing',
  '人力部门审批': 'processing',
  '已完成': 'success',
  '已驳回': 'error',
};

const urgencyColorMap: Record<string, string> = {
  '紧急': 'red',
  '普通': 'blue',
};

const DemandManagement: React.FC = () => {
  const [data, setData] = useState(demandRecords);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [currentRecord, setCurrentRecord] = useState<DemandRecord | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((r) => {
      const matchSearch =
        !searchText ||
        r.title.includes(searchText) ||
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
        const newStatus = allDone ? '已完成' : updatedSteps.find((s) => s.status === '进行中')?.step as DemandRecord['status'] || r.status;
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

  const columns: ColumnsType<DemandRecord> = [
    { title: '需求单号', dataIndex: 'id', key: 'id', width: 100 },
    {
      title: '需求名称', dataIndex: 'title', key: 'title', width: 200,
      render: (t: string) => <span style={{ fontWeight: 500 }}>{t}</span>,
    },
    { title: '需求部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '需求岗位', dataIndex: 'position', key: 'position', width: 130 },
    {
      title: '需求人数', dataIndex: 'headcount', key: 'headcount', width: 90, align: 'center',
      render: (v: number) => <span style={{ fontWeight: 600, color: '#1677ff' }}>{v}</span>,
    },
    {
      title: '紧急程度', dataIndex: 'urgency', key: 'urgency', width: 100,
      render: (u: string) => <Tag color={urgencyColorMap[u]}>{u}</Tag>,
    },
    { title: '申请日期', dataIndex: 'applyDate', key: 'applyDate', width: 110 },
    {
      title: '当前状态', dataIndex: 'status', key: 'status', width: 120,
      render: (status: DemandRecord['status']) => (
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
        title={`需求申请 - ${currentRecord.title}`}
        status={currentRecord.status}
        statusColor={statusColorMap[currentRecord.status]}
        basicInfoItems={[
          { label: '需求单号', value: currentRecord.id },
          { label: '需求名称', value: <span style={{ fontWeight: 500 }}>{currentRecord.title}</span> },
          { label: '需求部门', value: currentRecord.department },
          { label: '需求岗位', value: currentRecord.position },
          { label: '需求人数', value: <span style={{ fontWeight: 600, color: '#1677ff', fontSize: 16 }}>{currentRecord.headcount} 人</span> },
          { label: '紧急程度', value: <Tag color={urgencyColorMap[currentRecord.urgency]}>{currentRecord.urgency}</Tag> },
          { label: '需求理由', value: currentRecord.reason, span: 2 },
          { label: '岗位要求', value: currentRecord.requirements, span: 2 },
          { label: '申请人', value: currentRecord.applicant },
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
        <SolutionOutlined style={{ marginRight: 8 }} />
        需求管理
      </h2>
      <p style={{ color: '#999', marginBottom: 20 }}>管理各部门的数字员工需求申请与审批</p>

      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="搜索需求名称/需求单号"
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
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>
    </div>
  );
};

export default DemandManagement;
