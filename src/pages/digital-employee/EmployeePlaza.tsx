import React, { useState, useMemo } from 'react';
import {
  Input, Avatar, Tag, Card, Row, Col, Badge, Select, Empty,
  Button, Segmented, Tooltip, Drawer, Descriptions, Progress, Rate,
} from 'antd';
import {
  SearchOutlined, ThunderboltOutlined, StarOutlined, StarFilled,
  MessageOutlined, UserOutlined, FilterOutlined,
  EyeOutlined, TeamOutlined, FireOutlined,
  IdcardOutlined, EnvironmentOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { digitalEmployees, skills, knowledgeBases, type DigitalEmployee } from '../../mock/data';

const statusColor: Record<string, string> = {
  ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
};
const statusLabel: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};
const levelLabel: Record<string, string> = {
  L1: '基础', L2: '进阶', L3: '专家', L4: '大师',
};
const levelColor: Record<string, string> = {
  L1: '#C0C0C0', L2: '#6B7B8D', L3: '#1677ff', L4: '#0A1929',
};

const EmployeePlaza: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [posFilter, setPosFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('热度优先');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['DE-2026001', 'DE-2026004']));
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [viewMode, setViewMode] = useState<string>('card');

  const deptOptions = useMemo(() => {
    const depts = new Set(digitalEmployees.map((e) => e.department));
    return [{ label: '全部部门', value: 'all' }, ...Array.from(depts).map((d) => ({ label: d, value: d }))];
  }, []);

  const posOptions = useMemo(() => {
    const positions = new Set(digitalEmployees.map((e) => e.position));
    return [{ label: '全部岗位', value: 'all' }, ...Array.from(positions).map((p) => ({ label: p, value: p }))];
  }, []);

  const filteredEmployees = useMemo(() => {
    let list = [...digitalEmployees];
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (deptFilter !== 'all') list = list.filter((e) => e.department === deptFilter);
    if (posFilter !== 'all') list = list.filter((e) => e.position === posFilter);
    if (statusFilter !== 'all') list = list.filter((e) => e.status === statusFilter);
    if (levelFilter !== 'all') list = list.filter((e) => e.level === levelFilter);

    switch (sortBy) {
      case '热度优先': list.sort((a, b) => b.heat - a.heat); break;
      case '完成率': list.sort((a, b) => b.taskCompleteRate - a.taskCompleteRate); break;
      case '最近活跃': break;
      case '好评度': list.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes)); break;
    }
    return list;
  }, [searchText, deptFilter, posFilter, statusFilter, levelFilter, sortBy]);

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openDetail = (emp: DigitalEmployee, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmployee(emp);
    setDetailOpen(true);
  };

  const startChat = (empId: string) => {
    navigate(`/digital-employee/chat?employeeId=${empId}`);
  };

  const activeCount = digitalEmployees.filter((e) => e.status === 'ACTIVE').length;

  const renderEmployeeCard = (emp: DigitalEmployee) => {
    const rating = Math.min(5, Math.max(0, (emp.likes / (emp.likes + emp.dislikes + 1)) * 5));
    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={emp.id}>
        <Card
          hoverable
          style={{ borderRadius: 16, height: '100%', overflow: 'hidden' }}
          styles={{ body: { padding: 0 } }}
          onClick={() => startChat(emp.id)}
        >
          <div style={{
            background: emp.status === 'ACTIVE'
              ? 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)'
              : emp.status === 'TRAINING'
                ? 'linear-gradient(135deg, #f9f0ff 0%, #faf5ff 100%)'
                : '#fafafa',
            padding: '20px 20px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Badge dot color={statusColor[emp.status]} offset={[-4, 40]}>
                <Avatar size={48} style={{
                  background: emp.status === 'ACTIVE' ? '#1677ff' : emp.status === 'TRAINING' ? '#722ed1' : '#999',
                  fontWeight: 600, fontSize: 18, flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>{emp.avatar}</Avatar>
              </Badge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{emp.name}</span>
                  <Tag color={levelColor[emp.level]} style={{
                    fontSize: 10, borderRadius: 4, margin: 0,
                    color: emp.level === 'L3' || emp.level === 'L4' ? '#fff' : '#333',
                  }}>{emp.level} {levelLabel[emp.level]}</Tag>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />{emp.department}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  <IdcardOutlined style={{ marginRight: 4 }} />{emp.position}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Tooltip title={favorites.has(emp.id) ? '取消收藏' : '收藏'}>
                  {favorites.has(emp.id) ? (
                    <StarFilled style={{ color: '#faad14', cursor: 'pointer', fontSize: 18 }} onClick={(e) => toggleFav(emp.id, e)} />
                  ) : (
                    <StarOutlined style={{ color: '#d9d9d9', cursor: 'pointer', fontSize: 18 }} onClick={(e) => toggleFav(emp.id, e)} />
                  )}
                </Tooltip>
                <Tag color={statusColor[emp.status]} style={{ fontSize: 10, margin: 0, textAlign: 'center' }}>
                  {statusLabel[emp.status]}
                </Tag>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 20px 16px' }}>
            <p style={{
              fontSize: 13, color: '#666', lineHeight: 1.6, margin: '0 0 12px',
              height: 42, overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>{emp.description}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {emp.skills.slice(0, 3).map((s) => (
                <Tag key={s} color="blue" style={{ fontSize: 11, margin: 0, borderRadius: 4 }}>{s}</Tag>
              ))}
              {emp.skills.length > 3 && <Tag style={{ fontSize: 11, margin: 0, borderRadius: 4 }}>+{emp.skills.length - 3}</Tag>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 12 }} />
              <span style={{ fontSize: 11, color: '#999' }}>({emp.likes})</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '1px solid #f0f0f0', paddingTop: 12, fontSize: 12, color: '#999',
            }}>
              <Tooltip title="使用人数">
                <span><UserOutlined /> {Math.floor(emp.heat / 10)}</span>
              </Tooltip>
              <Tooltip title="完成率">
                <span><TrophyOutlined style={{ color: '#52c41a' }} /> {emp.taskCompleteRate}%</span>
              </Tooltip>
              <Tooltip title="Token消耗">
                <span><ThunderboltOutlined style={{ color: '#fa8c16' }} /> {(emp.tokensUsed / 10000).toFixed(0)}万</span>
              </Tooltip>
              <Tooltip title="查看详情">
                <EyeOutlined style={{ cursor: 'pointer', color: '#1677ff' }} onClick={(e) => openDetail(emp, e)} />
              </Tooltip>
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  const renderListItem = (emp: DigitalEmployee) => (
    <Card
      key={emp.id}
      hoverable
      style={{ borderRadius: 12, marginBottom: 12 }}
      styles={{ body: { padding: '16px 20px' } }}
      onClick={() => startChat(emp.id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Badge dot color={statusColor[emp.status]} offset={[-4, 36]}>
          <Avatar size={48} style={{
            background: emp.status === 'ACTIVE' ? '#1677ff' : emp.status === 'TRAINING' ? '#722ed1' : '#999',
            fontWeight: 600, fontSize: 18,
          }}>{emp.avatar}</Avatar>
        </Badge>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{emp.name}</span>
            <Tag color={statusColor[emp.status]} style={{ fontSize: 10 }}>{statusLabel[emp.status]}</Tag>
            <Tag color={levelColor[emp.level]} style={{
              fontSize: 10, color: emp.level === 'L3' || emp.level === 'L4' ? '#fff' : '#333',
            }}>{emp.level}</Tag>
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {emp.department} · {emp.position} · 归属人：{emp.owner}
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{emp.description}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}>{emp.taskCompleteRate}%</div>
            <div style={{ fontSize: 11, color: '#999' }}>完成率</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fa8c16' }}>{(emp.tokensUsed / 10000).toFixed(0)}万</div>
            <div style={{ fontSize: 11, color: '#999' }}>Tokens</div>
          </div>
          <Button type="primary" icon={<MessageOutlined />} onClick={(e) => { e.stopPropagation(); startChat(emp.id); }}>
            发起对话
          </Button>
          <Button icon={<EyeOutlined />} onClick={(e) => openDetail(emp, e)}>详情</Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamOutlined style={{ color: '#1677ff' }} />
          数字员工广场
        </h2>
        <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
          浏览和发现AI数字员工，查看员工能力档案，选择合适的数字员工开始协作。
          <span style={{ marginLeft: 16, color: '#1677ff' }}>
            <Badge color="#52c41a" text={<span style={{ fontSize: 13 }}>在线 {activeCount} 人</span>} />
            <span style={{ margin: '0 12px', color: '#e0e0e0' }}>|</span>
            共 {digitalEmployees.length} 名数字员工
          </span>
        </p>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 20 }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索数字员工名称、岗位、技能、部门..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 320, borderRadius: 8 }}
            size="large"
          />
          <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 150 }} options={deptOptions} />
          <Select value={posFilter} onChange={setPosFilter} style={{ width: 160 }} options={posOptions} />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { label: '全部状态', value: 'all' },
              { label: '在线', value: 'ACTIVE' },
              { label: '训练中', value: 'TRAINING' },
              { label: '已暂停', value: 'SUSPENDED' },
            ]}
          />
          <Select
            value={levelFilter}
            onChange={setLevelFilter}
            style={{ width: 120 }}
            options={[
              { label: '全部职级', value: 'all' },
              { label: 'L1 基础', value: 'L1' },
              { label: 'L2 进阶', value: 'L2' },
              { label: 'L3 专家', value: 'L3' },
              { label: 'L4 大师', value: 'L4' },
            ]}
          />
          <div style={{ flex: 1 }} />
          <FilterOutlined style={{ color: '#999' }} />
          <Select value={sortBy} onChange={setSortBy} style={{ width: 120 }} options={[
            { label: '热度优先', value: '热度优先' },
            { label: '完成率', value: '完成率' },
            { label: '好评度', value: '好评度' },
            { label: '最近活跃', value: '最近活跃' },
          ]} />
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { label: '卡片', value: 'card' },
              { label: '列表', value: 'list' },
            ]}
          />
        </div>
      </Card>

      <div style={{ marginBottom: 12, color: '#999', fontSize: 13 }}>
        <FireOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
        找到 {filteredEmployees.length} 名数字员工
      </div>

      {viewMode === 'card' ? (
        <Row gutter={[16, 16]}>
          {filteredEmployees.map(renderEmployeeCard)}
          {filteredEmployees.length === 0 && (
            <Col span={24}><Empty description="暂无匹配的数字员工" style={{ padding: 60 }} /></Col>
          )}
        </Row>
      ) : (
        <div>
          {filteredEmployees.map(renderListItem)}
          {filteredEmployees.length === 0 && <Empty description="暂无匹配的数字员工" style={{ padding: 60 }} />}
        </div>
      )}

      <Drawer
        title="员工档案"
        placement="right"
        width={480}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        extra={
          selectedEmployee && (
            <Button type="primary" icon={<MessageOutlined />} onClick={() => startChat(selectedEmployee.id)}>
              发起对话
            </Button>
          )
        }
      >
        {selectedEmployee && (() => {
          const emp = selectedEmployee;
          const empSkills = skills.filter((s) => emp.skillIds.includes(s.id));
          const empKBs = knowledgeBases.filter((kb) => emp.knowledgeIds.includes(kb.id));
          return (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Badge dot color={statusColor[emp.status]} offset={[-6, 56]}>
                  <Avatar size={72} style={{
                    background: emp.status === 'ACTIVE' ? '#1677ff' : emp.status === 'TRAINING' ? '#722ed1' : '#999',
                    fontSize: 28, fontWeight: 600,
                  }}>{emp.avatar}</Avatar>
                </Badge>
                <div style={{ fontSize: 20, fontWeight: 600, marginTop: 12 }}>{emp.name}</div>
                <div style={{ color: '#666', marginTop: 4 }}>{emp.department} · {emp.position}</div>
                <div style={{ marginTop: 8 }}>
                  <Tag color={statusColor[emp.status]}>{statusLabel[emp.status]}</Tag>
                  <Tag color={levelColor[emp.level]} style={{ color: emp.level === 'L3' || emp.level === 'L4' ? '#fff' : '#333' }}>
                    {emp.level} {levelLabel[emp.level]}
                  </Tag>
                </div>
              </div>

              <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.8, margin: 0 }}>{emp.description}</p>
              </Card>

              <Card title="基本信息" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="工号">{emp.id}</Descriptions.Item>
                  <Descriptions.Item label="职级"><Tag color="blue">{emp.level}</Tag></Descriptions.Item>
                  <Descriptions.Item label="部门">{emp.department}</Descriptions.Item>
                  <Descriptions.Item label="岗位">{emp.position}</Descriptions.Item>
                  <Descriptions.Item label="归属人">{emp.owner}</Descriptions.Item>
                  <Descriptions.Item label="身份类型"><Tag color={emp.ownerType === '自有' ? 'blue' : 'orange'}>{emp.ownerType}</Tag></Descriptions.Item>
                  <Descriptions.Item label="入职日期">{emp.onboardDate}</Descriptions.Item>
                  <Descriptions.Item label="最近活跃">{emp.lastActive}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Tokens 使用情况" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                <Progress
                  percent={Math.round((emp.tokensUsed / emp.tokensQuota) * 100)}
                  status={emp.tokensUsed / emp.tokensQuota > 0.8 ? 'exception' : 'active'}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginTop: 4 }}>
                  <span>已用 {(emp.tokensUsed / 1000000).toFixed(1)}M</span>
                  <span>配额 {(emp.tokensQuota / 1000000).toFixed(1)}M</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>任务完成率：</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#1677ff' }}>{emp.taskCompleteRate}%</span>
                </div>
              </Card>

              <Card title="技能" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: empSkills.length > 0 ? 12 : 0 }}>
                  {emp.skills.map((s) => <Tag key={s} color="blue">{s}</Tag>)}
                </div>
                {empSkills.map((sk) => (
                  <div key={sk.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ThunderboltOutlined style={{ color: '#1677ff' }} />
                      <span style={{ fontWeight: 500 }}>{sk.name}</span>
                      <Tag color={levelColor[sk.level]} style={{ fontSize: 10, color: sk.level === 'L3' || sk.level === 'L4' ? '#fff' : '#333' }}>{sk.level}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2, paddingLeft: 20 }}>{sk.description}</div>
                  </div>
                ))}
              </Card>

              <Card title="关联知识库" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                {empKBs.length > 0 ? empKBs.map((kb) => (
                  <div key={kb.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ fontWeight: 500 }}>{kb.name}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{kb.description} · {kb.docCount} 篇文档</div>
                  </div>
                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无关联知识" />}
              </Card>

              <Card title="关联智能体" size="small" style={{ borderRadius: 12 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {emp.relatedAgents.map((a) => <Tag key={a} color="processing">{a}</Tag>)}
                </div>
              </Card>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

export default EmployeePlaza;
