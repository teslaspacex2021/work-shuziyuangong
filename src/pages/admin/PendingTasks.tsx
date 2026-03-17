import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Button, Space, Badge, Modal, message,
  Row, Col, Statistic, Descriptions, List, Timeline,
  Segmented, Input, Divider,
} from 'antd';
import {
  AuditOutlined, CheckCircleOutlined,
  ClockCircleOutlined, InfoCircleOutlined,
  UserAddOutlined, UserDeleteOutlined, TrophyOutlined, EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  alerts, onboardRecords, exitRecords, performanceReviews, employeeEditApprovals,
  type AlertItem, type OnboardRecord, type ExitRecord,
  type PerformanceReview, type EmployeeEditApproval,
} from '../../mock/data';

const stepStatusColor: Record<string, string> = {
  '已完成': 'green',
  '进行中': 'blue',
  '待处理': 'gray',
  '已驳回': 'red',
};

type TaskType = '全部' | '待办审批' | '绩效考评' | '员工信息调整' | '入职审批' | '退出审批';

interface UnifiedTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  time: string;
  status: '待处理' | '已处理';
  level?: 'critical' | 'warning' | 'info';
  raw: AlertItem | OnboardRecord | ExitRecord | EmployeeEditApproval | PerformanceReview;
  rawKind: 'alert' | 'onboard' | 'exit' | 'editApproval' | 'performance';
}

const typeColorMap: Record<string, string> = {
  '待办审批': 'blue',
  '绩效考评': 'purple',
  '员工信息调整': 'orange',
  '入职审批': 'green',
  '退出审批': 'red',
};

const PendingTasks: React.FC = () => {
  const [alertData, setAlertData] = useState(alerts);
  const [onboardData, setOnboardData] = useState(onboardRecords);
  const [exitData, setExitData] = useState(exitRecords);
  const [editApprovals, setEditApprovals] = useState(employeeEditApprovals);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailTask, setDetailTask] = useState<UnifiedTask | null>(null);
  const [processVisible, setProcessVisible] = useState(false);
  const [processTask, setProcessTask] = useState<UnifiedTask | null>(null);
  const [viewMode, setViewMode] = useState<'待办' | '已办'>('待办');
  const [typeFilter, setTypeFilter] = useState<TaskType>('全部');
  const [searchText, setSearchText] = useState('');

  const unifiedTasks = useMemo<UnifiedTask[]>(() => {
    const items: UnifiedTask[] = [];

    alertData.forEach((a) => {
      items.push({
        id: a.id,
        title: `${a.title}`,
        description: a.description,
        type: a.type as TaskType,
        time: a.time,
        status: a.handled ? '已处理' : '待处理',
        level: a.level,
        raw: a,
        rawKind: 'alert',
      });
    });

    onboardData.filter((r) => r.status !== '已完成').forEach((r) => {
      items.push({
        id: r.id,
        title: `${r.employeeName} 入职审批`,
        description: `${r.employeeId} ${r.department} ${r.position}`,
        type: '入职审批',
        time: r.applyDate,
        status: r.status === '已驳回' ? '已处理' : '待处理',
        raw: r,
        rawKind: 'onboard',
      });
    });

    exitData.filter((r) => r.status !== '已完成').forEach((r) => {
      items.push({
        id: r.id,
        title: `${r.employeeName} 退出审批`,
        description: `${r.employeeId} ${r.department} - ${r.reason}`,
        type: '退出审批',
        time: r.applyDate,
        status: r.status === '已驳回' ? '已处理' : '待处理',
        raw: r,
        rawKind: 'exit',
      });
    });

    editApprovals.forEach((r) => {
      items.push({
        id: r.id,
        title: `${r.employeeName} 信息变更 - ${r.field}`,
        description: `${r.oldValue} → ${r.newValue}`,
        type: '员工信息调整',
        time: r.applyDate,
        status: r.status === '待审批' ? '待处理' : '已处理',
        raw: r,
        rawKind: 'editApproval',
      });
    });

    performanceReviews.filter((r) => r.status === '进行中').forEach((r) => {
      items.push({
        id: r.id,
        title: r.name,
        description: `当前环节: ${r.currentStep}`,
        type: '绩效考评',
        time: r.steps[0]?.deadline || '',
        status: '待处理',
        raw: r,
        rawKind: 'performance',
      });
    });

    return items.sort((a, b) => (b.time > a.time ? 1 : -1));
  }, [alertData, onboardData, exitData, editApprovals]);

  const filteredTasks = useMemo(() => {
    return unifiedTasks.filter((t) => {
      const matchMode = viewMode === '待办' ? t.status === '待处理' : t.status === '已处理';
      const matchType = typeFilter === '全部' || t.type === typeFilter;
      const matchSearch = !searchText || t.title.includes(searchText) || t.description.includes(searchText);
      return matchMode && matchType && matchSearch;
    });
  }, [unifiedTasks, viewMode, typeFilter, searchText]);

  const pendingCount = unifiedTasks.filter((t) => t.status === '待处理').length;
  const doneCount = unifiedTasks.filter((t) => t.status === '已处理').length;

  const typeCounts = useMemo(() => {
    const pending = unifiedTasks.filter((t) => t.status === '待处理');
    return {
      '待办审批': pending.filter((t) => t.type === '待办审批').length,
      '绩效考评': pending.filter((t) => t.type === '绩效考评').length,
      '员工信息调整': pending.filter((t) => t.type === '员工信息调整').length,
      '入职审批': pending.filter((t) => t.type === '入职审批').length,
      '退出审批': pending.filter((t) => t.type === '退出审批').length,
    };
  }, [unifiedTasks]);

  const handleProcess = (task: UnifiedTask) => {
    setProcessTask(task);
    setProcessVisible(true);
  };

  const handleDetail = (task: UnifiedTask) => {
    setDetailTask(task);
    setDetailVisible(true);
  };

  const confirmProcess = () => {
    if (!processTask) return;

    if (processTask.rawKind === 'alert') {
      setAlertData((prev) => prev.map((a) => (a.id === processTask.id ? { ...a, handled: true } : a)));
    } else if (processTask.rawKind === 'onboard') {
      setOnboardData((prev) =>
        prev.map((r) => (r.id === processTask.id ? { ...r, status: '已完成' as const, currentStep: r.approvalSteps.length } : r)),
      );
    } else if (processTask.rawKind === 'exit') {
      setExitData((prev) =>
        prev.map((r) => (r.id === processTask.id ? { ...r, status: '已完成' as const, currentStep: r.approvalSteps.length } : r)),
      );
    } else if (processTask.rawKind === 'editApproval') {
      setEditApprovals((prev) =>
        prev.map((r) => (r.id === processTask.id ? { ...r, status: '已通过' as const } : r)),
      );
    }

    message.success('处理成功');
    setProcessVisible(false);
  };

  const rejectProcess = () => {
    if (!processTask) return;

    if (processTask.rawKind === 'onboard') {
      setOnboardData((prev) =>
        prev.map((r) => (r.id === processTask.id ? { ...r, status: '已驳回' as const } : r)),
      );
    } else if (processTask.rawKind === 'exit') {
      setExitData((prev) =>
        prev.map((r) => (r.id === processTask.id ? { ...r, status: '已驳回' as const } : r)),
      );
    } else if (processTask.rawKind === 'editApproval') {
      setEditApprovals((prev) =>
        prev.map((r) => (r.id === processTask.id ? { ...r, status: '已驳回' as const } : r)),
      );
    }

    message.warning('已驳回');
    setProcessVisible(false);
  };

  const renderApprovalTimeline = (steps: { step: string; status: string; time?: string; approver?: string; remark?: string }[]) => (
    <Timeline
      items={steps.map((s) => ({
        color: stepStatusColor[s.status] || 'gray',
        children: (
          <div>
            <div style={{ fontWeight: 500 }}>
              {s.step}
              <Tag color={stepStatusColor[s.status]} style={{ marginLeft: 8, fontSize: 11 }}>{s.status}</Tag>
            </div>
            {s.time && <div style={{ fontSize: 12, color: '#999' }}>{s.time}</div>}
            {s.approver && <div style={{ fontSize: 12, color: '#666' }}>审批人：{s.approver}</div>}
            {s.remark && <div style={{ fontSize: 12, color: '#888' }}>备注：{s.remark}</div>}
          </div>
        ),
      }))}
    />
  );

  const renderProcessContent = () => {
    if (!processTask) return null;

    if (processTask.rawKind === 'onboard') {
      const item = processTask.raw as OnboardRecord;
      return (
        <>
          <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="员工名称">{item.employeeName}</Descriptions.Item>
            <Descriptions.Item label="工号">{item.employeeId}</Descriptions.Item>
            <Descriptions.Item label="部门">{item.department}</Descriptions.Item>
            <Descriptions.Item label="岗位">{item.position}</Descriptions.Item>
            <Descriptions.Item label="所属自然人">{item.owner}</Descriptions.Item>
            <Descriptions.Item label="身份类型">{item.ownerType}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{item.applyDate}</Descriptions.Item>
            <Descriptions.Item label="当前状态"><Tag color="processing">{item.status}</Tag></Descriptions.Item>
          </Descriptions>
          <Divider>审批流程</Divider>
          {renderApprovalTimeline(item.approvalSteps)}
        </>
      );
    }

    if (processTask.rawKind === 'exit') {
      const item = processTask.raw as ExitRecord;
      return (
        <>
          <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="员工名称">{item.employeeName}</Descriptions.Item>
            <Descriptions.Item label="工号">{item.employeeId}</Descriptions.Item>
            <Descriptions.Item label="部门">{item.department}</Descriptions.Item>
            <Descriptions.Item label="岗位">{item.position}</Descriptions.Item>
            <Descriptions.Item label="退出原因" span={2}>{item.reason}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{item.applyDate}</Descriptions.Item>
            <Descriptions.Item label="当前状态"><Tag color="processing">{item.status}</Tag></Descriptions.Item>
          </Descriptions>
          <Divider>审批流程</Divider>
          {renderApprovalTimeline(item.approvalSteps)}
        </>
      );
    }

    if (processTask.rawKind === 'editApproval') {
      const item = processTask.raw as EmployeeEditApproval;
      return (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="员工">{item.employeeName}</Descriptions.Item>
          <Descriptions.Item label="变更字段">{item.field}</Descriptions.Item>
          <Descriptions.Item label="原值">{item.oldValue}</Descriptions.Item>
          <Descriptions.Item label="新值"><span style={{ color: '#1677ff', fontWeight: 500 }}>{item.newValue}</span></Descriptions.Item>
          <Descriptions.Item label="申请人">{item.applicant}</Descriptions.Item>
          <Descriptions.Item label="申请日期">{item.applyDate}</Descriptions.Item>
        </Descriptions>
      );
    }

    if (processTask.rawKind === 'performance') {
      const item = processTask.raw as PerformanceReview;
      return (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="活动名称">{item.name}</Descriptions.Item>
          <Descriptions.Item label="年度">{item.year}</Descriptions.Item>
          <Descriptions.Item label="周期">{item.period}</Descriptions.Item>
          <Descriptions.Item label="当前环节"><Tag color="processing">{item.currentStep}</Tag></Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color="processing">{item.status}</Tag></Descriptions.Item>
        </Descriptions>
      );
    }

    const item = processTask.raw as AlertItem;
    return (
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="类型"><Tag color={typeColorMap[item.type]}>{item.type}</Tag></Descriptions.Item>
        <Descriptions.Item label="标题">{item.title}</Descriptions.Item>
        <Descriptions.Item label="描述">{item.description}</Descriptions.Item>
        <Descriptions.Item label="时间">{item.time}</Descriptions.Item>
        <Descriptions.Item label="级别">
          <Tag color={item.level === 'critical' ? 'red' : item.level === 'warning' ? 'orange' : 'blue'}>
            {item.level === 'critical' ? '紧急' : item.level === 'warning' ? '警告' : '提示'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const getTaskIcon = (task: UnifiedTask) => {
    switch (task.type) {
      case '待办审批': return <AuditOutlined style={{ color: '#1677ff', fontSize: 18 }} />;
      case '绩效考评': return <TrophyOutlined style={{ color: '#722ed1', fontSize: 18 }} />;
      case '员工信息调整': return <EditOutlined style={{ color: '#fa8c16', fontSize: 18 }} />;
      case '入职审批': return <UserAddOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
      case '退出审批': return <UserDeleteOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
      default: return <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 18 }} />;
    }
  };

  const typeOptions: TaskType[] = ['全部', '待办审批', '绩效考评', '员工信息调整', '入职审批', '退出审批'];

  return (
    <div>
      <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>我的待办</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>集中处理待办审批、绩效考评、员工信息调整、入职退出审批。</p>

      {/* Summary cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={4}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)' }}>
            <Statistic title="待办审批" value={typeCounts['待办审批']} prefix={<AuditOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f9f0ff 0%, #fff 100%)' }}>
            <Statistic title="绩效考评" value={typeCounts['绩效考评']} prefix={<TrophyOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fff7e6 0%, #fff 100%)' }}>
            <Statistic title="信息变更" value={typeCounts['员工信息调整']} prefix={<EditOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f0fff0 0%, #fff 100%)' }}>
            <Statistic title="入职审批" value={typeCounts['入职审批']} prefix={<UserAddOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)' }}>
            <Statistic title="退出审批" value={typeCounts['退出审批']} prefix={<UserDeleteOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        {/* Toolbar: 待办/已办 toggle + type filter tags + search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Segmented
              options={[
                { label: <span>待办 <Badge count={pendingCount} size="small" offset={[4, -2]} /></span>, value: '待办' },
                { label: <span>已办 <Badge count={doneCount} size="small" offset={[4, -2]} showZero /></span>, value: '已办' },
              ]}
              value={viewMode}
              onChange={(v) => setViewMode(v as '待办' | '已办')}
            />
          </div>
          <Input
            placeholder="搜索待办..."
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Type filter tags */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {typeOptions.map((t) => {
            const count = t === '全部' ? pendingCount : typeCounts[t as keyof typeof typeCounts] || 0;
            const isActive = typeFilter === t;
            return (
              <Tag
                key={t}
                color={isActive ? (typeColorMap[t] || 'blue') : undefined}
                style={{
                  cursor: 'pointer',
                  padding: '4px 12px',
                  fontSize: 13,
                  borderRadius: 16,
                  border: isActive ? undefined : '1px solid #d9d9d9',
                }}
                onClick={() => setTypeFilter(t)}
              >
                {t} {viewMode === '待办' && count > 0 && <Badge count={count} size="small" offset={[4, -2]} />}
              </Tag>
            );
          })}
        </div>

        {/* Task list */}
        <List
          dataSource={filteredTasks}
          locale={{ emptyText: viewMode === '待办' ? '暂无待办事项' : '暂无已办事项' }}
          renderItem={(task) => (
            <List.Item
              style={{
                padding: '12px 16px',
                marginBottom: 8,
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
              }}
              actions={
                task.status === '待处理'
                  ? [
                    <Button type="link" size="small" key="detail" onClick={() => handleDetail(task)}>详情</Button>,
                    <Button type="primary" size="small" key="process" onClick={() => handleProcess(task)}>处理</Button>,
                  ]
                  : [
                    <Button type="link" size="small" key="detail" onClick={() => handleDetail(task)}>详情</Button>,
                    <Tag color="default" key="done">已处理</Tag>,
                  ]
              }
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={task.status === '待处理'} offset={[-2, 2]}>
                    {getTaskIcon(task)}
                  </Badge>
                }
                title={
                  <Space>
                    <span style={{ fontWeight: 500 }}>{task.title}</span>
                    <Tag color={typeColorMap[task.type]} style={{ fontSize: 11 }}>{task.type}</Tag>
                    {task.level === 'critical' && <Tag color="red" style={{ fontSize: 11 }}>紧急</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>{task.description}</div>
                    <span style={{ fontSize: 12, color: '#999' }}>{task.time}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Detail modal */}
      <Modal
        title="待办详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {detailTask && (
          <div>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="标题">{detailTask.title}</Descriptions.Item>
              <Descriptions.Item label="类型"><Tag color={typeColorMap[detailTask.type]}>{detailTask.type}</Tag></Descriptions.Item>
              <Descriptions.Item label="描述">{detailTask.description}</Descriptions.Item>
              <Descriptions.Item label="时间">{detailTask.time}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {detailTask.status === '待处理'
                  ? <Tag icon={<ClockCircleOutlined />} color="warning">待处理</Tag>
                  : <Tag icon={<CheckCircleOutlined />} color="success">已处理</Tag>}
              </Descriptions.Item>
            </Descriptions>

            {detailTask.rawKind === 'onboard' && (
              <>
                <Divider>审批流程</Divider>
                {renderApprovalTimeline((detailTask.raw as OnboardRecord).approvalSteps)}
              </>
            )}
            {detailTask.rawKind === 'exit' && (
              <>
                <Divider>审批流程</Divider>
                {renderApprovalTimeline((detailTask.raw as ExitRecord).approvalSteps)}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Process modal (full page style) */}
      <Modal
        title={
          <Space>
            <span>处理待办</span>
            {processTask && <Tag color={typeColorMap[processTask.type]}>{processTask.type}</Tag>}
          </Space>
        }
        open={processVisible}
        onCancel={() => setProcessVisible(false)}
        width={700}
        footer={
          processTask?.status === '待处理' ? (
            <Space>
              <Button onClick={() => setProcessVisible(false)}>取消</Button>
              {['onboard', 'exit', 'editApproval'].includes(processTask?.rawKind || '') && (
                <Button danger onClick={rejectProcess}>驳回</Button>
              )}
              <Button type="primary" onClick={confirmProcess}>
                提交
              </Button>
            </Space>
          ) : null
        }
      >
        {renderProcessContent()}
      </Modal>
    </div>
  );
};

export default PendingTasks;
