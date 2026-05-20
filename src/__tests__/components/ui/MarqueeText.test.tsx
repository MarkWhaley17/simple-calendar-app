import React from 'react';
import { Animated } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import MarqueeText from '../../../components/ui/MarqueeText';

const simulateLayout = (
  element: ReturnType<typeof render>['getByTestId'] extends (id: string) => infer R ? R : never,
  width: number
) => {
  fireEvent(element, 'layout', { nativeEvent: { layout: { width, height: 24, x: 0, y: 0 } } });
};

describe('MarqueeText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders text in both measurement and visible nodes', () => {
    const { getAllByText } = render(<MarqueeText text="A dharma quote" />);
    expect(getAllByText('A dharma quote').length).toBe(2);
  });

  it('container has overflow hidden', () => {
    const { getByTestId } = render(<MarqueeText text="Test" />);
    const container = getByTestId('marquee-container');
    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;
    expect(style.overflow).toBe('hidden');
  });

  // --- Bug fix 1: measurement node uses width:9999 ---

  it('measurement node has width 9999 to avoid parent width constraint', () => {
    const { getByTestId } = render(<MarqueeText text="Test" />);
    const measureWrapper = getByTestId('marquee-measure-wrapper');
    expect(measureWrapper.props.style).toMatchObject({ width: 9999 });
  });

  // --- Bug fix 2: visible text width equals textWidth + 32 when overflowing ---

  it('visible text has no explicit width before layout is measured', () => {
    const { getByTestId } = render(<MarqueeText text="Test" />);
    const visible = getByTestId('marquee-visible-text');
    const style = Array.isArray(visible.props.style)
      ? Object.assign({}, ...visible.props.style.flat())
      : visible.props.style;
    expect(style.width).toBeUndefined();
  });

  it('visible text gets width: textWidth + 32 after overflow is detected', async () => {
    const { getByTestId } = render(<MarqueeText text="A very long quote that should scroll" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 600);
    });

    const visible = getByTestId('marquee-visible-text');
    const style = Array.isArray(visible.props.style)
      ? Object.assign({}, ...visible.props.style.flat())
      : visible.props.style;
    expect(style.width).toBe(632); // 600 + 32
  });

  it('visible text still gets an explicit width when text fits (prevents wrapping)', async () => {
    const { getByTestId } = render(<MarqueeText text="Short" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 200);
    });

    const visible = getByTestId('marquee-visible-text');
    const style = Array.isArray(visible.props.style)
      ? Object.assign({}, ...visible.props.style.flat())
      : visible.props.style;
    // width is set to textWidth + 32 regardless of overflow to prevent text wrapping
    expect(style.width).toBe(232);
  });

  // --- Animation behaviour ---

  it('starts a looping animation when text overflows', async () => {
    const loopSpy = jest.spyOn(Animated, 'loop');

    const { getByTestId } = render(<MarqueeText text="A long scrolling quote" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 600);
    });

    expect(loopSpy).toHaveBeenCalled();
  });

  it('does not start animation when text fits the container', async () => {
    const loopSpy = jest.spyOn(Animated, 'loop');

    const { getByTestId } = render(<MarqueeText text="Short" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 200);
    });

    expect(loopSpy).not.toHaveBeenCalled();
  });

  it('resets and restarts animation when text prop changes', async () => {
    const loopSpy = jest.spyOn(Animated, 'loop');
    const { getByTestId, rerender } = render(<MarqueeText text="First long quote that overflows the container" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 600);
    });

    const callsAfterFirst = loopSpy.mock.calls.length;

    rerender(<MarqueeText text="Second long quote that also overflows the container" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-measure-text'), 650);
    });

    expect(loopSpy.mock.calls.length).toBeGreaterThan(callsAfterFirst);
  });

  it('respects custom speed prop in scroll duration', async () => {
    const timingSpy = jest.spyOn(Animated, 'timing');

    const { getByTestId } = render(<MarqueeText text="Long quote that overflows" speed={20} />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 600);
    });

    // scrollDistance = 600 - 300 + 32 = 332; duration = (332 / 20) * 1000 = 16600
    const scrollCall = timingSpy.mock.calls.find(
      ([, config]) => config && typeof config.duration === 'number' && config.duration > 1000
    );
    expect(scrollCall).toBeDefined();
    expect((scrollCall![1] as { duration: number }).duration).toBe(16600);
  });
});
