import React, { useState, useMemo } from 'react';
import {
  Input, Avatar, Tag, Card, Row, Col, Empty, Rate,
} from 'antd';
import {
  SearchOutlined, ThunderboltOutlined,
  MessageOutlined, UserOutlined,
} from '@ant-design/icons';

const mockAgents = [
  { id: 'a1', name: '个人助手', desc: '智能个人助手，帮助处理日常工作事务、日程管理、邮件处理等。', tags: ['日程管理', '邮件处理', '工作汇报'], users: 1560, sessions: 42, tokens: 8900, rating: 4.5 },
  { id: 'a2', name: '人岗匹配', desc: '智能人才匹配引擎，基于岗位需求自动推荐最佳候选人。', tags: ['人才推荐', '岗位分析', '简历筛选'], users: 890, sessions: 28, tokens: 5600, rating: 4.2 },
  { id: 'a3', name: '营销智能体', desc: '营销策略生成与优化助手，提供内容创作、用户画像分析。', tags: ['内容创作', '用户画像', '营销策略'], users: 2100, sessions: 55, tokens: 12000, rating: 4.7 },
  { id: 'a4', name: '翼达（商机挖掘）', desc: 'AI驱动的商机挖掘助手，精准定位潜在客户和商业机会。', tags: ['商机挖掘', '客户分析', '商品追踪'], users: 780, sessions: 19, tokens: 4200, rating: 4.3 },
  { id: 'a5', name: '智能客服助手', desc: '7×24全天候客服机器人，高效处理客户咨询和投诉。', tags: ['客户咨询', '工单处理', '满意度分析'], users: 3200, sessions: 120, tokens: 25000, rating: 4.8 },
  { id: 'a6', name: '数据分析师', desc: '自动化数据分析工具，生成可视化报表和业务洞察。', tags: ['数据可视化', '报表生成', '趋势分析'], users: 1350, sessions: 35, tokens: 7800, rating: 4.4 },
];

const AgentHub: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const filteredAgents = useMemo(() => {
    if (!searchText) return mockAgents;
    return mockAgents.filter((a) => a.name.includes(searchText) || a.desc.includes(searchText));
  }, [searchText]);

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
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>智能体中心</h2>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        选择一个智能体开始协作，提升工作效率。
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索智能体名称、描述..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 280, borderRadius: 8 }}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        {filteredAgents.map(renderAgentCard)}
        {filteredAgents.length === 0 && (
          <Col span={24}><Empty description="暂无匹配的智能体" /></Col>
        )}
      </Row>
    </div>
  );
};

export default AgentHub;
