import React, { useMemo, useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Modal, Row, Col,
  Statistic, Descriptions, List, Avatar, message,
} from 'antd';
import {
  MessageOutlined, SearchOutlined, EyeOutlined, ExportOutlined,
  LikeOutlined, DislikeOutlined, WarningOutlined, CheckCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  conversationSessions,
  type ConversationSession,
} from '../../mock/data';

const statusColor: Record<string, string> = {
  正常: 'success',
  异常: 'error',
  已归档: 'default',
};

const ConversationManagement: React.FC = () => {
  const [sessions, setSessions] = useState(conversationSessions);
  const [searchText, setSearchText] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected, setSelected] = useState<ConversationSession | null>(null);

  const employeeOptions = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((s) => map.set(s.employeeId, s.employeeName));
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [sessions]);

  const filtered = sessions.filter((s) => {
    const q = searchText.trim();
    const matchSearch = !q
      || s.title.includes(q)
      || s.userName.includes(q)
      || s.employeeName.includes(q)
      || s.department.includes(q);
    const matchEmp = employeeFilter === 'all' || s.employeeId === employeeFilter;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchEmp && matchStatus;
  });

  const markAbnormal = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: '异常' as const } : s)),
    );
    message.success('已标记为异常会话');
  };

  const archiveSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: '已归档' as const } : s)),
    );
    message.success('已归档');
  };

  const columns = [
    {
      title: '会话ID',
      dataIndex: 'id',
      width: 90,
      render: (t: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t}</span>,
    },
    {
      title: '会话标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (text: string, record: ConversationSession) => (
        <a
          onClick={() => {
            setSelected(record);
            setDetailVisible(true);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '用户',
      key: 'user',
      width: 150,
      render: (_: unknown, r: ConversationSession) => (
        <span>{r.userName}（{r.department}）</span>
      ),
    },
    {
      title: '数字员工',
      dataIndex: 'employeeName',
      width: 120,
      render: (t: string) => <Tag color="processing">{t}</Tag>,
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      width: 80,
    },
    {
      title: '反馈',
      key: 'feedback',
      width: 110,
      render: (_: unknown, r: ConversationSession) => (
        <Space size={8}>
          <span style={{ color: '#52c41a' }}><LikeOutlined /> {r.likeCount}</span>
          <span style={{ color: '#ff4d4f' }}><DislikeOutlined /> {r.dislikeCount}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
    },
    { title: '更新时间', dataIndex: 'updateTime', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: ConversationSession) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelected(record);
              setDetailVisible(true);
            }}
          >
            详情
          </Button>
          {record.status === '正常' && (
            <Button
              type="link"
              size="small"
              danger
              icon={<WarningOutlined />}
              onClick={() => markAbnormal(record.id)}
            >
              异常
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>对话运营</h2>
        <p style={{ color: '#666', margin: 0 }}>
          查看用户与数字员工的问答会话，支持运营标记与导出，便于统一运营管理与质量分析。
        </p>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="会话总数" value={sessions.length} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="正常"
              value={sessions.filter((s) => s.status === '正常').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="点赞合计"
              value={sessions.reduce((a, s) => a + s.likeCount, 0)}
              prefix={<LikeOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="点踩合计"
              value={sessions.reduce((a, s) => a + s.dislikeCount, 0)}
              prefix={<DislikeOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title="会话列表"
        extra={
          <Space>
            <Input
              placeholder="搜索标题/用户/员工/部门"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
            <Select
              style={{ width: 140 }}
              value={employeeFilter}
              onChange={setEmployeeFilter}
              options={[{ value: 'all', label: '全部员工' }, ...employeeOptions]}
            />
            <Select
              style={{ width: 110 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: '正常', label: '正常' },
                { value: '异常', label: '异常' },
                { value: '已归档', label: '已归档' },
              ]}
            />
            <Button icon={<ExportOutlined />} onClick={() => message.success('已导出会话清单（演示）')}>
              导出
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>

      <Modal
        title={`会话详情 — ${selected?.title ?? ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={720}
        footer={
          selected ? (
            <Space>
              {selected.status === '正常' && (
                <Button danger onClick={() => { markAbnormal(selected.id); setDetailVisible(false); }}>
                  标记异常
                </Button>
              )}
              {selected.status !== '已归档' && (
                <Button onClick={() => { archiveSession(selected.id); setDetailVisible(false); }}>
                  归档
                </Button>
              )}
              <Button type="primary" onClick={() => setDetailVisible(false)}>关闭</Button>
            </Space>
          ) : null
        }
      >
        {selected && (
          <div>
            <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="会话ID">{selected.id}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColor[selected.status]}>{selected.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="用户">{selected.userName}（{selected.department}）</Descriptions.Item>
              <Descriptions.Item label="数字员工">{selected.employeeName}</Descriptions.Item>
              <Descriptions.Item label="员工编码">{selected.employeeCode}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selected.updateTime}</Descriptions.Item>
            </Descriptions>

            <List
              dataSource={selected.messages}
              renderItem={(msg) => (
                <List.Item style={{ alignItems: 'flex-start' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ background: msg.role === 'user' ? '#e4393c' : '#1677ff' }}>
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <span>{msg.role === 'user' ? '用户' : '数字员工'}</span>
                        <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>{msg.time}</span>
                        {msg.feedback === 'like' && <Tag color="success" icon={<LikeOutlined />}>赞</Tag>}
                        {msg.feedback === 'dislike' && <Tag color="error" icon={<DislikeOutlined />}>踩</Tag>}
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ color: '#333', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        {msg.retrievedFiles && msg.retrievedFiles.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <span style={{ fontSize: 12, color: '#999' }}>检索文件：</span>
                            {msg.retrievedFiles.map((f) => (
                              <Tag key={f.id} icon={<FileTextOutlined />} style={{ marginTop: 4 }}>
                                {f.name}
                              </Tag>
                            ))}
                          </div>
                        )}
                        {msg.recalledFiles && msg.recalledFiles.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <span style={{ fontSize: 12, color: '#999' }}>召回文件：</span>
                            {msg.recalledFiles.map((f) => (
                              <Tag key={f.id} color="blue" icon={<FileTextOutlined />} style={{ marginTop: 4 }}>
                                {f.name}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConversationManagement;
