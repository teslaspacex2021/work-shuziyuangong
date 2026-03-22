import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Button, Space, Badge, message,
  Row, Col, Statistic, List, Steps,
  Segmented, Input, Descriptions, Divider, Result,
} from 'antd';
import {
  AuditOutlined, CheckCircleOutlined,
  ClockCircleOutlined, LoadingOutlined, CloseCircleOutlined,
  UserAddOutlined, UserDeleteOutlined, TrophyOutlined, EditOutlined,
  SearchOutlined, ArrowLeftOutlined, SwapOutlined, SolutionOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  alerts, onboardRecords, exitRecords, performanceReviews, employeeEditApprovals,
  transferRecords, demandRecords,
  type AlertItem, type OnboardRecord, type ExitRecord,
  type PerformanceReview, type EmployeeEditApproval,
  type TransferRecord, type DemandRecord, type ApprovalStep,
} from '../../mock/data';
import { usePermission } from '../../contexts/PermissionContext';

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

type TaskType = '全部' | '待办审批' | '绩效考评' | '员工信息调整' | '入职审批' | '退出审批' | '调动审批' | '需求审批';

interface UnifiedTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  time: string;
  status: '待处理' | '已处理';
  level?: 'critical' | 'warning' | 'info';
  raw: AlertItem | OnboardRecord | ExitRecord | EmployeeEditApproval | PerformanceReview | TransferRecord | DemandRecord;
  rawKind: 'alert' | 'onboard' | 'exit' | 'editApproval' | 'performance' | 'transfer' | 'demand';
}

const typeColorMap: Record<string, string> = {
  '待办审批': 'blue',
  '绩效考评': 'purple',
  '员工信息调整': 'orange',
  '入职审批': 'green',
  '退出审批': 'red',
  '调动审批': 'cyan',
  '需求审批': 'magenta',
};

const PendingTasks: React.FC = () => {
  const [alertData, setAlertData] = useState(alerts);
  const [onboardData, setOnboardData] = useState(onboardRecords);
  const [exitData, setExitData] = useState(exitRecords);
  const [editApprovals, setEditApprovals] = useState(employeeEditApprovals);
  const [transferData, setTransferData] = useState(transferRecords);
  const [demandData, setDemandData] = useState(demandRecords);
  const [viewMode, setViewMode] = useState<'待办' | '已办'>('待办');
  const [typeFilter, setTypeFilter] = useState<TaskType>('全部');
  const [searchText, setSearchText] = useState('');
  const [detailTask, setDetailTask] = useState<UnifiedTask | null>(null);
  const [opinion, setOpinion] = useState('');
  const { hasPermission } = usePermission();

  const unifiedTasks = useMemo<UnifiedTask[]>(() => {
    const items: UnifiedTask[] = [];

    alertData.forEach((a) => {
      items.push({
        id: a.id, title: a.title, description: a.description,
        type: a.type as TaskType, time: a.time,
        status: a.handled ? '已处理' : '待处理',
        level: a.level, raw: a, rawKind: 'alert',
      });
    });

    onboardData.filter((r) => r.status !== '已完成').forEach((r) => {
      items.push({
        id: r.id, title: `${r.employeeName} 入职审批`,
        description: `${r.employeeId} ${r.department} ${r.position}`,
        type: '入职审批', time: r.applyDate,
        status: r.status === '已驳回' ? '已处理' : '待处理',
        raw: r, rawKind: 'onboard',
      });
    });

    exitData.filter((r) => r.status !== '已完成').forEach((r) => {
      items.push({
        id: r.id, title: `${r.employeeName} 退出审批`,
        description: `${r.employeeId} ${r.department} - ${r.reason}`,
        type: '退出审批', time: r.applyDate,
        status: r.status === '已驳回' ? '已处理' : '待处理',
        raw: r, rawKind: 'exit',
      });
    });

    transferData.filter((r) => r.status !== '已完成').forEach((r) => {
      items.push({
        id: r.id, title: `${r.employeeName} 调动审批`,
        description: `${r.fromDepartment}/${r.fromPosition} → ${r.toDepartment}/${r.toPosition}`,
        type: '调动审批', time: r.applyDate,
        status: r.status === '已驳回' ? '已处理' : '待处理',
        raw: r, rawKind: 'transfer',
      });
    });

    demandData.filter((r) => r.status !== '已完成').forEach((r) => {
      items.push({
        id: r.id, title: `${r.title}`,
        description: `${r.department} ${r.position} × ${r.headcount}人`,
        type: '需求审批', time: r.applyDate,
        status: r.status === '已驳回' ? '已处理' : '待处理',
        raw: r, rawKind: 'demand',
      });
    });

    editApprovals.forEach((r) => {
      items.push({
        id: r.id, title: `${r.employeeName} 信息变更 - ${r.field}`,
        description: `${r.oldValue} → ${r.newValue}`,
        type: '员工信息调整', time: r.applyDate,
        status: r.status === '待审批' ? '待处理' : '已处理',
        raw: r, rawKind: 'editApproval',
      });
    });

    performanceReviews.filter((r) => r.status === '进行中').forEach((r) => {
      items.push({
        id: r.id, title: r.name,
        description: `当前环节: ${r.currentStep}`,
        type: '绩效考评', time: r.steps[0]?.deadline || '',
        status: '待处理', raw: r, rawKind: 'performance',
      });
    });

    return items.sort((a, b) => (b.time > a.time ? 1 : -1));
  }, [alertData, onboardData, exitData, editApprovals, transferData, demandData]);

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
      '调动审批': pending.filter((t) => t.type === '调动审批').length,
      '需求审批': pending.filter((t) => t.type === '需求审批').length,
    };
  }, [unifiedTasks]);

  const canApprove = hasPermission('approval:approve');

  const processApprovalSteps = (
    steps: ApprovalStep[],
    action: 'approve' | 'reject',
    opinionText: string,
  ): ApprovalStep[] => {
    return steps.map((s) => {
      if (s.status === '进行中') {
        return {
          ...s,
          status: action === 'approve' ? '已完成' as const : '已驳回' as const,
          opinion: opinionText,
          remark: action === 'approve' ? '同意' : '驳回',
          time: new Date().toLocaleString('zh-CN'),
        };
      }
      return s;
    }).map((s, idx, arr) => {
      if (action === 'approve' && s.status === '待处理' && idx > 0 && arr[idx - 1].status === '已完成') {
        const prevWasJustApproved = arr.slice(0, idx).every((prev) => prev.status === '已完成');
        if (prevWasJustApproved && !arr.slice(0, idx).some((prev, i) => i < idx && arr.slice(i + 1, idx).some((p) => p.status === '进行中'))) {
          return { ...s, status: '进行中' as const };
        }
      }
      return s;
    });
  };

  const handleApprove = () => {
    if (!detailTask || !opinion.trim()) {
      message.warning('请填写审批意见');
      return;
    }

    if (detailTask.rawKind === 'onboard') {
      setOnboardData((prev) => prev.map((r) => {
        if (r.id !== detailTask.id) return r;
        const newSteps = processApprovalSteps(r.approvalSteps, 'approve', opinion);
        const nextActive = newSteps.find((s) => s.status === '进行中');
        const allDone = newSteps.every((s) => s.status === '已完成');
        return { ...r, approvalSteps: newSteps, status: allDone ? '已完成' as const : (nextActive?.step || r.status) as OnboardRecord['status'], currentStep: r.currentStep + 1 };
      }));
    } else if (detailTask.rawKind === 'exit') {
      setExitData((prev) => prev.map((r) => {
        if (r.id !== detailTask.id) return r;
        const newSteps = processApprovalSteps(r.approvalSteps, 'approve', opinion);
        const allDone = newSteps.every((s) => s.status === '已完成');
        const nextActive = newSteps.find((s) => s.status === '进行中');
        return { ...r, approvalSteps: newSteps, status: allDone ? '已完成' as const : (nextActive?.step || r.status) as ExitRecord['status'], currentStep: r.currentStep + 1 };
      }));
    } else if (detailTask.rawKind === 'transfer') {
      setTransferData((prev) => prev.map((r) => {
        if (r.id !== detailTask.id) return r;
        const newSteps = processApprovalSteps(r.approvalSteps, 'approve', opinion);
        const allDone = newSteps.every((s) => s.status === '已完成');
        const nextActive = newSteps.find((s) => s.status === '进行中');
        return { ...r, approvalSteps: newSteps, status: allDone ? '已完成' as const : (nextActive?.step || r.status) as TransferRecord['status'], currentStep: r.currentStep + 1 };
      }));
    } else if (detailTask.rawKind === 'demand') {
      setDemandData((prev) => prev.map((r) => {
        if (r.id !== detailTask.id) return r;
        const newSteps = processApprovalSteps(r.approvalSteps, 'approve', opinion);
        const allDone = newSteps.every((s) => s.status === '已完成');
        const nextActive = newSteps.find((s) => s.status === '进行中');
        return { ...r, approvalSteps: newSteps, status: allDone ? '已完成' as const : (nextActive?.step || r.status) as DemandRecord['status'], currentStep: r.currentStep + 1 };
      }));
    } else if (detailTask.rawKind === 'editApproval') {
      setEditApprovals((prev) => prev.map((r) => r.id === detailTask.id ? { ...r, status: '已通过' as const } : r));
    } else if (detailTask.rawKind === 'alert') {
      setAlertData((prev) => prev.map((a) => a.id === detailTask.id ? { ...a, handled: true } : a));
    }

    message.success('审批通过');
    setOpinion('');
    setDetailTask(null);
  };

  const handleReject = () => {
    if (!detailTask || !opinion.trim()) {
      message.warning('请填写驳回原因');
      return;
    }

    if (detailTask.rawKind === 'onboard') {
      setOnboardData((prev) => prev.map((r) => {
        if (r.id !== detailTask.id) return r;
        const newSteps = processApprovalSteps(r.approvalSteps, 'reject', opinion);
        return { ...r, approvalSteps: newSteps, status: '已驳回' as const };
      }));
    } else if (detailTask.rawKind === 'exit') {
      setExitData((prev) => prev.map((r) => {
        if (r.id !== detailTask.id) return r;
        const newSteps = processApprovalSteps(r.approvalSteps, 'reject', opinion);
        return { ...r, approvalSteps: newSteps, status: '已驳回' as const };
      }));
    } else if (detailTask.rawKind === 'transfer') {
      setTransferData((prev) => prev.map((r) => {
        if (r.id !== detailTask.id) return r;
        const newSteps = processApprovalSteps(r.approvalSteps, 'reject', opinion);
        return { ...r, approvalSteps: newSteps, status: '已驳回' as const };
      }));
    } else if (detailTask.rawKind === 'demand') {
      setDemandData((prev) => prev.map((r) => {
        if (r.id !== detailTask.id) return r;
        const newSteps = processApprovalSteps(r.approvalSteps, 'reject', opinion);
        return { ...r, approvalSteps: newSteps, status: '已驳回' as const };
      }));
    } else if (detailTask.rawKind === 'editApproval') {
      setEditApprovals((prev) => prev.map((r) => r.id === detailTask.id ? { ...r, status: '已驳回' as const } : r));
    }

    message.warning('已驳回');
    setOpinion('');
    setDetailTask(null);
  };

  const getTaskIcon = (task: UnifiedTask) => {
    const iconMap: Record<string, React.ReactNode> = {
      '待办审批': <AuditOutlined style={{ color: '#1677ff', fontSize: 18 }} />,
      '绩效考评': <TrophyOutlined style={{ color: '#722ed1', fontSize: 18 }} />,
      '员工信息调整': <EditOutlined style={{ color: '#fa8c16', fontSize: 18 }} />,
      '入职审批': <UserAddOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
      '退出审批': <UserDeleteOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
      '调动审批': <SwapOutlined style={{ color: '#13c2c2', fontSize: 18 }} />,
      '需求审批': <SolutionOutlined style={{ color: '#eb2f96', fontSize: 18 }} />,
    };
    return iconMap[task.type] || <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 18 }} />;
  };

  const renderApprovalSteps = (steps: ApprovalStep[], currentStep: number) => (
    <Steps
      current={currentStep - 1}
      direction="vertical"
      size="small"
      items={steps.map((s) => ({
        title: <span style={{ fontWeight: 500 }}>{s.step}</span>,
        status: stepStatusMap[s.status],
        icon: stepIconMap[s.status],
        description: (
          <div style={{ fontSize: 13, color: '#666', padding: '4px 0 8px' }}>
            {s.approver && <div>审批人：{s.approver}</div>}
            {s.time && <div>时间：{s.time}</div>}
            {s.opinion && (
              <div style={{ marginTop: 4, padding: '8px 12px', background: '#f6f8fa', borderRadius: 6, borderLeft: '3px solid #1677ff' }}>
                审批意见：{s.opinion}
              </div>
            )}
            {s.remark && !s.opinion && <div style={{ color: '#999' }}>备注：{s.remark}</div>}
          </div>
        ),
      }))}
    />
  );

  const renderDetailContent = () => {
    if (!detailTask) return null;

    if (detailTask.rawKind === 'onboard') {
      const item = detailTask.raw as OnboardRecord;
      return (
        <>
          <Card title="基本信息" style={{ borderRadius: 12, marginBottom: 20 }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="申请单号">{item.id}</Descriptions.Item>
              <Descriptions.Item label="员工名称">{item.employeeName}</Descriptions.Item>
              <Descriptions.Item label="员工工号">{item.employeeId}</Descriptions.Item>
              <Descriptions.Item label="所属自然人">{item.owner}</Descriptions.Item>
              <Descriptions.Item label="身份类型"><Tag color={item.ownerType === '自有' ? 'blue' : 'orange'}>{item.ownerType}</Tag></Descriptions.Item>
              <Descriptions.Item label="部门">{item.department}</Descriptions.Item>
              <Descriptions.Item label="岗位">{item.position}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{item.applyDate}</Descriptions.Item>
              <Descriptions.Item label="当前状态"><Tag color="processing">{item.status}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="审批流程" style={{ borderRadius: 12, marginBottom: 20 }}>
            {renderApprovalSteps(item.approvalSteps, item.currentStep)}
          </Card>
        </>
      );
    }

    if (detailTask.rawKind === 'exit') {
      const item = detailTask.raw as ExitRecord;
      return (
        <>
          <Card title="基本信息" style={{ borderRadius: 12, marginBottom: 20 }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="申请单号">{item.id}</Descriptions.Item>
              <Descriptions.Item label="员工名称">{item.employeeName}</Descriptions.Item>
              <Descriptions.Item label="员工工号">{item.employeeId}</Descriptions.Item>
              <Descriptions.Item label="部门">{item.department}</Descriptions.Item>
              <Descriptions.Item label="岗位">{item.position}</Descriptions.Item>
              <Descriptions.Item label="退出原因"><Tag color="red">{item.reason}</Tag></Descriptions.Item>
              <Descriptions.Item label="申请日期">{item.applyDate}</Descriptions.Item>
              <Descriptions.Item label="当前状态"><Tag color="processing">{item.status}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="审批流程" style={{ borderRadius: 12, marginBottom: 20 }}>
            {renderApprovalSteps(item.approvalSteps, item.currentStep)}
          </Card>
        </>
      );
    }

    if (detailTask.rawKind === 'transfer') {
      const item = detailTask.raw as TransferRecord;
      return (
        <>
          <Card title="基本信息" style={{ borderRadius: 12, marginBottom: 20 }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="申请单号">{item.id}</Descriptions.Item>
              <Descriptions.Item label="员工名称">{item.employeeName}</Descriptions.Item>
              <Descriptions.Item label="员工工号">{item.employeeId}</Descriptions.Item>
              <Descriptions.Item label="申请人">{item.applicant}</Descriptions.Item>
              <Descriptions.Item label="原部门">{item.fromDepartment}</Descriptions.Item>
              <Descriptions.Item label="原岗位">{item.fromPosition}</Descriptions.Item>
              <Descriptions.Item label="目标部门"><span style={{ color: '#1677ff', fontWeight: 500 }}>{item.toDepartment}</span></Descriptions.Item>
              <Descriptions.Item label="目标岗位"><span style={{ color: '#1677ff', fontWeight: 500 }}>{item.toPosition}</span></Descriptions.Item>
              <Descriptions.Item label="调动原因" span={2}>{item.reason}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{item.applyDate}</Descriptions.Item>
              <Descriptions.Item label="当前状态"><Tag color="processing">{item.status}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="审批流程" style={{ borderRadius: 12, marginBottom: 20 }}>
            {renderApprovalSteps(item.approvalSteps, item.currentStep)}
          </Card>
        </>
      );
    }

    if (detailTask.rawKind === 'demand') {
      const item = detailTask.raw as DemandRecord;
      return (
        <>
          <Card title="基本信息" style={{ borderRadius: 12, marginBottom: 20 }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="需求单号">{item.id}</Descriptions.Item>
              <Descriptions.Item label="需求名称"><span style={{ fontWeight: 500 }}>{item.title}</span></Descriptions.Item>
              <Descriptions.Item label="需求部门">{item.department}</Descriptions.Item>
              <Descriptions.Item label="需求岗位">{item.position}</Descriptions.Item>
              <Descriptions.Item label="需求人数"><span style={{ fontWeight: 600, color: '#1677ff' }}>{item.headcount} 人</span></Descriptions.Item>
              <Descriptions.Item label="紧急程度"><Tag color={item.urgency === '紧急' ? 'red' : 'blue'}>{item.urgency}</Tag></Descriptions.Item>
              <Descriptions.Item label="需求理由" span={2}>{item.reason}</Descriptions.Item>
              <Descriptions.Item label="岗位要求" span={2}>{item.requirements}</Descriptions.Item>
              <Descriptions.Item label="申请人">{item.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{item.applyDate}</Descriptions.Item>
              <Descriptions.Item label="当前状态"><Tag color="processing">{item.status}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="审批流程" style={{ borderRadius: 12, marginBottom: 20 }}>
            {renderApprovalSteps(item.approvalSteps, item.currentStep)}
          </Card>
        </>
      );
    }

    if (detailTask.rawKind === 'editApproval') {
      const item = detailTask.raw as EmployeeEditApproval;
      return (
        <Card title="基本信息" style={{ borderRadius: 12, marginBottom: 20 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="审批单号">{item.id}</Descriptions.Item>
            <Descriptions.Item label="员工名称">{item.employeeName}</Descriptions.Item>
            <Descriptions.Item label="变更字段">{item.field}</Descriptions.Item>
            <Descriptions.Item label="申请人">{item.applicant}</Descriptions.Item>
            <Descriptions.Item label="原值">{item.oldValue}</Descriptions.Item>
            <Descriptions.Item label="新值"><span style={{ color: '#1677ff', fontWeight: 500 }}>{item.newValue}</span></Descriptions.Item>
            <Descriptions.Item label="申请日期">{item.applyDate}</Descriptions.Item>
            <Descriptions.Item label="当前状态"><Tag color={item.status === '待审批' ? 'processing' : item.status === '已通过' ? 'success' : 'error'}>{item.status}</Tag></Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }

    if (detailTask.rawKind === 'performance') {
      const item = detailTask.raw as PerformanceReview;
      return (
        <>
          <Card title="基本信息" style={{ borderRadius: 12, marginBottom: 20 }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="活动名称">{item.name}</Descriptions.Item>
              <Descriptions.Item label="年度">{item.year}</Descriptions.Item>
              <Descriptions.Item label="周期">{item.period}</Descriptions.Item>
              <Descriptions.Item label="类型">{item.periodType}</Descriptions.Item>
              <Descriptions.Item label="当前环节"><Tag color="processing">{item.currentStep}</Tag></Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color="processing">{item.status}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="绩效流程" style={{ borderRadius: 12, marginBottom: 20 }}>
            <Steps
              current={item.steps.findIndex((s) => s.status === '进行中')}
              size="small"
              items={item.steps.map((step) => ({
                title: step.label,
                description: step.deadline ? `截止 ${step.deadline}` : undefined,
                status: step.status === '已完成' ? 'finish' : step.status === '进行中' ? 'process' : 'wait',
              }))}
            />
          </Card>
        </>
      );
    }

    const item = detailTask.raw as AlertItem;
    return (
      <Card title="基本信息" style={{ borderRadius: 12, marginBottom: 20 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="类型"><Tag color={typeColorMap[item.type]}>{item.type}</Tag></Descriptions.Item>
          <Descriptions.Item label="级别">
            <Tag color={item.level === 'critical' ? 'red' : item.level === 'warning' ? 'orange' : 'blue'}>
              {item.level === 'critical' ? '紧急' : item.level === 'warning' ? '警告' : '提示'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="标题" span={2}>{item.title}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>{item.description}</Descriptions.Item>
          <Descriptions.Item label="时间">{item.time}</Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  // Detail page view
  if (detailTask) {
    const isCompleted = detailTask.status === '已处理';
    const hasActiveStep = detailTask.rawKind === 'onboard' || detailTask.rawKind === 'exit' ||
      detailTask.rawKind === 'transfer' || detailTask.rawKind === 'demand';

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => { setDetailTask(null); setOpinion(''); }}>返回列表</Button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>审批详情</h2>
          <Tag color={typeColorMap[detailTask.type]}>{detailTask.type}</Tag>
          <Tag color={detailTask.status === '待处理' ? 'warning' : 'success'}>
            {detailTask.status === '待处理' ? <><ClockCircleOutlined /> 待处理</> : <><CheckCircleOutlined /> 已处理</>}
          </Tag>
        </div>

        {renderDetailContent()}

        {canApprove && !isCompleted && (
          <Card title="审批操作" style={{ borderRadius: 12, marginBottom: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500, color: '#333' }}>审批意见</div>
              <Input.TextArea
                rows={4}
                placeholder="请输入审批意见..."
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                style={{ borderRadius: 8 }}
                maxLength={500}
                showCount
              />
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Space>
              <Button type="primary" size="large" onClick={handleApprove} style={{ minWidth: 120 }}>
                审批通过
              </Button>
              {hasActiveStep && (
                <Button danger size="large" onClick={handleReject} style={{ minWidth: 120 }}>
                  驳回
                </Button>
              )}
            </Space>
          </Card>
        )}

        {isCompleted && (
          <Card style={{ borderRadius: 12 }}>
            <Result status="success" title="该事项已处理完成" />
          </Card>
        )}
      </div>
    );
  }

  const typeOptions: TaskType[] = ['全部', '待办审批', '绩效考评', '员工信息调整', '入职审批', '退出审批', '调动审批', '需求审批'];

  return (
    <div>
      <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>我的待办</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>集中处理待办审批、绩效考评、员工信息调整、入职退出审批、调动审批、需求审批。</p>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: '待办审批', key: '待办审批', icon: <AuditOutlined style={{ color: '#1677ff' }} />, color: '#1677ff', bg: '#f0f5ff' },
          { title: '绩效考评', key: '绩效考评', icon: <TrophyOutlined style={{ color: '#722ed1' }} />, color: '#722ed1', bg: '#f9f0ff' },
          { title: '信息变更', key: '员工信息调整', icon: <EditOutlined style={{ color: '#fa8c16' }} />, color: '#fa8c16', bg: '#fff7e6' },
          { title: '入职审批', key: '入职审批', icon: <UserAddOutlined style={{ color: '#52c41a' }} />, color: '#52c41a', bg: '#f0fff0' },
          { title: '退出审批', key: '退出审批', icon: <UserDeleteOutlined style={{ color: '#ff4d4f' }} />, color: '#ff4d4f', bg: '#fff5f5' },
          { title: '调动审批', key: '调动审批', icon: <SwapOutlined style={{ color: '#13c2c2' }} />, color: '#13c2c2', bg: '#e6fffb' },
          { title: '需求审批', key: '需求审批', icon: <SolutionOutlined style={{ color: '#eb2f96' }} />, color: '#eb2f96', bg: '#fff0f6' },
        ].map((item) => (
          <Col span={3} key={item.key} style={{ marginBottom: 8 }}>
            <Card style={{ borderRadius: 12, background: `linear-gradient(135deg, ${item.bg} 0%, #fff 100%)`, cursor: 'pointer' }}
              onClick={() => setTypeFilter(item.key as TaskType)}>
              <Statistic title={item.title} value={typeCounts[item.key as keyof typeof typeCounts] || 0}
                prefix={item.icon} valueStyle={{ color: item.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Segmented
            options={[
              { label: <span>待办 <Badge count={pendingCount} size="small" offset={[4, -2]} /></span>, value: '待办' },
              { label: <span>已办 <Badge count={doneCount} size="small" offset={[4, -2]} showZero /></span>, value: '已办' },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v as '待办' | '已办')}
          />
          <Input
            placeholder="搜索待办..."
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {typeOptions.map((t) => {
            const count = t === '全部' ? pendingCount : typeCounts[t as keyof typeof typeCounts] || 0;
            const isActive = typeFilter === t;
            return (
              <Tag
                key={t}
                color={isActive ? (typeColorMap[t] || 'blue') : undefined}
                style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13, borderRadius: 16, border: isActive ? undefined : '1px solid #d9d9d9' }}
                onClick={() => setTypeFilter(t)}
              >
                {t} {viewMode === '待办' && count > 0 && <Badge count={count} size="small" offset={[4, -2]} />}
              </Tag>
            );
          })}
        </div>

        <List
          dataSource={filteredTasks}
          locale={{ emptyText: viewMode === '待办' ? '暂无待办事项' : '暂无已办事项' }}
          renderItem={(task) => (
            <List.Item
              style={{ padding: '12px 16px', marginBottom: 8, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}
              actions={
                task.status === '待处理'
                  ? [
                    <Button type="primary" size="small" key="process" onClick={() => setDetailTask(task)}>处理</Button>,
                  ]
                  : [
                    <Button type="link" size="small" key="detail" onClick={() => setDetailTask(task)}>详情</Button>,
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
    </div>
  );
};

export default PendingTasks;
