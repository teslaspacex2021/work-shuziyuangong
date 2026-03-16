import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Avatar, Modal, Checkbox, message,
  Row, Col, Statistic, Descriptions, Input, List,
} from 'antd';
import {
  SettingOutlined, SearchOutlined, ThunderboltOutlined,
  CheckCircleOutlined, TeamOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { digitalEmployees, skills, type DigitalEmployee } from '../../mock/data';

const levelColor: Record<string, string> = {
  L1: '#C0C0C0', L2: '#6B7B8D', L3: '#1677ff', L4: '#0A1929',
};

const SkillConfig: React.FC = () => {
  const [employees, setEmployees] = useState(digitalEmployees);
  const [configVisible, setConfigVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const filtered = employees.filter((e) =>
    e.name.includes(searchText) || e.id.includes(searchText) || e.department.includes(searchText)
  );

  const openConfig = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setSelectedSkillIds([...emp.skillIds]);
    setConfigVisible(true);
  };

  const saveConfig = () => {
    if (selectedEmployee) {
      const newSkillNames = skills.filter((s) => selectedSkillIds.includes(s.id)).map((s) => s.name);
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === selectedEmployee.id ? { ...e, skillIds: selectedSkillIds, skills: newSkillNames } : e
        )
      );
      message.success(`已为 ${selectedEmployee.name} 更新技能配置`);
      setConfigVisible(false);
    }
  };

  const showDetail = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setDetailVisible(true);
  };

  const totalBindings = employees.reduce((sum, e) => sum + e.skillIds.length, 0);
  const avgSkills = (totalBindings / employees.length).toFixed(1);

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
      title: '已配置技能', key: 'skills', width: 300,
      render: (_: unknown, record: DigitalEmployee) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {record.skills.length > 0 ? record.skills.map((s) => (
            <Tag key={s} color="processing" style={{ margin: 0 }}>{s}</Tag>
          )) : <span style={{ color: '#999', fontSize: 12 }}>暂未配置</span>}
        </div>
      ),
    },
    {
      title: '技能数', key: 'count', width: 80,
      render: (_: unknown, record: DigitalEmployee) => (
        <span style={{ fontWeight: 600, color: record.skillIds.length > 0 ? '#1677ff' : '#999' }}>
          {record.skillIds.length}
        </span>
      ),
    },
    {
      title: '能力等级', dataIndex: 'level', key: 'level', width: 90,
      render: (l: string) => <Tag color={levelColor[l]} style={{ color: l === 'L4' || l === 'L3' ? '#fff' : '#333' }}>{l}</Tag>,
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
            配置技能
          </Button>
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>技能配置</h2>
      <p style={{ color: '#666', marginBottom: 20, marginTop: -12 }}>
        为数字员工配置技能，决定其能力范围。数字员工将根据用户输入自动调用已配置的技能来处理任务。
      </p>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="数字员工总数" value={employees.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="可用技能总数" value={skills.length} prefix={<ThunderboltOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="总绑定数" value={totalBindings} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="平均技能数" value={avgSkills} prefix={<ThunderboltOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        title="数字员工技能配置"
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

      {/* Skill Config Modal */}
      <Modal
        title={`配置技能 — ${selectedEmployee?.name}`}
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
              勾选技能后，该数字员工将根据用户输入自动匹配并调用对应技能：
            </div>
            <Checkbox.Group
              value={selectedSkillIds}
              onChange={(vals) => setSelectedSkillIds(vals as string[])}
              style={{ width: '100%' }}
            >
              <Row gutter={[12, 12]}>
                {skills.map((skill) => (
                  <Col span={12} key={skill.id}>
                    <Card
                      size="small"
                      hoverable
                      style={{
                        borderRadius: 8,
                        borderColor: selectedSkillIds.includes(skill.id) ? '#1677ff' : '#f0f0f0',
                        background: selectedSkillIds.includes(skill.id) ? '#f0f5ff' : '#fff',
                      }}
                    >
                      <Checkbox value={skill.id} style={{ width: '100%' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 500 }}>{skill.name}</span>
                            <Tag color={levelColor[skill.level]} style={{ fontSize: 10, color: skill.level === 'L3' || skill.level === 'L4' ? '#fff' : '#333' }}>
                              {skill.level}
                            </Tag>
                            <Tag style={{ fontSize: 10 }}>{skill.category}</Tag>
                          </div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{skill.description}</div>
                          <div style={{ fontSize: 11, color: '#1677ff', marginTop: 2 }}>来源：{skill.source}</div>
                        </div>
                      </Checkbox>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
            <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
              已选择 {selectedSkillIds.length} 项技能
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`技能详情 — ${selectedEmployee?.name}`}
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
            <div style={{ fontWeight: 500, marginBottom: 8 }}>已配置的技能：</div>
            <List
              size="small"
              dataSource={skills.filter((s) => selectedEmployee.skillIds.includes(s.id))}
              renderItem={(skill) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<ThunderboltOutlined style={{ color: '#1677ff' }} />}
                    title={<Space>{skill.name}<Tag color={levelColor[skill.level]} style={{ color: skill.level === 'L3' || skill.level === 'L4' ? '#fff' : '#333' }}>{skill.level}</Tag></Space>}
                    description={skill.description}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂未配置技能' }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default SkillConfig;
