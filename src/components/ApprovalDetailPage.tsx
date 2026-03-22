import React, { useState } from 'react';
import {
  Card, Button, Tag, Descriptions, Steps, Input, Space, message, Divider, Result,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined, LoadingOutlined,
} from '@ant-design/icons';
import type { ApprovalStep } from '../mock/data';
import { usePermission } from '../contexts/PermissionContext';

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

interface ApprovalDetailPageProps {
  title: string;
  status: string;
  statusColor: string;
  basicInfoItems: { label: string; value: React.ReactNode; span?: number }[];
  approvalSteps: ApprovalStep[];
  currentStep: number;
  onBack: () => void;
  onApprove?: (opinion: string) => void;
  onReject?: (opinion: string) => void;
  isCompleted?: boolean;
  extraContent?: React.ReactNode;
}

const ApprovalDetailPage: React.FC<ApprovalDetailPageProps> = ({
  title,
  status,
  statusColor,
  basicInfoItems,
  approvalSteps,
  currentStep,
  onBack,
  onApprove,
  onReject,
  isCompleted = false,
  extraContent,
}) => {
  const [opinion, setOpinion] = useState('');
  const { hasPermission } = usePermission();

  const canApprove = hasPermission('approval:approve') && !isCompleted;
  const hasActiveStep = approvalSteps.some((s) => s.status === '进行中');

  const handleApprove = () => {
    if (!opinion.trim()) {
      message.warning('请填写审批意见');
      return;
    }
    onApprove?.(opinion);
    setOpinion('');
    message.success('审批通过');
  };

  const handleReject = () => {
    if (!opinion.trim()) {
      message.warning('请填写驳回原因');
      return;
    }
    onReject?.(opinion);
    setOpinion('');
    message.warning('已驳回');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>返回列表</Button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h2>
        <Tag color={statusColor}>{status}</Tag>
      </div>

      <Card title="基本信息" style={{ borderRadius: 12, marginBottom: 20 }}>
        <Descriptions bordered column={2} size="small">
          {basicInfoItems.map((item) => (
            <Descriptions.Item key={item.label} label={item.label} span={item.span}>
              {item.value}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>

      {extraContent}

      <Card title="审批流程" style={{ borderRadius: 12, marginBottom: 20 }}>
        <Steps
          current={currentStep - 1}
          direction="vertical"
          size="small"
          items={approvalSteps.map((s) => ({
            title: (
              <span style={{ fontWeight: 500 }}>{s.step}</span>
            ),
            status: stepStatusMap[s.status],
            icon: stepIconMap[s.status],
            description: (
              <div style={{ fontSize: 13, color: '#666', padding: '4px 0 8px' }}>
                {s.approver && <div>审批人：{s.approver}</div>}
                {s.time && <div>时间：{s.time}</div>}
                {s.opinion && (
                  <div style={{ marginTop: 4, padding: '8px 12px', background: '#f6f8fa', borderRadius: 6, borderLeft: '3px solid #1677ff' }}>
                    <span style={{ color: '#333' }}>审批意见：{s.opinion}</span>
                  </div>
                )}
                {s.remark && !s.opinion && <div style={{ color: '#999' }}>备注：{s.remark}</div>}
              </div>
            ),
          }))}
        />
      </Card>

      {canApprove && hasActiveStep && (
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
            <Button danger size="large" onClick={handleReject} style={{ minWidth: 120 }}>
              驳回
            </Button>
          </Space>
        </Card>
      )}

      {isCompleted && (
        <Card style={{ borderRadius: 12 }}>
          <Result
            status="success"
            title="审批已完成"
            subTitle={`${title}的所有审批流程已结束`}
          />
        </Card>
      )}
    </div>
  );
};

export default ApprovalDetailPage;
