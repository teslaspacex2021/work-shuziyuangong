import React, { useState } from 'react';
import {
  Card, Tabs, List, Tag, Button, Badge, Space, Modal, message,
  Row, Col, Statistic, Empty, Descriptions, Timeline,
} from 'antd';
import {
  AlertOutlined, AuditOutlined, BellOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { alerts, type AlertItem } from '../../mock/data';

const AlertsPage: React.FC = () => {
  const [alertData, setAlertData] = useState(alerts);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const riskAlerts = alertData.filter((a) => a.type === '风险预警');
  const pendingApprovals = alertData.filter((a) => a.type === '待办审批');
  const systemNotices = alertData.filter((a) => a.type === '系统通知');
  const unhandledCount = alertData.filter((a) => !a.handled).length;

  const handleAlert = (id: string) => {
    setAlertData((prev) =>
      prev.map((a) => (a.id === id ? { ...a, handled: true } : a))
    );
    message.success('已处理');
  };

  const showDetail = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setDetailVisible(true);
  };

  const levelIcon = (level: string) => {
    if (level === 'critical') return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
    if (level === 'warning') return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    return <InfoCircleOutlined style={{ color: '#1677ff' }} />;
  };

  const renderAlertList = (data: AlertItem[]) => (
    <List
      dataSource={data}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button type="link" size="small" onClick={() => showDetail(item)}>详情</Button>,
            !item.handled && (
              <Button type="link" size="small" onClick={() => handleAlert(item.id)}>
                {item.type === '待办审批' ? '审批' : '处理'}
              </Button>
            ),
          ].filter(Boolean)}
        >
          <List.Item.Meta
            avatar={
              <Badge dot={!item.handled} offset={[-2, 2]}>
                {levelIcon(item.level)}
              </Badge>
            }
            title={
              <Space>
                <span style={{ fontSize: 14 }}>{item.title}</span>
                {item.handled && <Tag color="default" style={{ fontSize: 11 }}>已处理</Tag>}
              </Space>
            }
            description={
              <div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{item.description}</div>
                <span style={{ fontSize: 12, color: '#999' }}>{item.time}</span>
              </div>
            }
          />
        </List.Item>
      )}
      locale={{ emptyText: <Empty description="暂无数据" /> }}
    />
  );

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>预警与待办</h2>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)' }}>
            <Statistic
              title="风险预警"
              value={riskAlerts.filter((a) => !a.handled).length}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)' }}>
            <Statistic
              title="待办审批"
              value={pendingApprovals.filter((a) => !a.handled).length}
              prefix={<AuditOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f0fff0 0%, #fff 100%)' }}>
            <Statistic
              title="系统通知"
              value={systemNotices.filter((a) => !a.handled).length}
              prefix={<BellOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="待处理总数"
              value={unhandledCount}
              prefix={<ClockCircleOutlined />}
              suffix={<span style={{ fontSize: 14, color: '#999' }}>/ {alertData.length}</span>}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="risk"
          items={[
            {
              key: 'risk',
              label: <span><AlertOutlined /> 风险预警 <Badge count={riskAlerts.filter((a) => !a.handled).length} size="small" offset={[6, -2]} /></span>,
              children: renderAlertList(riskAlerts),
            },
            {
              key: 'approval',
              label: <span><AuditOutlined /> 待办审批 <Badge count={pendingApprovals.filter((a) => !a.handled).length} size="small" offset={[6, -2]} /></span>,
              children: renderAlertList(pendingApprovals),
            },
            {
              key: 'notice',
              label: <span><BellOutlined /> 系统通知</span>,
              children: renderAlertList(systemNotices),
            },
            {
              key: 'all',
              label: `全部 (${alertData.length})`,
              children: renderAlertList(alertData),
            },
          ]}
        />
      </Card>

      <Modal
        title="预警/待办详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={
          selectedAlert && !selectedAlert.handled ? (
            <Space>
              <Button onClick={() => setDetailVisible(false)}>关闭</Button>
              <Button type="primary" onClick={() => {
                if (selectedAlert) handleAlert(selectedAlert.id);
                setDetailVisible(false);
              }}>
                {selectedAlert?.type === '待办审批' ? '批准' : '标记已处理'}
              </Button>
            </Space>
          ) : null
        }
        width={520}
      >
        {selectedAlert && (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="类型">
                <Tag color={selectedAlert.type === '风险预警' ? 'red' : selectedAlert.type === '待办审批' ? 'blue' : 'default'}>
                  {selectedAlert.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="级别">
                <Tag color={selectedAlert.level === 'critical' ? 'red' : selectedAlert.level === 'warning' ? 'orange' : 'blue'}>
                  {selectedAlert.level === 'critical' ? '紧急' : selectedAlert.level === 'warning' ? '警告' : '提示'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="标题">{selectedAlert.title}</Descriptions.Item>
              <Descriptions.Item label="描述">{selectedAlert.description}</Descriptions.Item>
              <Descriptions.Item label="时间">{selectedAlert.time}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {selectedAlert.handled ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">已处理</Tag>
                ) : (
                  <Tag icon={<ClockCircleOutlined />} color="warning">待处理</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>处理时间线：</div>
            <Timeline
              items={[
                { color: 'blue', children: `${selectedAlert.time} 预警生成` },
                ...(selectedAlert.handled ? [{ color: 'green' as const, children: '已处理完成' }] : [{ color: 'gray' as const, children: '等待处理中...' }]),
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default AlertsPage;
