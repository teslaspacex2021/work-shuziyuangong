import React from 'react';
import { Button, Empty, Space, Tooltip, message } from 'antd';
import {
  AppstoreOutlined,
  CloseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import type { RetrievalFileItem } from '../mock/data';

const fileIcon = (type: RetrievalFileItem['type']) => {
  const style = { fontSize: 28 };
  switch (type) {
    case 'docx':
      return <FileWordOutlined style={{ ...style, color: '#2b579a' }} />;
    case 'pdf':
      return <FilePdfOutlined style={{ ...style, color: '#e4393c' }} />;
    case 'xlsx':
      return <FileExcelOutlined style={{ ...style, color: '#217346' }} />;
    case 'pptx':
      return <FilePptOutlined style={{ ...style, color: '#d24726' }} />;
    case 'txt':
      return <FileTextOutlined style={{ ...style, color: '#8c8c8c' }} />;
    default:
      return <FileOutlined style={{ ...style, color: '#1677ff' }} />;
  }
};

export interface ThirdScreenPanelProps {
  open: boolean;
  title?: string;
  files: RetrievalFileItem[];
  previewFile?: RetrievalFileItem | null;
  onClose: () => void;
  onPreview: (file: RetrievalFileItem) => void;
  onBackToList?: () => void;
}

const ThirdScreenPanel: React.FC<ThirdScreenPanelProps> = ({
  open,
  title = '检索结果',
  files,
  previewFile,
  onClose,
  onPreview,
  onBackToList,
}) => {
  const handleDownload = (file: RetrievalFileItem) => {
    message.success(`开始下载：${file.name}`);
  };

  return (
    <div
      style={{
        width: open ? 360 : 0,
        overflow: 'hidden',
        transition: 'width 0.28s ease',
        background: '#fff',
        borderLeft: open ? '1px solid #f0f0f0' : 'none',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ width: 360, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            flexShrink: 0,
          }}
        >
          <Space size={8}>
            <AppstoreOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {previewFile ? '文件预览' : title}
            </span>
          </Space>
          <Space size={4}>
            {previewFile && onBackToList && (
              <Tooltip title="返回列表">
                <Button type="text" size="small" icon={<MenuFoldOutlined />} onClick={onBackToList} />
              </Tooltip>
            )}
            <Tooltip title="收起">
              <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
            </Tooltip>
          </Space>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {previewFile ? (
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                {fileIcon(previewFile.type)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, wordBreak: 'break-all' }}>
                    {previewFile.name}
                  </div>
                  {previewFile.size && (
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{previewFile.size}</div>
                  )}
                </div>
              </div>
              <div
                style={{
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 13,
                  color: '#595959',
                  lineHeight: 1.8,
                  minHeight: 280,
                }}
              >
                <div style={{ fontWeight: 500, color: '#262626', marginBottom: 8 }}>内容预览</div>
                {previewFile.snippet}
                <p style={{ marginTop: 16, color: '#8c8c8c' }}>
                  （原型演示：实际环境将接入文档在线预览服务，支持翻页与全文检索高亮。）
                </p>
              </div>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                block
                style={{ marginTop: 16, borderRadius: 8 }}
                onClick={() => handleDownload(previewFile)}
              >
                下载文件
              </Button>
            </div>
          ) : files.length === 0 ? (
            <Empty description="暂无检索结果" style={{ marginTop: 80 }} />
          ) : (
            <div>
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f5f5f5',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => onPreview(file)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ flexShrink: 0, paddingTop: 2 }}>{fileIcon(file.type)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: '#262626',
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#8c8c8c',
                        lineHeight: 1.55,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {file.snippet}
                    </div>
                    <Space size={12} style={{ marginTop: 8 }}>
                      <a
                        onClick={(e) => { e.stopPropagation(); onPreview(file); }}
                        style={{ fontSize: 12 }}
                      >
                        <EyeOutlined /> 预览
                      </a>
                      <a
                        onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                        style={{ fontSize: 12 }}
                      >
                        <DownloadOutlined /> 下载
                      </a>
                    </Space>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThirdScreenPanel;
