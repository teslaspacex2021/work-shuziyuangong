import React, { useState, useMemo } from 'react';
import {
  Card, Row, Col, Statistic, Tag, List, Button, Badge, Space,
  Modal, Descriptions, Timeline, Select, Empty, message,
} from 'antd';
import {
  AlertOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { alerts, type AlertItem } from '../../mock/data';

const AlertsWarning: React.FC = () => {
  const [alertData, setAlertData] = useState<AlertItem[]>(
    () => alerts.filter((a) => a.type === '风险预警'),
  );
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [handledFilter, setHandledFilter] = useState<string>('all');

  const filteredAlerts = useMemo(() => {
    return alertData.filter((a) => {
      if (levelFilter !== 'all' && a.level !== levelFilter) return false;
      if (handledFilter === 'handled' && !a.handled) return false;
      if (handledFilter === 'unhandled' && a.handled) return false;
      return true;
    });
  }, [alertData, levelFilter, handledFilter]);

  const criticalCount = alertData.filter((a) => a.level === 'critical' && !a.handled).length;
  const warningCount = alertData.filter((a) => a.level === 'warning' && !a.handled).length;
  const handledCount = alertData.filter((a) => a.handled).length;

  const handleMark = (id: string) => {
    setAlertData((prev) =>
      prev.map((a) => (a.id === id ? { ...a, handled: true } : a)),
    );
    message.success('已标记为已处理');
  };

  const showDetail = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setDetailVisible(true);
  };

  const levelIcon = (level: string) => {
    if (level === 'critical') return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
    return <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />;
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>数字人预警</h2>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fff1f0 0%, #fff 100%)' }}>
            <Statistic
              title="紧急预警"
              value={criticalCount}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fffbe6 0%, #fff 100%)' }}>
            <Statistic
              title="警告预警"
              value={warningCount}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)' }}>
            <Statistic
              title="已处理"
              value={handledCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="总预警数"
              value={alertData.length}
              prefix={<AlertOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#999' }}>
                  / 未处理 {alertData.filter((a) => !a.handled).length}
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="预警列表"
        style={{ borderRadius: 12 }}
        extra={
          <Space>
            <Select
              value={levelFilter}
              onChange={setLevelFilter}
              style={{ width: 120 }}
              options={[
                { label: '全部级别', value: 'all' },
                { label: '紧急', value: 'critical' },
                { label: '警告', value: 'warning' },
              ]}
            />
            <Select
              value={handledFilter}
              onChange={setHandledFilter}
              style={{ width: 120 }}
              options={[
                { label: '全部状态', value: 'all' },
                { label: '已处理', value: 'handled' },
                { label: '未处理', value: 'unhandled' },
              ]}
            />
          </Space>
        }
      >
        <List
          dataSource={filteredAlerts}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" size="small" onClick={() => showDetail(item)}>
                  详情
                </Button>,
                !item.handled && (
                  <Button type="link" size="small" onClick={() => handleMark(item.id)}>
                    标记已处理
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
                    <Tag color={item.level === 'critical' ? 'red' : 'orange'}>
                      {item.level === 'critical' ? '紧急' : '警告'}
                    </Tag>
                    {item.handled ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">已处理</Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="warning">未处理</Tag>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                      {item.description}
                    </div>
                    <span style={{ fontSize: 12, color: '#999' }}>{item.time}</span>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: <Empty description="暂无预警数据" /> }}
        />
      </Card>

      <Modal
        title="预警详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={
          selectedAlert && !selectedAlert.handled ? (
            <Space>
              <Button onClick={() => setDetailVisible(false)}>关闭</Button>
              <Button
                type="primary"
                danger
                onClick={() => {
                  if (selectedAlert) handleMark(selectedAlert.id);
                  setDetailVisible(false);
                }}
              >
                标记已处理
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setDetailVisible(false)}>关闭</Button>
          )
        }
        width={520}
      >
        {selectedAlert && (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="类型">
                <Tag color="red">{selectedAlert.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="级别">
                <Tag color={selectedAlert.level === 'critical' ? 'red' : 'orange'}>
                  {selectedAlert.level === 'critical' ? '紧急' : '警告'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="标题">{selectedAlert.title}</Descriptions.Item>
              <Descriptions.Item label="描述">{selectedAlert.description}</Descriptions.Item>
              <Descriptions.Item label="时间">{selectedAlert.time}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {selectedAlert.handled ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">已处理</Tag>
                ) : (
                  <Tag icon={<ClockCircleOutlined />} color="warning">未处理</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>处理时间线：</div>
            <Timeline
              items={[
                { color: 'blue', children: `${selectedAlert.time} 预警生成` },
                { color: 'gray', children: '系统自动检测触发' },
                ...(selectedAlert.handled
                  ? [{ color: 'green' as const, children: '已标记为已处理' }]
                  : [{ color: 'red' as const, children: '等待处理中...' }]
                ),
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default AlertsWarning;
