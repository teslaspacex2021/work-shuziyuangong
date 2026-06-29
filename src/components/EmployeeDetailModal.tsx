import React from 'react';
import { Modal, Avatar, Tag, Button } from 'antd';
import { CloseOutlined, RightOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { PlazaExpert } from '../mock/data';

interface EmployeeDetailModalProps {
  open: boolean;
  expert: PlazaExpert | null;
  onClose: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const formatUsageCount = (heat: number) => {
  const count = heat * 100;
  if (count >= 10000) return `${(count / 10000).toFixed(2)}万次使用`;
  return `${count}次使用`;
};

const buildExamplePrompts = (expert: PlazaExpert): string[] => {
  const prompts: string[] = [];
  if (expert.tags.length > 0) {
    prompts.push(`请帮我处理${expert.tags[0]}相关的工作`);
  }
  if (expert.tags.length > 1) {
    prompts.push(`我想了解你在${expert.tags[1]}方面的能力`);
  }
  prompts.push(`介绍一下你的主要职责和能力`);
  return prompts.slice(0, 3);
};

const getSlogan = (expert: PlazaExpert) => {
  if (expert.kind === 'employee' && expert.employee?.responsibility) {
    const text = expert.employee.responsibility;
    return text.slice(0, 24) + (text.length > 24 ? '…' : '');
  }
  if (expert.description.length > 24) {
    return expert.description.slice(0, 24) + '…';
  }
  return expert.description;
};

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  open,
  expert,
  onClose,
  isFavorited = false,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();

  if (!expert) return null;

  const examplePrompts = buildExamplePrompts(expert);
  const slogan = getSlogan(expert);
  const isAgent = expert.kind === 'agent';

  const handleToggleFavorite = () => {
    onToggleFavorite?.(expert.id);
  };

  const handleSummon = () => {
    onClose();
    if (expert.employee) {
      navigate(`/digital-employee/chat?employeeId=${expert.id}`);
    } else {
      navigate('/digital-employee/chat');
    }
  };

  const handlePromptClick = (prompt: string) => {
    onClose();
    if (expert.employee) {
      navigate(`/digital-employee/chat?employeeId=${expert.id}&msg=${encodeURIComponent(prompt)}`);
    } else {
      navigate(`/digital-employee/chat?msg=${encodeURIComponent(prompt)}`);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      closable={false}
      style={{ borderRadius: 16, overflow: 'hidden' }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 2,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorited ? '取消收藏' : '收藏'}
          style={{
            height: 32,
            padding: '0 12px',
            border: 'none',
            borderRadius: 16,
            background: isFavorited ? '#fff7e6' : 'rgba(0,0,0,0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: isFavorited ? '#faad14' : '#8c8c8c',
            fontSize: 13,
            fontWeight: isFavorited ? 600 : 400,
          }}
        >
          {isFavorited ? <StarFilled /> : <StarOutlined />}
          {isFavorited ? '已收藏' : '收藏'}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          style={{
            width: 32,
            height: 32,
            border: 'none',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8c8c8c',
          }}
        >
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
      </div>

      <div style={{ padding: '32px 32px 24px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {expert.avatar ? (
            <Avatar
              size={72}
              src={expert.avatar}
              style={{
                flexShrink: 0,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                border: '2px solid #fff',
              }}
            />
          ) : (
            <Avatar
              size={72}
              style={{
                flexShrink: 0,
                background: expert.avatarColor || '#722ed1',
                fontSize: 28,
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                border: '2px solid #fff',
              }}
            >
              {expert.name.charAt(0)}
            </Avatar>
          )}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
              {expert.name}
            </h2>
            <p style={{ margin: '0 0 10px', fontSize: 14, color: '#8c8c8c', lineHeight: 1.5 }}>
              {slogan}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              <Tag style={{
                margin: 0, borderRadius: 4, background: '#f5f5f5',
                color: '#595959', border: 'none', fontSize: 12,
              }}>
                {isAgent ? '智能体' : '专家'}
              </Tag>
              <Tag style={{
                margin: 0, borderRadius: 4, background: '#f5f5f5',
                color: '#595959', border: 'none', fontSize: 12,
              }}>
                {expert.businessLine}
              </Tag>
            </div>
            <span style={{ fontSize: 13, color: '#bfbfbf' }}>
              {formatUsageCount(expert.heat)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 24px' }}>
        <section style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
            能力介绍
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#595959', lineHeight: 1.8 }}>
            {expert.description}
          </p>
          {isAgent && (
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#bfbfbf' }}>
              发布部门：{expert.department}
            </p>
          )}
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
            擅长领域
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {expert.tags.slice(0, 6).map((tag) => (
              <Tag
                key={tag}
                style={{
                  margin: 0,
                  padding: '4px 12px',
                  borderRadius: 6,
                  background: '#fafafa',
                  color: '#595959',
                  border: '1px solid #f0f0f0',
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {tag}
                {isAgent && (
                  <span style={{
                    fontSize: 10,
                    lineHeight: '16px',
                    padding: '0 5px',
                    borderRadius: 3,
                    background: '#f0f5ff',
                    color: '#1677ff',
                    fontWeight: 600,
                  }}>
                    Skill
                  </span>
                )}
              </Tag>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
            试试这样问我
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #f0f0f0',
                  background: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d9d9d9';
                  e.currentTarget.style.background = '#fafafa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <span style={{ fontSize: 14, color: '#434343', flex: 1 }}>{prompt}</span>
                <RightOutlined style={{ fontSize: 12, color: '#bfbfbf', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <div style={{ padding: '16px 32px 28px' }}>
        <Button
          type="primary"
          block
          size="large"
          onClick={handleSummon}
          style={{
            height: 48,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            background: '#1a1a1a',
            borderColor: '#1a1a1a',
          }}
        >
          召唤 {expert.name}
        </Button>
      </div>
    </Modal>
  );
};

export default EmployeeDetailModal;
