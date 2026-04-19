import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';

interface QRCodeProps {
  value: string;
  /** 렌더링 픽셀 크기 (정사각). */
  size: number;
  /** 주변 여백 (모듈 수). 기본 4. */
  margin?: number;
  /** 모듈 색. 기본 서울이 ink. */
  color?: string;
  /** 배경색. 기본 투명 (하위 배경 노출). */
  background?: string;
  /** 오류 정정 수준 ('L' 7%, 'M' 15%, 'Q' 25%, 'H' 30%). 기본 'H'. */
  level?: 'L' | 'M' | 'Q' | 'H';
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size,
  margin = 4,
  color = '#1A1A1A',
  background = 'transparent',
  level = 'H',
}) => {
  const { cells, totalModules } = useMemo(() => {
    const qr = qrcode(0, level);
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    const grid: boolean[][] = [];
    for (let r = 0; r < n; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < n; c++) row.push(qr.isDark(r, c));
      grid.push(row);
    }
    return { cells: grid, totalModules: n + margin * 2 };
  }, [value, level, margin]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${totalModules} ${totalModules}`}
      shapeRendering="crispEdges"
      style={{ background }}
    >
      {cells.map((row, r) =>
        row.map((dark, c) =>
          dark ? (
            <rect
              key={`${r}-${c}`}
              x={c + margin}
              y={r + margin}
              width={1}
              height={1}
              fill={color}
            />
          ) : null,
        ),
      )}
    </svg>
  );
};
