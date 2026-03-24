import React, { useState, useMemo } from 'react';
import {
  Input, Avatar, Tag, Card, Row, Col, Badge, Select, Empty,
  Button, Segmented, Tooltip, Drawer, Descriptions, Progress, Rate,
} from 'antd';
import {
  SearchOutlined, ThunderboltOutlined, StarOutlined, StarFilled,
  MessageOutlined, UserOutlined, FilterOutlined,
  TeamOutlined, FireOutlined,
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
  L1: '#8c8c8c', L2: '#2f54eb', L3: '#1677ff', L4: '#13c2c2',
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

  const openDetail = (emp: DigitalEmployee) => {
    setSelectedEmployee(emp);
    setDetailOpen(true);
  };

  const startChat = (empId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/digital-employee/chat?employeeId=${empId}`);
  };

  const activeCount = digitalEmployees.filter((e) => e.status === 'ACTIVE').length;

  const renderEmployeeCard = (emp: DigitalEmployee) => {
    const rating = Math.min(5, Math.max(0, (emp.likes / (emp.likes + emp.dislikes + 1)) * 5));
    const isHovered = hoveredCard === emp.id;
    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={emp.id}>
        <div
          style={{ position: 'relative', height: '100%' }}
          onMouseEnter={() => setHoveredCard(emp.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card
            hoverable
            style={{
              borderRadius: 16, height: '100%', overflow: 'hidden',
              border: isHovered ? '1px solid #91caff' : '1px solid #f0f0f0',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: isHovered
                ? '0 12px 32px rgba(22,119,255,0.12), 0 4px 12px rgba(0,0,0,0.06)'
                : '0 2px 8px rgba(0,0,0,0.04)',
            }}
            styles={{ body: { padding: 0 } }}
            onClick={() => openDetail(emp)}
          >
            <div style={{
              background: emp.status === 'ACTIVE'
                ? 'linear-gradient(135deg, #e8f4fd 0%, #f0f5ff 50%, #f6f9ff 100%)'
                : emp.status === 'TRAINING'
                  ? 'linear-gradient(135deg, #f3ecff 0%, #f9f5ff 50%, #fdf9ff 100%)'
                  : 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
              padding: '20px 20px 16px',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Badge dot color={statusColor[emp.status]} offset={[-4, 40]}>
                  <Avatar size={48} src={emp.avatar} style={{
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  }} />
                </Badge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 16, color: '#1a2332' }}>{emp.name}</span>
                    <Tag color={levelColor[emp.level]} style={{
                      fontSize: 10, borderRadius: 4, margin: 0, lineHeight: '18px',
                      color: '#fff',
                    }}>{emp.level} {levelLabel[emp.level]}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#5a6b7d', marginTop: 4 }}>
                    <EnvironmentOutlined style={{ marginRight: 4, color: '#91a7c0' }} />{emp.department}
                  </div>
                  <div style={{ fontSize: 12, color: '#5a6b7d', marginTop: 2 }}>
                    <IdcardOutlined style={{ marginRight: 4, color: '#91a7c0' }} />{emp.position}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Tooltip title={favorites.has(emp.id) ? '取消收藏' : '收藏'}>
                    {favorites.has(emp.id) ? (
                      <StarFilled style={{ color: '#faad14', cursor: 'pointer', fontSize: 18 }} onClick={(e) => toggleFav(emp.id, e)} />
                    ) : (
                      <StarOutlined style={{ color: '#c0c8d0', cursor: 'pointer', fontSize: 18 }} onClick={(e) => toggleFav(emp.id, e)} />
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
                fontSize: 13, color: '#5a6b7d', lineHeight: 1.7, margin: '0 0 12px',
                height: 44, overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>{emp.description}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {emp.skills.slice(0, 3).map((s) => (
                  <Tag key={s} style={{
                    fontSize: 11, margin: 0, borderRadius: 4,
                    background: '#eef3ff', color: '#3d6cd4', border: 'none',
                  }}>{s}</Tag>
                ))}
                {emp.skills.length > 3 && <Tag style={{
                  fontSize: 11, margin: 0, borderRadius: 4,
                  background: '#f5f5f5', color: '#8c8c8c', border: 'none',
                }}>+{emp.skills.length - 3}</Tag>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 12 }} />
                <span style={{ fontSize: 11, color: '#b0b8c4' }}>({emp.likes})</span>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: '1px solid #f0f3f6', paddingTop: 12, fontSize: 12, color: '#8c99a8',
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
              </div>
            </div>
          </Card>

          {/* Hover overlay with chat button */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(0deg, rgba(22,119,255,0.95) 0%, rgba(22,119,255,0.85) 60%, transparent 100%)',
            borderRadius: '0 0 16px 16px',
            padding: '40px 20px 16px',
            display: 'flex', justifyContent: 'center',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: isHovered ? 'auto' : 'none',
          }}>
            <Button
              type="primary"
              size="large"
              icon={<MessageOutlined />}
              onClick={(e) => startChat(emp.id, e)}
              style={{
                borderRadius: 24, padding: '0 32px', height: 40,
                background: '#fff', color: '#1677ff', border: 'none',
                fontWeight: 600, fontSize: 14,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              发起对话
            </Button>
          </div>
        </div>
      </Col>
    );
  };

  const renderListItem = (emp: DigitalEmployee) => (
    <Card
      key={emp.id}
      hoverable
      style={{
        borderRadius: 12, marginBottom: 12,
        border: '1px solid #f0f3f6',
        transition: 'all 0.25s ease',
      }}
      styles={{ body: { padding: '16px 20px' } }}
      onClick={() => openDetail(emp)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Badge dot color={statusColor[emp.status]} offset={[-4, 36]}>
          <Avatar size={48} src={emp.avatar} />
        </Badge>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#1a2332' }}>{emp.name}</span>
            <Tag color={statusColor[emp.status]} style={{ fontSize: 10 }}>{statusLabel[emp.status]}</Tag>
            <Tag color={levelColor[emp.level]} style={{
              fontSize: 10, color: '#fff',
            }}>{emp.level}</Tag>
          </div>
          <div style={{ fontSize: 12, color: '#5a6b7d', marginTop: 4 }}>
            {emp.department} · {emp.position} · 归属人：{emp.owner}
          </div>
          <div style={{ fontSize: 13, color: '#8c99a8', marginTop: 4 }}>{emp.description}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}>{emp.taskCompleteRate}%</div>
            <div style={{ fontSize: 11, color: '#b0b8c4' }}>完成率</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fa8c16' }}>{(emp.tokensUsed / 10000).toFixed(0)}万</div>
            <div style={{ fontSize: 11, color: '#b0b8c4' }}>Tokens</div>
          </div>
          <Button
            type="primary"
            icon={<MessageOutlined />}
            onClick={(e) => startChat(emp.id, e)}
            style={{ borderRadius: 8 }}
          >
            发起对话
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      {/* Hero header */}
      <div style={{
        marginBottom: 24,
        padding: '28px 32px',
        background: 'linear-gradient(135deg, #1a3a5c 0%, #1e4d7e 40%, #2064a2 100%)',
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -20, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: 120, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
        }} />
        <h2 style={{
          fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 10, position: 'relative',
        }}>
          <TeamOutlined />
          数字员工广场
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: 0, position: 'relative' }}>
          浏览和发现AI数字员工，查看员工能力档案，选择合适的数字员工开始协作
          <span style={{ marginLeft: 20 }}>
            <Badge color="#52c41a" text={<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>在线 {activeCount} 人</span>} />
            <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>共 {digitalEmployees.length} 名数字员工</span>
          </span>
        </p>
      </div>

      {/* Search & Filters */}
      <Card
        style={{ borderRadius: 12, marginBottom: 20, border: '1px solid #e8ecf1' }}
        styles={{ body: { padding: '14px 20px' } }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索数字员工名称、岗位、技能、部门..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 320, borderRadius: 8, borderColor: '#d9dfe6' }}
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
          <FilterOutlined style={{ color: '#b0b8c4' }} />
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

      <div style={{ marginBottom: 12, color: '#8c99a8', fontSize: 13 }}>
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

      {/* Employee Detail Drawer */}
      <Drawer
        title={null}
        placement="right"
        width={500}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {selectedEmployee && (() => {
          const emp = selectedEmployee;
          const empSkills = skills.filter((s) => emp.skillIds.includes(s.id));
          const empKBs = knowledgeBases.filter((kb) => emp.knowledgeIds.includes(kb.id));
          return (
            <div>
              {/* Detail Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1a3a5c 0%, #2064a2 100%)',
                padding: '32px 24px 24px',
                textAlign: 'center',
              }}>
                <Badge dot color={statusColor[emp.status]} offset={[-6, 60]}>
                  <Avatar size={72} src={emp.avatar} style={{
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    border: '3px solid rgba(255,255,255,0.3)',
                  }} />
                </Badge>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14, color: '#fff' }}>{emp.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 13 }}>
                  {emp.department} · {emp.position}
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 6 }}>
                  <Tag color={statusColor[emp.status]}>{statusLabel[emp.status]}</Tag>
                  <Tag color={levelColor[emp.level]} style={{ color: '#fff' }}>
                    {emp.level} {levelLabel[emp.level]}
                  </Tag>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<MessageOutlined />}
                  onClick={() => navigate(`/digital-employee/chat?employeeId=${emp.id}`)}
                  style={{
                    marginTop: 16, borderRadius: 24, padding: '0 36px', height: 42,
                    fontWeight: 600, background: '#fff', color: '#1677ff', border: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                >
                  发起对话
                </Button>
              </div>

              {/* Detail Body */}
              <div style={{ padding: '16px 24px 24px' }}>
                <Card size="small" style={{ borderRadius: 12, marginBottom: 16, background: '#f8fafc', border: 'none' }}>
                  <p style={{ fontSize: 13, color: '#5a6b7d', lineHeight: 1.8, margin: 0 }}>{emp.description}</p>
                </Card>

                <Card title="基本信息" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="工号"><span style={{ fontFamily: 'monospace' }}>{emp.id}</span></Descriptions.Item>
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
                    strokeColor={{ from: '#1677ff', to: '#4096ff' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8c99a8', marginTop: 4 }}>
                    <span>已用 {(emp.tokensUsed / 1000000).toFixed(1)}M</span>
                    <span>配额 {(emp.tokensQuota / 1000000).toFixed(1)}M</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#5a6b7d' }}>任务完成率：</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1677ff' }}>{emp.taskCompleteRate}%</span>
                  </div>
                </Card>

                <Card title="技能" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: empSkills.length > 0 ? 12 : 0 }}>
                    {emp.skills.map((s) => <Tag key={s} style={{ background: '#eef3ff', color: '#3d6cd4', border: 'none' }}>{s}</Tag>)}
                  </div>
                  {empSkills.map((sk) => (
                    <div key={sk.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ThunderboltOutlined style={{ color: '#1677ff' }} />
                        <span style={{ fontWeight: 500, color: '#1a2332' }}>{sk.name}</span>
                        <Tag color={levelColor[sk.level]} style={{ fontSize: 10, color: '#fff' }}>{sk.level}</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#8c99a8', marginTop: 2, paddingLeft: 20 }}>{sk.description}</div>
                    </div>
                  ))}
                </Card>

                <Card title="关联知识库" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                  {empKBs.length > 0 ? empKBs.map((kb) => (
                    <div key={kb.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ fontWeight: 500, color: '#1a2332' }}>{kb.name}</div>
                      <div style={{ fontSize: 12, color: '#8c99a8', marginTop: 2 }}>{kb.description} · {kb.docCount} 篇文档</div>
                    </div>
                  )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无关联知识" />}
                </Card>

                <Card title="关联智能体" size="small" style={{ borderRadius: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {emp.relatedAgents.map((a) => <Tag key={a} color="processing">{a}</Tag>)}
                  </div>
                </Card>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

export default EmployeePlaza;
