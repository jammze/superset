import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { Waypoint } from 'react-waypoint';
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
  const onEnter = () => {
    ChartRenderSingleton.addVisible(id);
  };
  const onLeave = () => {
    ChartRenderSingleton.removeVisible(id);
  };
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
      >
        <Waypoint onEnter={onEnter} onLeave={onLeave} />
      </StyledContainer>
    );
  }
  return content;
};
export default ChartWrapper;
