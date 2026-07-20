import React from 'react';
import { Tag } from 'antd';
import type { CapabilityLevel } from '../mock/data';

/** 表格内高对比度级别标签（浅底 + 深色字，避免 Tag color 在主题下发虚） */
const LEVEL_TAG_STYLE: Record<CapabilityLevel, { background: string; color: string; border: string }> = {
  工具型: { background: '#f5f5f5', color: '#434343', border: '#bfbfbf' },
  智能型: { background: '#e6f4ff', color: '#0958d9', border: '#91caff' },
  超级型: { background: '#f9f0ff', color: '#531dab', border: '#b37feb' },
};

const CapabilityLevelTag: React.FC<{ level: CapabilityLevel }> = ({ level }) => {
  const style = LEVEL_TAG_STYLE[level];
  return (
    <Tag
      className="capability-level-tag"
      style={{
        marginInlineEnd: 0,
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 600,
        fontSize: 12,
        lineHeight: '20px',
        padding: '0 10px',
        borderRadius: 4,
      }}
    >
      {level}
    </Tag>
  );
};

export default CapabilityLevelTag;
