export const WIDGET_STYLES = `
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #1a1a2e;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .gb-container {
    position: relative;
  }

  .gb-fab {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: #1a1a2e;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
  }

  .gb-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  }

  .gb-fab svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }

  .gb-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #e63946;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }

  .gb-badge[data-count="0"] {
    display: none;
  }

  .gb-panel {
    position: absolute;
    width: 360px;
    max-height: 480px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    display: none;
    flex-direction: column;
    overflow: hidden;
  }

  .gb-panel.gb-open {
    display: flex;
  }

  .gb-panel.gb-pos-bottom-right,
  .gb-panel.gb-pos-bottom-left {
    bottom: 60px;
  }

  .gb-panel.gb-pos-top-right,
  .gb-panel.gb-pos-top-left {
    top: 60px;
  }

  .gb-panel.gb-pos-bottom-right,
  .gb-panel.gb-pos-top-right {
    right: 0;
  }

  .gb-panel.gb-pos-bottom-left,
  .gb-panel.gb-pos-top-left {
    left: 0;
  }

  .gb-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e8e8e8;
    background: #f8f9fa;
    gap: 8px;
  }

  .gb-header-title {
    font-weight: 700;
    font-size: 14px;
    color: #1a1a2e;
    flex: 1;
  }

  .gb-header-btn {
    border: none;
    background: #1a1a2e;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .gb-header-btn:hover {
    opacity: 0.85;
  }

  .gb-close-btn {
    border: none;
    background: transparent;
    color: #999;
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }

  .gb-close-btn:hover {
    color: #333;
  }

  .gb-report-list {
    overflow-y: auto;
    flex: 1;
    padding: 8px 0;
  }

  .gb-empty {
    padding: 32px 16px;
    text-align: center;
    color: #999;
    font-size: 13px;
  }

  .gb-report-item {
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.15s;
  }

  .gb-report-item:last-child {
    border-bottom: none;
  }

  .gb-report-summary {
    padding: 10px 16px;
    cursor: pointer;
  }

  .gb-report-summary:hover {
    background: #f8f9fa;
  }

  .gb-report-detail {
    display: none;
    padding: 0 16px 12px;
    border-top: 1px dashed #e8e8e8;
  }

  .gb-report-item.gb-expanded .gb-report-detail {
    display: block;
  }

  .gb-detail-section {
    margin-top: 8px;
  }

  .gb-detail-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #999;
    margin-bottom: 2px;
  }

  .gb-detail-value {
    font-size: 12px;
    color: #555;
    word-break: break-word;
    line-height: 1.4;
  }

  .gb-detail-pre {
    font-size: 11px;
    font-family: 'SF Mono', Menlo, Monaco, monospace;
    background: #f5f5f5;
    padding: 8px;
    border-radius: 6px;
    overflow-x: auto;
    max-height: 120px;
    overflow-y: auto;
    color: #333;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .gb-report-type {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    margin-right: 6px;
  }

  .gb-type-error {
    background: #fde8e8;
    color: #e63946;
  }

  .gb-type-console {
    background: #fff3e0;
    color: #e65100;
  }

  .gb-type-network {
    background: #e3f2fd;
    color: #1565c0;
  }

  .gb-type-performance {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .gb-type-memory {
    background: #f3e5f5;
    color: #6a1b9a;
  }

  .gb-report-message {
    font-size: 13px;
    color: #333;
    margin-top: 4px;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gb-report-meta {
    font-size: 11px;
    color: #999;
    margin-top: 2px;
  }

  .gb-report-count {
    font-size: 11px;
    font-weight: 600;
    color: #e63946;
    margin-left: 4px;
  }

  .gb-toast {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a2e;
    color: #fff;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 2147483647;
  }

  .gb-toast.gb-show {
    opacity: 1;
  }
`;
