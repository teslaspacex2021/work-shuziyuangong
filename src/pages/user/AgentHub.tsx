import React, { useState, useMemo } from 'react';
import {
  Input, Avatar, Tag, Card, Row, Col, Badge, Empty,
  Tabs, Select, Tooltip, Rate,
} from 'antd';
import {
  SearchOutlined, ThunderboltOutlined, StarOutlined, StarFilled,
  MessageOutlined, UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { digitalEmployees, type DigitalEmployee } from '../../mock/data';

const statusColor: Record<string, string> = {
  ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
};
const statusLabel: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};

const mockAgents = [
  { id: 'a1', name: '个人助手', desc: '智能个人助手，帮助处理日常工作事务、日程管理、邮件处理等。', tags: ['日程管理', '邮件处理', '工作汇报'], users: 1560, sessions: 42, tokens: 8900, rating: 4.5 },
  { id: 'a2', name: '人岗匹配', desc: '智能人才匹配引擎，基于岗位需求自动推荐最佳候选人。', tags: ['人才推荐', '岗位分析', '简历筛选'], users: 890, sessions: 28, tokens: 5600, rating: 4.2 },
  { id: 'a3', name: '营销智能体', desc: '营销策略生成与优化助手，提供内容创作、用户画像分析。', tags: ['内容创作', '用户画像', '营销策略'], users: 2100, sessions: 55, tokens: 12000, rating: 4.7 },
  { id: 'a4', name: '翼达（商机挖掘）', desc: 'AI驱动的商机挖掘助手，精准定位潜在客户和商业机会。', tags: ['商机挖掘', '客户分析', '商品追踪'], users: 780, sessions: 19, tokens: 4200, rating: 4.3 },
  { id: 'a5', name: '智能客服助手', desc: '7×24全天候客服机器人，高效处理客户咨询和投诉。', tags: ['客户咨询', '工单处理', '满意度分析'], users: 3200, sessions: 120, tokens: 25000, rating: 4.8 },
  { id: 'a6', name: '数据分析师', desc: '自动化数据分析工具，生成可视化报表和业务洞察。', tags: ['数据可视化', '报表生成', '趋势分析'], users: 1350, sessions: 35, tokens: 7800, rating: 4.4 },
];

const AgentHub: React.FC = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('agents');
  const [searchText, setSearchText] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('全部部门');
  const [subTab, setSubTab] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['DE-001', 'DE-004']));

  const deptOptions = useMemo(() => {
    const depts = new Set(digitalEmployees.map((e) => e.department));
    return ['全部部门', ...Array.from(depts)];
  }, []);

  const filteredEmployees = useMemo(() => {
    let list = [...digitalEmployees];
    if (searchText) {
      list = list.filter((e) => e.name.includes(searchText) || e.position.includes(searchText) || e.department.includes(searchText));
    }
    if (deptFilter !== '全部部门') {
      list = list.filter((e) => e.department === deptFilter);
    }
    if (subTab === 'hot') {
      list = list.sort((a, b) => b.tokensUsed - a.tokensUsed);
    }
    if (subTab === 'favorites') {
      list = list.filter((e) => favorites.has(e.id));
    }
    return list;
  }, [searchText, deptFilter, subTab, favorites]);

  const filteredAgents = useMemo(() => {
    if (!searchText) return mockAgents;
    return mockAgents.filter((a) => a.name.includes(searchText) || a.desc.includes(searchText));
  }, [searchText]);

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderEmployeeCard = (emp: DigitalEmployee) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={emp.id}>
      <Card
        hoverable
        style={{ borderRadius: 12, height: '100%' }}
        styles={{ body: { padding: '20px 16px 16px' } }}
        onClick={() => navigate(`/user/chat?employeeId=${emp.id}`)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <Badge dot color={statusColor[emp.status]} offset={[-4, 36]}>
            <Avatar size={44} style={{ background: emp.status === 'ACTIVE' ? '#1677ff' : '#722ed1', fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
              {emp.avatar}
            </Avatar>
          </Badge>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{emp.name}</span>
              <Tooltip title={favorites.has(emp.id) ? '取消收藏' : '收藏'}>
                {favorites.has(emp.id) ? (
                  <StarFilled style={{ color: '#faad14', cursor: 'pointer' }} onClick={(e) => toggleFav(emp.id, e)} />
                ) : (
                  <StarOutlined style={{ color: '#d9d9d9', cursor: 'pointer' }} onClick={(e) => toggleFav(emp.id, e)} />
                )}
              </Tooltip>
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>{emp.department} · {emp.position}</div>
          </div>
          <Tag color={statusColor[emp.status]} style={{ fontSize: 11, flexShrink: 0 }}>{statusLabel[emp.status]}</Tag>
        </div>

        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: '0 0 12px', height: 42, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {emp.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {emp.skills.slice(0, 3).map((s) => (
            <Tag key={s} color="blue" style={{ fontSize: 11, margin: 0 }}>{s}</Tag>
          ))}
          {emp.skills.length > 3 && <Tag style={{ fontSize: 11, margin: 0 }}>+{emp.skills.length - 3}</Tag>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 10, fontSize: 12, color: '#999' }}>
          <span><UserOutlined /> {Math.floor(emp.tokensUsed / 10000)}</span>
          <span><MessageOutlined /> {Math.floor(emp.tokensUsed / 50000)}</span>
          <span>完成率 {emp.taskCompleteRate}%</span>
          <span><ThunderboltOutlined style={{ color: '#fa8c16' }} /> {(emp.tokensUsed / 10000).toFixed(0)}万</span>
        </div>
      </Card>
    </Col>
  );

  const renderAgentCard = (agent: typeof mockAgents[0]) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={agent.id}>
      <Card
        hoverable
        style={{ borderRadius: 12, height: '100%' }}
        styles={{ body: { padding: '20px 16px 16px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <Avatar size={44} style={{ background: '#722ed1', fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
            {agent.name.charAt(0)}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{agent.name}</span>
            <div style={{ marginTop: 2 }}><Rate disabled defaultValue={agent.rating} allowHalf style={{ fontSize: 12 }} /></div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: '0 0 12px', height: 42, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {agent.desc}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {agent.tags.map((t) => <Tag key={t} style={{ fontSize: 11, margin: 0 }}>{t}</Tag>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 10, fontSize: 12, color: '#999' }}>
          <span><UserOutlined /> {agent.users}</span>
          <span><MessageOutlined /> {agent.sessions}</span>
          <span><ThunderboltOutlined style={{ color: '#fa8c16' }} /> {agent.tokens}</span>
        </div>
      </Card>
    </Col>
  );

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
        {mainTab === 'agents' ? '智能体中心' : 'AI 数字员工'}
      </h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        {mainTab === 'agents'
          ? '选择一个智能体开始协作，提升工作效率。'
          : '选择一个数字员工开始协作，他们将根据您的问题自动调用合适的技能和知识来高效处理任务'}
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索数字员工名称、岗位..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 280, borderRadius: 8 }}
        />
        {mainTab === 'employees' && (
          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            style={{ width: 160 }}
            options={deptOptions.map((d) => ({ label: d, value: d }))}
          />
        )}
      </div>

      <Tabs
        activeKey={mainTab}
        onChange={(k) => { setMainTab(k); setSearchText(''); }}
        items={[
          {
            key: 'agents',
            label: '智能体',
            children: (
              <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                {filteredAgents.map(renderAgentCard)}
                {filteredAgents.length === 0 && (
                  <Col span={24}><Empty description="暂无匹配的智能体" /></Col>
                )}
              </Row>
            ),
          },
          {
            key: 'employees',
            label: `数字员工 (${digitalEmployees.length})`,
            children: (
              <>
                <Tabs
                  activeKey={subTab}
                  onChange={setSubTab}
                  size="small"
                  style={{ marginBottom: 8 }}
                  items={[
                    { key: 'all', label: `全部 (${digitalEmployees.length})` },
                    { key: 'hot', label: '热门排行' },
                    { key: 'favorites', label: `我的收藏 (${favorites.size})` },
                  ]}
                />
                <Row gutter={[16, 16]}>
                  {filteredEmployees.map(renderEmployeeCard)}
                  {filteredEmployees.length === 0 && (
                    <Col span={24}><Empty description="暂无匹配的数字员工" /></Col>
                  )}
                </Row>
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AgentHub;
