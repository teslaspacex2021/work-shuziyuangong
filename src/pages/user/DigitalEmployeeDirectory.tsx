import React, { useState, useMemo } from 'react';
import {
  Input, Avatar, Tag, Card, Row, Col, Badge, Progress, Button, Empty, Descriptions, Tabs,
} from 'antd';
import {
  SearchOutlined, TeamOutlined,
  MessageOutlined, ThunderboltOutlined,
  ApartmentOutlined, DownOutlined, RightOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { digitalEmployees, skills, knowledgeBases, type DigitalEmployee } from '../../mock/data';

const statusColor: Record<string, string> = {
  ACTIVE: '#52c41a', TRAINING: '#1677ff', SUSPENDED: '#faad14', TERMINATED: '#ff4d4f',
};
const statusLabel: Record<string, string> = {
  ACTIVE: '在线', TRAINING: '训练中', SUSPENDED: '已暂停', TERMINATED: '已停用',
};

interface DeptNode {
  key: string;
  name: string;
  employees: DigitalEmployee[];
}

interface PositionNode {
  key: string;
  name: string;
  department: string;
  employees: DigitalEmployee[];
}

const DigitalEmployeeDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [treeTab, setTreeTab] = useState<'dept' | 'position'>('dept');
  const [showAll, setShowAll] = useState(false);

  const departments: DeptNode[] = useMemo(() => {
    const deptMap = new Map<string, DigitalEmployee[]>();
    digitalEmployees.forEach((emp) => {
      if (!deptMap.has(emp.department)) deptMap.set(emp.department, []);
      deptMap.get(emp.department)!.push(emp);
    });
    return Array.from(deptMap.entries()).map(([name, employees]) => ({
      key: `dept-${name}`,
      name,
      employees,
    }));
  }, []);

  const positionNodes: PositionNode[] = useMemo(() => {
    const posMap = new Map<string, DigitalEmployee[]>();
    digitalEmployees.forEach((emp) => {
      if (!posMap.has(emp.position)) posMap.set(emp.position, []);
      posMap.get(emp.position)!.push(emp);
    });
    return Array.from(posMap.entries()).map(([name, employees]) => ({
      key: `pos-${name}`,
      name,
      department: employees[0]?.department || '',
      employees,
    }));
  }, []);

  const filteredDepts = useMemo(() => {
    if (!searchText) return departments;
    return departments.map((dept) => ({
      ...dept,
      employees: dept.employees.filter(
        (e) => e.name.includes(searchText) || e.position.includes(searchText) || e.department.includes(searchText)
      ),
    })).filter((dept) => dept.name.includes(searchText) || dept.employees.length > 0);
  }, [departments, searchText]);

  const filteredPositions = useMemo(() => {
    if (!searchText) return positionNodes;
    return positionNodes.map((pos) => ({
      ...pos,
      employees: pos.employees.filter(
        (e) => e.name.includes(searchText) || e.position.includes(searchText)
      ),
    })).filter((pos) => pos.name.includes(searchText) || pos.employees.length > 0);
  }, [positionNodes, searchText]);

  const initExpanded = useMemo(() => {
    if (expandedDepts.size === 0) {
      return new Set([...departments.map((d) => d.key), ...positionNodes.map((p) => p.key)]);
    }
    return expandedDepts;
  }, [expandedDepts, departments, positionNodes]);

  const toggleDept = (deptKey: string) => {
    const next = new Set(initExpanded);
    if (next.has(deptKey)) next.delete(deptKey);
    else next.add(deptKey);
    setExpandedDepts(next);
  };

  const handleSelectDept = (deptKey: string) => {
    setSelectedKey(deptKey);
    setShowAll(false);
  };

  const handleSelectEmployee = (empId: string) => {
    setSelectedKey(empId);
    setShowAll(false);
  };

  const handleShowAll = () => {
    setShowAll(true);
    setSelectedKey('');
  };

  const isEmployeeSelected = selectedKey.startsWith('DE-');
  const isDeptSelected = selectedKey.startsWith('dept-');
  const isPosSelected = selectedKey.startsWith('pos-');

  const selectedEmployee = useMemo(() => {
    if (!isEmployeeSelected) return null;
    return digitalEmployees.find((e) => e.id === selectedKey) || null;
  }, [isEmployeeSelected, selectedKey]);

  const deptEmployees = useMemo(() => {
    if (isDeptSelected) {
      const dept = departments.find((d) => d.key === selectedKey);
      return dept ? dept.employees : [];
    }
    if (isPosSelected) {
      const pos = positionNodes.find((p) => p.key === selectedKey);
      return pos ? pos.employees : [];
    }
    return [];
  }, [isDeptSelected, isPosSelected, selectedKey, departments, positionNodes]);

  const selectedGroupName = useMemo(() => {
    if (isDeptSelected) {
      const dept = departments.find((d) => d.key === selectedKey);
      return dept ? dept.name : '';
    }
    if (isPosSelected) {
      const pos = positionNodes.find((p) => p.key === selectedKey);
      return pos ? pos.name : '';
    }
    return '';
  }, [isDeptSelected, isPosSelected, selectedKey, departments, positionNodes]);

  const renderEmployeeCard = (emp: DigitalEmployee) => (
    <Col xs={24} sm={12} xl={8} key={emp.id}>
      <Card hoverable style={{ borderRadius: 12, height: '100%' }} styles={{ body: { padding: 20 } }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <Badge dot color={statusColor[emp.status]} offset={[-4, 36]}>
            <Avatar size={44} src={emp.avatar} />
          </Badge>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{emp.name}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              {emp.position} · <span style={{ color: statusColor[emp.status] }}>{statusLabel[emp.status]}</span>
            </div>
          </div>
        </div>
        <p style={{
          fontSize: 13, color: '#666', lineHeight: 1.6, margin: '8px 0 12px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{emp.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {emp.skills.slice(0, 3).map((s) => (
            <Tag key={s} style={{ borderRadius: 4, fontSize: 11, margin: 0 }} color="blue">{s}</Tag>
          ))}
          {emp.skills.length > 3 && <Tag style={{ borderRadius: 4, fontSize: 11, margin: 0 }}>+{emp.skills.length - 3}</Tag>}
        </div>
        <Button type="primary" icon={<MessageOutlined />} block style={{ borderRadius: 8 }}
          onClick={() => navigate(`/user/chat?employeeId=${emp.id}`)}>
          发起对话
        </Button>
      </Card>
    </Col>
  );

  const renderEmployeeDetail = (emp: DigitalEmployee) => {
    const empSkillList = skills.filter((s) => emp.skillIds.includes(s.id));
    const empKnowledge = knowledgeBases.filter((kb) => emp.knowledgeIds.includes(kb.id));
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Badge dot color={statusColor[emp.status]} offset={[-6, 56]}>
            <Avatar size={64} src={emp.avatar} />
          </Badge>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>{emp.name}</div>
          <div style={{ color: '#999', fontSize: 13, marginTop: 4 }}>{emp.department} · {emp.position}</div>
          <Tag color={statusColor[emp.status]} style={{ marginTop: 8 }}>{statusLabel[emp.status]}</Tag>
        </div>
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{emp.description}</p>
        </Card>
        <Card title="基本信息" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="工号">{emp.id}</Descriptions.Item>
            <Descriptions.Item label="部门">{emp.department}</Descriptions.Item>
            <Descriptions.Item label="岗位">{emp.position}</Descriptions.Item>
            <Descriptions.Item label="职级"><Tag color="blue">{emp.level}</Tag></Descriptions.Item>
            <Descriptions.Item label="归属人">{emp.owner} ({emp.ownerType})</Descriptions.Item>
            <Descriptions.Item label="入职日期">{emp.onboardDate}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="Tokens 使用" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
          <Progress
            percent={Math.round((emp.tokensUsed / emp.tokensQuota) * 100)}
            status={emp.tokensUsed / emp.tokensQuota > 0.8 ? 'exception' : 'active'}
          />
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            {(emp.tokensUsed / 1000000).toFixed(1)}M / {(emp.tokensQuota / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            任务完成率：<span style={{ color: '#1677ff', fontWeight: 500 }}>{emp.taskCompleteRate}%</span>
          </div>
        </Card>
        <Card title="技能" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {emp.skills.map((s) => <Tag key={s} color="blue">{s}</Tag>)}
          </div>
          {empSkillList.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {empSkillList.map((sk) => (
                <div key={sk.id} style={{ padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    <ThunderboltOutlined style={{ color: '#1677ff', marginRight: 4 }} />
                    {sk.name} <Tag color="blue" style={{ fontSize: 10, marginLeft: 4 }}>{sk.level}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{sk.description}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="知识库" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
          {empKnowledge.length > 0 ? empKnowledge.map((kb) => (
            <div key={kb.id} style={{ padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{kb.name}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                {kb.description} · <span style={{ color: '#1677ff' }}>{kb.docCount} 篇</span>
              </div>
            </div>
          )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无关联知识" />}
        </Card>
        <Button type="primary" icon={<MessageOutlined />} size="large" block style={{ borderRadius: 8 }}
          onClick={() => navigate(`/user/chat?employeeId=${emp.id}`)}>
          发起对话
        </Button>
      </div>
    );
  };

  const renderTreeDept = () => (
    <div>
      <div
        style={{ padding: '8px 16px', fontWeight: 600, fontSize: 14, color: '#333', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        onClick={handleShowAll}
      >
        <TeamOutlined style={{ color: '#1677ff' }} />
        天翼云数字员工
        <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>({digitalEmployees.length})</span>
      </div>

      {filteredDepts.map((dept) => {
        const isExpanded = initExpanded.has(dept.key);
        const isDeptSel = selectedKey === dept.key;
        return (
          <div key={dept.key}>
            <div
              role="button"
              tabIndex={0}
              style={{
                padding: '8px 16px 8px 24px', display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', background: isDeptSel ? '#e6f4ff' : 'transparent',
                borderRight: isDeptSel ? '3px solid #1677ff' : '3px solid transparent',
                transition: 'background 0.2s',
              }}
              onClick={() => handleSelectDept(dept.key)}
              onMouseEnter={(e) => { if (!isDeptSel) e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={(e) => { if (!isDeptSel) e.currentTarget.style.background = 'transparent'; }}
            >
              <span
                onClick={(e) => { e.stopPropagation(); toggleDept(dept.key); }}
                style={{ fontSize: 10, color: '#999', width: 16, textAlign: 'center' }}
              >
                {isExpanded ? <DownOutlined /> : <RightOutlined />}
              </span>
              <TeamOutlined style={{ color: '#666', fontSize: 14 }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{dept.name}</span>
              <span style={{ fontSize: 11, color: '#bbb' }}>{dept.employees.length}</span>
            </div>

            {isExpanded && dept.employees.map((emp) => {
              const isEmpSel = selectedKey === emp.id;
              return (
                <div
                  key={emp.id}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: '6px 16px 6px 56px', display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', background: isEmpSel ? '#e6f4ff' : 'transparent',
                    borderRight: isEmpSel ? '3px solid #1677ff' : '3px solid transparent',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handleSelectEmployee(emp.id)}
                  onMouseEnter={(e) => { if (!isEmpSel) e.currentTarget.style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { if (!isEmpSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Badge dot color={statusColor[emp.status]} offset={[-2, 20]}>
                    <Avatar size={24} src={emp.avatar} />
                  </Badge>
                  <span style={{ fontSize: 13, color: '#333' }}>{emp.name}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  const renderTreePosition = () => (
    <div>
      {filteredPositions.map((pos) => {
        const isExpanded = initExpanded.has(pos.key);
        const isPosSel = selectedKey === pos.key;
        return (
          <div key={pos.key}>
            <div
              role="button"
              tabIndex={0}
              style={{
                padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', background: isPosSel ? '#e6f4ff' : 'transparent',
                borderRight: isPosSel ? '3px solid #1677ff' : '3px solid transparent',
                transition: 'background 0.2s',
              }}
              onClick={() => { setSelectedKey(pos.key); setShowAll(false); }}
              onMouseEnter={(e) => { if (!isPosSel) e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={(e) => { if (!isPosSel) e.currentTarget.style.background = 'transparent'; }}
            >
              <span
                onClick={(e) => { e.stopPropagation(); toggleDept(pos.key); }}
                style={{ fontSize: 10, color: '#999', width: 16, textAlign: 'center' }}
              >
                {isExpanded ? <DownOutlined /> : <RightOutlined />}
              </span>
              <AppstoreOutlined style={{ color: '#666', fontSize: 14 }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{pos.name}</span>
              <Tag style={{ fontSize: 10, margin: 0 }}>{pos.department}</Tag>
              <span style={{ fontSize: 11, color: '#bbb' }}>{pos.employees.length}</span>
            </div>

            {isExpanded && pos.employees.map((emp) => {
              const isEmpSel = selectedKey === emp.id;
              return (
                <div
                  key={emp.id}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: '6px 16px 6px 48px', display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', background: isEmpSel ? '#e6f4ff' : 'transparent',
                    borderRight: isEmpSel ? '3px solid #1677ff' : '3px solid transparent',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handleSelectEmployee(emp.id)}
                  onMouseEnter={(e) => { if (!isEmpSel) e.currentTarget.style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { if (!isEmpSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Badge dot color={statusColor[emp.status]} offset={[-2, 20]}>
                    <Avatar size={24} src={emp.avatar} />
                  </Badge>
                  <span style={{ fontSize: 13, color: '#333' }}>{emp.name}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: '#f5f5f5' }}>
      {/* Left Tree Panel */}
      <div style={{
        width: 300, background: '#fff', borderRight: '1px solid #f0f0f0',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '20px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <ApartmentOutlined style={{ fontSize: 18, color: '#1677ff' }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>组织架构</span>
          </div>
          <Input
            placeholder="搜索部门/岗位/员工..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ borderRadius: 8 }}
          />
        </div>
        <Tabs
          activeKey={treeTab}
          onChange={(k) => setTreeTab(k as 'dept' | 'position')}
          centered
          size="small"
          style={{ padding: '0 16px' }}
          items={[
            { key: 'dept', label: <span><TeamOutlined /> 按部门</span> },
            { key: 'position', label: <span><AppstoreOutlined /> 按岗位</span> },
          ]}
        />
        <div style={{ borderTop: '1px solid #f0f0f0' }} />
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {treeTab === 'dept' ? renderTreeDept() : renderTreePosition()}
        </div>
      </div>

      {/* Right Content Panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {showAll && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>全部数字员工</h2>
              <p style={{ margin: 0, color: '#999', fontSize: 13 }}>共 {digitalEmployees.length} 名数字员工</p>
            </div>
            <Row gutter={[16, 16]}>{digitalEmployees.map(renderEmployeeCard)}</Row>
          </div>
        )}

        {!showAll && !selectedKey && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>数字员工通讯录</h2>
              <p style={{ margin: 0, color: '#999', fontSize: 13 }}>按组织架构查看数字员工，点击发起对话</p>
            </div>
            <Empty
              image={<ApartmentOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description={<span style={{ color: '#999' }}>请从左侧组织架构树选择部门或数字员工</span>}
              style={{ marginTop: 80 }}
            />
          </div>
        )}

        {!showAll && (isDeptSelected || isPosSelected) && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>{selectedGroupName}</h2>
              <p style={{ margin: 0, color: '#999', fontSize: 13 }}>共 {deptEmployees.length} 名数字员工</p>
            </div>
            {deptEmployees.length > 0 ? (
              <Row gutter={[16, 16]}>{deptEmployees.map(renderEmployeeCard)}</Row>
            ) : (
              <Empty description="该分组暂无数字员工" />
            )}
          </div>
        )}

        {!showAll && isEmployeeSelected && selectedEmployee && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>员工详情</h2>
              <p style={{ margin: 0, color: '#999', fontSize: 13 }}>查看数字员工详细信息</p>
            </div>
            {renderEmployeeDetail(selectedEmployee)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalEmployeeDirectory;
