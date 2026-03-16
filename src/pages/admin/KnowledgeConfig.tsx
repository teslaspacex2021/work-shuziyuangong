import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Avatar, Modal, Checkbox, message,
  Row, Col, Statistic, Descriptions, Input, List, Badge,
} from 'antd';
import {
  SettingOutlined, SearchOutlined, BookOutlined,
  CheckCircleOutlined, TeamOutlined, InfoCircleOutlined,
  DatabaseOutlined, FileTextOutlined, SyncOutlined,
} from '@ant-design/icons';
import { digitalEmployees, knowledgeBases, type DigitalEmployee } from '../../mock/data';

const typeIcon: Record<string, React.ReactNode> = {
  '知识库': <DatabaseOutlined style={{ color: '#1677ff' }} />,
  '知识卡片': <FileTextOutlined style={{ color: '#52c41a' }} />,
  '数据集': <BookOutlined style={{ color: '#722ed1' }} />,
};

const KnowledgeConfig: React.FC = () => {
  const [employees, setEmployees] = useState(digitalEmployees);
  const [configVisible, setConfigVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [selectedKBIds, setSelectedKBIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const filtered = employees.filter((e) =>
    e.name.includes(searchText) || e.id.includes(searchText) || e.department.includes(searchText)
  );

  const openConfig = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setSelectedKBIds([...emp.knowledgeIds]);
    setConfigVisible(true);
  };

  const saveConfig = () => {
    if (selectedEmployee) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === selectedEmployee.id ? { ...e, knowledgeIds: selectedKBIds } : e
        )
      );
      message.success(`已为 ${selectedEmployee.name} 更新知识配置`);
      setConfigVisible(false);
    }
  };

  const showDetail = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setDetailVisible(true);
  };

  const totalBindings = employees.reduce((sum, e) => sum + e.knowledgeIds.length, 0);

  const columns = [
    {
      title: '数字员工', key: 'name', width: 200,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Avatar style={{ background: record.status === 'ACTIVE' ? '#1677ff' : '#999' }}>
            {record.avatar}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.id}</div>
          </div>
        </Space>
      ),
    },
    { title: '部门', dataIndex: 'department', key: 'department', width: 130 },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 130 },
    {
      title: '已关联知识', key: 'knowledge', width: 300,
      render: (_: unknown, record: DigitalEmployee) => {
        const kbs = knowledgeBases.filter((kb) => record.knowledgeIds.includes(kb.id));
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {kbs.length > 0 ? kbs.map((kb) => (
              <Tag key={kb.id} icon={typeIcon[kb.type]} style={{ margin: 0 }}>{kb.name}</Tag>
            )) : <span style={{ color: '#999', fontSize: 12 }}>暂未关联</span>}
          </div>
        );
      },
    },
    {
      title: '知识数', key: 'count', width: 80,
      render: (_: unknown, record: DigitalEmployee) => (
        <span style={{ fontWeight: 600, color: record.knowledgeIds.length > 0 ? '#1677ff' : '#999' }}>
          {record.knowledgeIds.length}
        </span>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => (
        <Tag color={s === 'ACTIVE' ? 'success' : s === 'TRAINING' ? 'processing' : s === 'SUSPENDED' ? 'warning' : 'error'}>
          {s}
        </Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: unknown, record: DigitalEmployee) => (
        <Space>
          <Button type="primary" size="small" icon={<SettingOutlined />} onClick={() => openConfig(record)}>
            配置知识
          </Button>
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>知识配置</h2>
      <p style={{ color: '#666', marginBottom: 20, marginTop: -12 }}>
        为数字员工关联知识资源（知识库、知识卡片、数据集），夯实数字员工的能力基础。
      </p>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="数字员工总数" value={employees.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="可用知识资源" value={knowledgeBases.length} prefix={<DatabaseOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="总关联数" value={totalBindings} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="文档总数"
              value={knowledgeBases.reduce((s, k) => s + k.docCount, 0)}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title="数字员工知识配置"
        extra={
          <Input
            placeholder="搜索员工..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
        }
      >
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      <Modal
        title={`配置知识 — ${selectedEmployee?.name}`}
        open={configVisible}
        onCancel={() => setConfigVisible(false)}
        onOk={saveConfig}
        okText="保存配置"
        width={680}
      >
        {selectedEmployee && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
              <Avatar size={48} style={{ background: '#1677ff' }}>{selectedEmployee.avatar}</Avatar>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedEmployee.name}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{selectedEmployee.department} · {selectedEmployee.position}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{selectedEmployee.description}</div>
              </div>
            </div>
            <div style={{ fontWeight: 500, marginBottom: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              勾选知识资源，数字员工将基于这些知识来回答问题和处理任务：
            </div>
            <Checkbox.Group
              value={selectedKBIds}
              onChange={(vals) => setSelectedKBIds(vals as string[])}
              style={{ width: '100%' }}
            >
              <Row gutter={[12, 12]}>
                {knowledgeBases.map((kb) => (
                  <Col span={12} key={kb.id}>
                    <Card
                      size="small"
                      hoverable
                      style={{
                        borderRadius: 8,
                        borderColor: selectedKBIds.includes(kb.id) ? '#1677ff' : '#f0f0f0',
                        background: selectedKBIds.includes(kb.id) ? '#f0f5ff' : '#fff',
                      }}
                    >
                      <Checkbox value={kb.id} style={{ width: '100%' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {typeIcon[kb.type]}
                            <span style={{ fontWeight: 500 }}>{kb.name}</span>
                            <Tag
                              color={kb.status === '已发布' ? 'success' : kb.status === '学习中' ? 'processing' : 'warning'}
                              style={{ fontSize: 10 }}
                            >
                              {kb.status === '学习中' && <SyncOutlined spin style={{ marginRight: 2 }} />}
                              {kb.status}
                            </Tag>
                          </div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{kb.description}</div>
                          <div style={{ fontSize: 11, color: '#1677ff', marginTop: 2 }}>
                            {kb.type} · {kb.docCount} 篇文档 · 更新于 {kb.lastUpdate}
                          </div>
                        </div>
                      </Checkbox>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
            <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
              已选择 {selectedKBIds.length} 个知识资源
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={`知识详情 — ${selectedEmployee?.name}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={560}
      >
        {selectedEmployee && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="工号">{selectedEmployee.id}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedEmployee.status === 'ACTIVE' ? 'success' : 'processing'}>{selectedEmployee.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="部门">{selectedEmployee.department}</Descriptions.Item>
              <Descriptions.Item label="岗位">{selectedEmployee.position}</Descriptions.Item>
            </Descriptions>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>已关联的知识资源：</div>
            <List
              size="small"
              dataSource={knowledgeBases.filter((kb) => selectedEmployee.knowledgeIds.includes(kb.id))}
              renderItem={(kb) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={typeIcon[kb.type]}
                    title={<Space>{kb.name}<Tag>{kb.type}</Tag><Badge count={kb.docCount} style={{ background: '#1677ff' }} overflowCount={9999} /></Space>}
                    description={kb.description}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂未关联知识资源' }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeConfig;
