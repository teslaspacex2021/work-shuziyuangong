import React, { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Space, Input, Select, Row, Col, Statistic, Badge, Modal, Descriptions, Timeline,
} from 'antd';
import {
  SearchOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined, AuditOutlined, FileTextOutlined,
  UserOutlined, TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface ApprovalRecord {
  id: string;
  title: string;
  type: '技能变更' | '知识库变更' | 'Token配额调整' | '权限变更' | '模型配置' | '技能新增';
  employeeId: string;
  employeeName: string;
  department: string;
  applicant: string;
  approver: string;
  status: '待审批' | '已通过' | '已拒绝' | '审批中';
  priority: '高' | '中' | '低';
  createTime: string;
  updateTime: string;
  description: string;
  steps: { name: string; status: '通过' | '拒绝' | '待处理' | '处理中'; operator: string; time: string; remark?: string }[];
}

const mockApprovalRecords: ApprovalRecord[] = [
  {
    id: 'APR-001', title: '小翼·客服 新增情感分析技能', type: '技能新增',
    employeeId: 'DE-2026001', employeeName: '小翼·客服', department: '客户服务部',
    applicant: '宇雷', approver: '管理员', status: '已通过', priority: '高',
    createTime: '2026-05-10 09:30:00', updateTime: '2026-05-10 14:20:00',
    description: '申请为小翼·客服增加情感分析技能，提升客户服务质量',
    steps: [
      { name: '技术评审', status: '通过', operator: '技术主管', time: '2026-05-10 10:15:00', remark: '技能兼容性验证通过' },
      { name: '系统管理员确认', status: '通过', operator: '管理员', time: '2026-05-10 14:20:00', remark: '审批通过，技能已绑定' },
    ],
  },
  {
    id: 'APR-002', title: '小翼·营销 关联营销案例库', type: '知识库变更',
    employeeId: 'DE-2026003', employeeName: '小翼·营销', department: '数字化运营部',
    applicant: '李明', approver: '管理员', status: '审批中', priority: '中',
    createTime: '2026-05-12 11:00:00', updateTime: '2026-05-13 09:30:00',
    description: '申请为小翼·营销关联营销案例知识库，增强营销方案生成能力',
    steps: [
      { name: '知识库审核', status: '通过', operator: '知识管理员', time: '2026-05-12 15:00:00', remark: '知识库内容审核通过' },
      { name: '系统管理员确认', status: '处理中', operator: '管理员', time: '', remark: '' },
    ],
  },
  {
    id: 'APR-003', title: '小翼·审计 数据访问权限变更', type: '权限变更',
    employeeId: 'DE-2026004', employeeName: '小翼·审计', department: '审计部',
    applicant: '王芳', approver: '管理员', status: '待审批', priority: '高',
    createTime: '2026-05-14 16:00:00', updateTime: '2026-05-14 16:00:00',
    description: '申请增加小翼·审计的数据访问权限范围，支持跨部门审计',
    steps: [
      { name: '安全审批', status: '待处理', operator: '安全管理员', time: '', remark: '' },
      { name: '系统管理员确认', status: '待处理', operator: '管理员', time: '', remark: '' },
    ],
  },
  {
    id: 'APR-004', title: '小翼·财务 Tokens月度配额调整', type: 'Token配额调整',
    employeeId: 'DE-2026006', employeeName: '小翼·财务', department: '财务共享中心',
    applicant: '赵六', approver: '管理员', status: '已通过', priority: '低',
    createTime: '2026-05-08 10:00:00', updateTime: '2026-05-09 11:30:00',
    description: '月度Tokens配额从4.5M调整至8M，业务量增长需要更多配额',
    steps: [
      { name: '部门审批', status: '通过', operator: '财务主管', time: '2026-05-08 14:00:00', remark: '业务量增长，同意调整' },
      { name: '系统管理员确认', status: '通过', operator: '管理员', time: '2026-05-09 11:30:00', remark: '已调整配额至8M' },
    ],
  },
  {
    id: 'APR-005', title: '小翼·运维 增加数据库管理技能', type: '技能变更',
    employeeId: 'DE-2026007', employeeName: '小翼·运维', department: 'IT运维部',
    applicant: '孙七', approver: '管理员', status: '已拒绝', priority: '中',
    createTime: '2026-05-06 09:00:00', updateTime: '2026-05-07 16:45:00',
    description: '申请为小翼·运维增加数据库管理技能',
    steps: [
      { name: '技术评审', status: '拒绝', operator: '技术主管', time: '2026-05-07 16:45:00', remark: '当前技能组合已满足需求，暂不增加' },
    ],
  },
  {
    id: 'APR-006', title: '小翼·商机 切换GPT-4o模型', type: '模型配置',
    employeeId: 'DE-2026008', employeeName: '小翼·商机', department: '数字化运营部',
    applicant: '周八', approver: '管理员', status: '已通过', priority: '高',
    createTime: '2026-05-01 14:00:00', updateTime: '2026-05-03 10:00:00',
    description: '申请将小翼·商机的底层模型从GPT-3.5升级至GPT-4o，提升分析精度',
    steps: [
      { name: '技术评审', status: '通过', operator: '技术主管', time: '2026-05-01 17:00:00', remark: '模型兼容性测试通过' },
      { name: '成本审批', status: '通过', operator: '财务主管', time: '2026-05-02 15:00:00', remark: '预算充足，同意' },
      { name: '系统管理员确认', status: '通过', operator: '管理员', time: '2026-05-03 10:00:00', remark: '模型已切换完成' },
    ],
  },
  {
    id: 'APR-007', title: '小翼·HR 关联人力资源政策卡片', type: '知识库变更',
    employeeId: 'DE-2026005', employeeName: '小翼·HR', department: '人力资源部',
    applicant: '张三', approver: '管理员', status: '已通过', priority: '中',
    createTime: '2026-05-04 09:00:00', updateTime: '2026-05-05 11:00:00',
    description: '为小翼·HR关联最新版人力资源政策知识卡片',
    steps: [
      { name: '知识库审核', status: '通过', operator: '知识管理员', time: '2026-05-04 14:00:00', remark: '内容审核通过' },
      { name: '系统管理员确认', status: '通过', operator: '管理员', time: '2026-05-05 11:00:00', remark: '已关联' },
    ],
  },
  {
    id: 'APR-008', title: '小翼·数据 Tokens配额紧急扩容', type: 'Token配额调整',
    employeeId: 'DE-2026002', employeeName: '小翼·数据', department: '数据运营中心',
    applicant: '韩梅梅', approver: '管理员', status: '审批中', priority: '高',
    createTime: '2026-05-13 08:30:00', updateTime: '2026-05-13 10:00:00',
    description: '数据标注任务量激增，申请Tokens配额从3M紧急扩容至6M',
    steps: [
      { name: '部门审批', status: '通过', operator: '数据运营主管', time: '2026-05-13 09:00:00', remark: '确认业务需求紧急' },
      { name: '系统管理员确认', status: '处理中', operator: '管理员', time: '', remark: '' },
    ],
  },
];

const statusColorMap: Record<string, string> = {
  '待审批': 'warning',
  '已通过': 'success',
  '已拒绝': 'error',
  '审批中': 'processing',
};

const typeColorMap: Record<string, string> = {
  '技能变更': 'purple',
  '技能新增': 'blue',
  '知识库变更': 'cyan',
  'Token配额调整': 'green',
  '权限变更': 'orange',
  '模型配置': 'geekblue',
};

const priorityColorMap: Record<string, string> = {
  '高': 'red',
  '中': 'orange',
  '低': 'default',
};

const ApprovalRecords: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ApprovalRecord | null>(null);

  const filteredData = useMemo(() => {
    return mockApprovalRecords.filter((r) => {
      const matchSearch = !searchText ||
        r.title.includes(searchText) ||
        r.employeeName.includes(searchText) ||
        r.id.includes(searchText);
      const matchType = !typeFilter || r.type === typeFilter;
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [searchText, typeFilter, statusFilter]);

  const pendingCount = mockApprovalRecords.filter((r) => r.status === '待审批' || r.status === '审批中').length;
  const passedCount = mockApprovalRecords.filter((r) => r.status === '已通过').length;
  const rejectedCount = mockApprovalRecords.filter((r) => r.status === '已拒绝').length;

  const showDetail = (record: ApprovalRecord) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const columns: ColumnsType<ApprovalRecord> = [
    { title: '审批编号', dataIndex: 'id', key: 'id', width: 110 },
    {
      title: '审批标题', dataIndex: 'title', key: 'title', width: 240,
      render: (text: string, record) => (
        <a onClick={() => showDetail(record)} style={{ fontWeight: 500 }}>{text}</a>
      ),
    },
    {
      title: '审批类型', dataIndex: 'type', key: 'type', width: 100,
      render: (type: string) => <Tag color={typeColorMap[type]}>{type}</Tag>,
    },
    { title: '关联员工', dataIndex: 'employeeName', key: 'employeeName', width: 120 },
    { title: '所属部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: 80 },
    {
      title: '优先级', dataIndex: 'priority', key: 'priority', width: 80,
      render: (p: string) => <Tag color={priorityColorMap[p]}>{p}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (status: string) => (
        <Badge status={statusColorMap[status] as any} text={status} />
      ),
    },
    {
      title: '提交时间', dataIndex: 'createTime', key: 'createTime', width: 160,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作', key: 'action', width: 80, fixed: 'right',
      render: (_, record) => (
        <a onClick={() => showDetail(record)}>详情</a>
      ),
    },
  ];

  const stepStatusIcon = (status: string) => {
    switch (status) {
      case '通过': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case '拒绝': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case '处理中': return <ClockCircleOutlined style={{ color: '#1677ff' }} />;
      default: return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>审批记录</h2>
      <p style={{ color: '#999', marginBottom: 20 }}>查看数字员工配置相关的审批记录，包括技能变更、知识库关联、Token配额调整、权限变更、模型配置等</p>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="总审批数" value={mockApprovalRecords.length} prefix={<AuditOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="待处理" value={pendingCount} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="已通过" value={passedCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="已拒绝" value={rejectedCount} prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Space wrap>
            <Input
              placeholder="搜索审批编号/标题/员工"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Select
              placeholder="审批类型"
              style={{ width: 130 }}
              allowClear
              value={typeFilter}
              onChange={setTypeFilter}
              options={['技能变更', '技能新增', '知识库变更', 'Token配额调整', '权限变更', '模型配置'].map((t) => ({ label: t, value: t }))}
            />
            <Select
              placeholder="审批状态"
              style={{ width: 120 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              options={['待审批', '审批中', '已通过', '已拒绝'].map((s) => ({ label: s, value: s }))}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Modal
        title={<span><FileTextOutlined style={{ marginRight: 8 }} />审批详情</span>}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={640}
      >
        {selectedRecord && (
          <div style={{ marginTop: 8 }}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="审批编号">{selectedRecord.id}</Descriptions.Item>
              <Descriptions.Item label="审批类型">
                <Tag color={typeColorMap[selectedRecord.type]}>{selectedRecord.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审批标题" span={2}>{selectedRecord.title}</Descriptions.Item>
              <Descriptions.Item label="关联员工">
                <Space>
                  <UserOutlined />
                  {selectedRecord.employeeName} ({selectedRecord.employeeId})
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="所属部门">
                <Space>
                  <TeamOutlined />
                  {selectedRecord.department}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="审批人">{selectedRecord.approver}</Descriptions.Item>
              <Descriptions.Item label="优先级"><Tag color={priorityColorMap[selectedRecord.priority]}>{selectedRecord.priority}</Tag></Descriptions.Item>
              <Descriptions.Item label="状态"><Badge status={statusColorMap[selectedRecord.status] as any} text={selectedRecord.status} /></Descriptions.Item>
              <Descriptions.Item label="提交时间">{dayjs(selectedRecord.createTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{dayjs(selectedRecord.updateTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="说明" span={2}>{selectedRecord.description}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 20 }}>
              <h4 style={{ marginBottom: 12, fontWeight: 600 }}>审批流程</h4>
              <Timeline
                items={selectedRecord.steps.map((step) => ({
                  dot: stepStatusIcon(step.status),
                  children: (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>{step.name}</span>
                        <Tag color={
                          step.status === '通过' ? 'success' :
                          step.status === '拒绝' ? 'error' :
                          step.status === '处理中' ? 'processing' : 'default'
                        } style={{ fontSize: 11 }}>{step.status}</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        处理人：{step.operator}
                        {step.time && ` · ${dayjs(step.time).format('YYYY-MM-DD HH:mm')}`}
                      </div>
                      {step.remark && (
                        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                          备注：{step.remark}
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApprovalRecords;
