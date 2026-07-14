import React, { useMemo, useState } from 'react';
import { Dropdown, message } from 'antd';
import {
  SendOutlined,
  DownOutlined,
  AppstoreOutlined,
  PlusOutlined,
  PaperClipOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import type { EmployeeFeatureFlags } from '../mock/data';
import { BRAND_PRIMARY } from '../theme/brand';
import AiToolPickerModal, { type AiToolPickerType } from './AiToolPickerModal';

export interface ChatInputComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  loading?: boolean;
  /** 未选员工时显示全部入口；已选员工时按开关显隐 */
  featureFlags?: EmployeeFeatureFlags | null;
  /** 未选员工时是否展示默认可点工具（欢迎页） */
  showAllWhenNoFlags?: boolean;
  onSummonEmployee?: () => void;
  summonLabel?: string;
  onOpenThinkTank?: () => void;
  onOpenSkill?: () => void;
  onOpenMcp?: () => void;
  maxWidth?: number | string;
}

const MODEL_OPTIONS = [
  { key: 'auto', label: '自动' },
  { key: 'glm-4', label: 'GLM-4' },
  { key: 'deepseek-v3', label: 'DeepSeek-V3' },
  { key: 'qwen-max', label: '通义千问 Max' },
  { key: 'xirang-star', label: '星辰大模型' },
];

const chipBtnStyle = (active = false): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  height: 32,
  padding: '0 12px',
  border: `1px solid ${active ? BRAND_PRIMARY : '#e8e8e8'}`,
  background: '#fff',
  borderRadius: 16,
  fontSize: 13,
  color: active ? BRAND_PRIMARY : '#666',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

const iconBtnStyle = (active = false): React.CSSProperties => ({
  width: 32,
  height: 32,
  border: `1px solid ${active ? BRAND_PRIMARY : '#e8e8e8'}`,
  background: active ? '#fffafa' : '#fff',
  borderRadius: 8,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: active ? BRAND_PRIMARY : '#999',
  padding: 0,
  transition: 'all 0.2s',
  flexShrink: 0,
});

const ChatInputComposer: React.FC<ChatInputComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = '请直接提出您的问题~',
  loading = false,
  featureFlags = null,
  showAllWhenNoFlags = true,
  onSummonEmployee,
  summonLabel = '切换专家',
  onOpenThinkTank,
  onOpenSkill,
  onOpenMcp,
  maxWidth,
}) => {
  const [modelKey, setModelKey] = useState('auto');
  const [focused, setFocused] = useState(false);
  const [pickerType, setPickerType] = useState<AiToolPickerType | null>(null);
  const [selectedCounts, setSelectedCounts] = useState({ skill: 3, knowledge: 0, mcp: 3 });

  const openPicker = (type: AiToolPickerType) => {
    setPickerType(type);
    if (type === 'skill') onOpenSkill?.();
    if (type === 'knowledge') onOpenThinkTank?.();
    if (type === 'mcp') onOpenMcp?.();
  };

  const visible = useMemo(() => {
    if (!featureFlags) {
      return {
        attachmentUpload: showAllWhenNoFlags,
        skill: showAllWhenNoFlags,
        mcp: showAllWhenNoFlags,
        thinkTank: showAllWhenNoFlags,
        summon: true,
      };
    }
    return {
      attachmentUpload: featureFlags.attachmentUpload,
      skill: featureFlags.skill,
      mcp: featureFlags.mcp,
      thinkTank: featureFlags.thinkTank,
      summon: true,
    };
  }, [featureFlags, showAllWhenNoFlags]);

  const toolMenuItems = useMemo(() => {
    const items: {
      key: string;
      label: React.ReactNode;
      icon: React.ReactNode;
      onClick: () => void;
    }[] = [];

    if (visible.skill) {
      items.push({
        key: 'skill',
        icon: <ThunderboltOutlined />,
        label: (
          <span>
            技能
            {selectedCounts.skill > 0 ? (
              <span style={{ marginLeft: 6, color: BRAND_PRIMARY }}>{selectedCounts.skill}</span>
            ) : null}
          </span>
        ),
        onClick: () => openPicker('skill'),
      });
    }
    if (visible.thinkTank) {
      items.push({
        key: 'knowledge',
        icon: <DatabaseOutlined />,
        label: (
          <span>
            智库
            {selectedCounts.knowledge > 0 ? (
              <span style={{ marginLeft: 6, color: BRAND_PRIMARY }}>{selectedCounts.knowledge}</span>
            ) : null}
          </span>
        ),
        onClick: () => openPicker('knowledge'),
      });
    }
    if (visible.mcp) {
      items.push({
        key: 'mcp',
        icon: <ApiOutlined />,
        label: (
          <span>
            MCP
            {selectedCounts.mcp > 0 ? (
              <span style={{ marginLeft: 6, color: BRAND_PRIMARY }}>{selectedCounts.mcp}</span>
            ) : null}
          </span>
        ),
        onClick: () => openPicker('mcp'),
      });
    }
    return items;
  }, [visible, selectedCounts]);

  const hasCollapsedTools = toolMenuItems.length > 0;
  const toolsActive =
    selectedCounts.skill > 0 || selectedCounts.knowledge > 0 || selectedCounts.mcp > 0;

  const modelLabel = MODEL_OPTIONS.find((m) => m.key === modelKey)?.label ?? '自动';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth, margin: '0 auto' }}>
      <div
        style={{
          border: `1px solid ${focused ? 'rgba(228, 57, 60, 0.4)' : '#e8e8e8'}`,
          borderRadius: 12,
          background: '#fff',
          boxShadow: focused ? '0 0 0 2px rgba(228, 57, 60, 0.08)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '12px 14px 6px' }}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            rows={3}
            style={{
              display: 'block',
              width: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              margin: 0,
              padding: 0,
              fontSize: 14,
              fontFamily: 'inherit',
              color: '#333',
              lineHeight: '22px',
              background: 'transparent',
              minHeight: 66,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '4px 10px 10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
            {hasCollapsedTools && (
              <Dropdown
                menu={{
                  items: toolMenuItems.map((item) => ({
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    onClick: item.onClick,
                  })),
                }}
                trigger={['click']}
                placement="topLeft"
              >
                <button
                  type="button"
                  style={iconBtnStyle(toolsActive)}
                  aria-label="更多工具"
                  title="技能 / 智库 / MCP"
                >
                  <PlusOutlined style={{ fontSize: 14 }} />
                </button>
              </Dropdown>
            )}

            {visible.summon && onSummonEmployee && (
              <button type="button" style={chipBtnStyle()} onClick={onSummonEmployee}>
                <AppstoreOutlined style={{ fontSize: 14 }} />
                {summonLabel}
              </button>
            )}

            {visible.attachmentUpload && (
              <button
                type="button"
                style={iconBtnStyle()}
                aria-label="上传附件"
                title="上传附件"
                onClick={() => message.info('选择附件（演示）')}
              >
                <PaperClipOutlined style={{ fontSize: 14 }} />
              </button>
            )}

            <Dropdown
              menu={{
                items: MODEL_OPTIONS.map((m) => ({
                  key: m.key,
                  label: m.label,
                  onClick: () => setModelKey(m.key),
                })),
                selectedKeys: [modelKey],
              }}
              trigger={['click']}
            >
              <button type="button" style={chipBtnStyle()} title="大模型选择">
                <span>{modelLabel}</span>
                <DownOutlined style={{ fontSize: 10, color: '#999' }} />
              </button>
            </Dropdown>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              aria-label="发送"
              disabled={loading || !value.trim()}
              onClick={onSend}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: !value.trim() ? '#ffccc7' : BRAND_PRIMARY,
                color: '#fff',
                border: 'none',
                cursor: !value.trim() || loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s, transform 0.15s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <SendOutlined style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      </div>

      <AiToolPickerModal
        open={!!pickerType}
        type={pickerType}
        onClose={() => setPickerType(null)}
        onSelectionChange={(type, selected) => {
          setSelectedCounts((prev) => ({ ...prev, [type]: selected.length }));
        }}
      />
    </div>
  );
};

export default ChatInputComposer;
