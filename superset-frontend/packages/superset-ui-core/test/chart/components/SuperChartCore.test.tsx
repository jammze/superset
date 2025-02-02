/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { mount, shallow } from 'enzyme';
import mockConsole, { RestoreConsole } from 'jest-mock-console';

import { ChartProps, promiseTimeout, supersetTheme } from '@superset-ui/core';
import SuperChartCore from '../../../src/chart/components/SuperChartCore';
import {
  ChartKeys,
  DiligentChartPlugin,
  LazyChartPlugin,
  SlowChartPlugin,
} from './MockChartPlugins';

describe('SuperChartCore', () => {
  const chartProps = new ChartProps();

  const plugins = [
    new DiligentChartPlugin().configure({ key: ChartKeys.DILIGENT }),
    new LazyChartPlugin().configure({ key: ChartKeys.LAZY }),
    new SlowChartPlugin().configure({ key: ChartKeys.SLOW }),
  ];

  let restoreConsole: RestoreConsole;

  beforeAll(() => {
    plugins.forEach(p => {
      p.unregister().register();
    });
  });

  afterAll(() => {
    plugins.forEach(p => {
      p.unregister();
    });
  });

  beforeEach(() => {
    restoreConsole = mockConsole();
  });

  afterEach(() => {
    restoreConsole();
  });

  describe('registered charts', () => {
    it('renders registered chart', () => {
      const wrapper = shallow(
        <SuperChartCore
          chartType={ChartKeys.DILIGENT}
          chartProps={chartProps}
        />,
      );

      return promiseTimeout(() => {
        expect(wrapper.render().find('div.test-component')).toHaveLength(1);
      });
    });
    it('renders registered chart with lazy loading', () => {
      const wrapper = shallow(<SuperChartCore chartType={ChartKeys.LAZY} />);

      return promiseTimeout(() => {
        expect(wrapper.render().find('div.test-component')).toHaveLength(1);
      });
    });
    it('does not render if chartType is not set', () => {
      // Suppress warning
      // @ts-ignore chartType is required
      const wrapper = shallow(<SuperChartCore />);

      return promiseTimeout(() => {
        expect(wrapper.render().children()).toHaveLength(0);
      }, 5);
    });
    it('adds id to container if specified', () => {
      const wrapper = shallow(
        <SuperChartCore chartType={ChartKeys.DILIGENT} id="the-chart" />,
      );

      return promiseTimeout(() => {
        expect(wrapper.render().attr('id')).toEqual('the-chart');
      });
    });
    it('adds class to container if specified', () => {
      const wrapper = shallow(
        <SuperChartCore chartType={ChartKeys.DILIGENT} className="the-chart" />,
      );

      return promiseTimeout(() => {
        expect(wrapper.hasClass('the-chart')).toBeTruthy();
      }, 0);
    });
    it('uses overrideTransformProps when specified', () => {
      const wrapper = shallow(
        <SuperChartCore
          chartType={ChartKeys.DILIGENT}
          overrideTransformProps={() => ({ message: 'hulk' })}
        />,
      );

      return promiseTimeout(() => {
        expect(wrapper.render().find('.message').text()).toEqual('hulk');
      });
    });
    it('uses preTransformProps when specified', () => {
      const chartPropsWithPayload = new ChartProps({
        queriesData: [{ message: 'hulk' }],
        theme: supersetTheme,
      });
      const wrapper = shallow(
        <SuperChartCore
          chartType={ChartKeys.DILIGENT}
          preTransformProps={() => chartPropsWithPayload}
          overrideTransformProps={props => props.queriesData[0]}
        />,
      );

      return promiseTimeout(() => {
        expect(wrapper.render().find('.message').text()).toEqual('hulk');
      });
    });
    it('uses postTransformProps when specified', () => {
      const wrapper = shallow(
        <SuperChartCore
          chartType={ChartKeys.DILIGENT}
          postTransformProps={() => ({ message: 'hulk' })}
        />,
      );

      return promiseTimeout(() => {
        expect(wrapper.render().find('.message').text()).toEqual('hulk');
      });
    });
    it('renders if chartProps is not specified', () => {
      const wrapper = shallow(
        <SuperChartCore chartType={ChartKeys.DILIGENT} />,
      );

      return promiseTimeout(() => {
        expect(wrapper.render().find('div.test-component')).toHaveLength(1);
      });
    });
    it('does not render anything while waiting for Chart code to load', () => {
      const wrapper = shallow(<SuperChartCore chartType={ChartKeys.SLOW} />);

      return promiseTimeout(() => {
        expect(wrapper.render().children()).toHaveLength(0);
      });
    });
    it('eventually renders after Chart is loaded', () => {
      // Suppress warning
      const wrapper = mount(<SuperChartCore chartType={ChartKeys.SLOW} />);

      return promiseTimeout(() => {
        expect(wrapper.render().find('div.test-component')).toHaveLength(1);
      }, 1500);
    });
    it('does not render if chartProps is null', () => {
      const wrapper = shallow(
        <SuperChartCore chartType={ChartKeys.DILIGENT} chartProps={null} />,
      );

      return promiseTimeout(() => {
        expect(wrapper.render().find('div.test-component')).toHaveLength(0);
      });
    });
  });

  describe('unregistered charts', () => {
    it('renders error message', () => {
      const wrapper = mount(
        <SuperChartCore chartType="4d-pie-chart" chartProps={chartProps} />,
      );

      return promiseTimeout(() => {
        expect(wrapper.render().find('.alert')).toHaveLength(1);
      });
    });
  });

  describe('.processChartProps()', () => {
    it('use identity functions for unspecified transforms', () => {
      const chart = new SuperChartCore({
        chartType: ChartKeys.DILIGENT,
      });
      const chartProps2 = new ChartProps();
      expect(chart.processChartProps({ chartProps: chartProps2 })).toBe(
        chartProps2,
      );
    });
  });
});
