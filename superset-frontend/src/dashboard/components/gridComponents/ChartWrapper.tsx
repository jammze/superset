import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import ChartRenderSingleton from 'src/utils/chartRenderSingleton';
import Chart from '../../containers/Chart';

const StyledContainer = styled.div<{ width: number; height: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;
const ChartWrapper: React.FC<{
  id: number;
  componentId: string;
  chartWidth: number;
  chartHeight: number;
  [x: string]: any;
}> = props => {
  const { id, chartWidth, chartHeight, componentId } = props;
  const [show, setShow] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const io = useRef<IntersectionObserver | null>(
    new IntersectionObserver(entries => {
      const ele = entries[0];
      if (ele.isIntersecting) {
        ChartRenderSingleton.addVisible(id);
      } else {
        ChartRenderSingleton.removeVisible(id);
      }
    }),
  );
  useEffect(() => {
    if (show && io.current) {
      if (container.current) {
        io.current.unobserve(container.current);
      }
      io.current.disconnect();
      io.current = null;
    } else if (container.current) {
      io.current?.observe(container.current);
    }
  }, [show]);
  useEffect(() => {
    ChartRenderSingleton.registe(id, () => {
      setShow(true);
    });
  }, [id]);
  let content = <Chart {...props} />;
  if (!show) {
    // 首次渲染时先渲染一个占位符
    content = (
      <StyledContainer
        ref={container}
        key={`chart-${componentId}`}
        height={chartHeight}
        width={chartWidth}
      />
    );
  }
  return content;
};
export default ChartWrapper;
