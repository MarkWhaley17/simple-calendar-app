import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import MarqueeText from '../../../components/ui/MarqueeText';

const simulateLayout = (
  element: ReturnType<typeof render>['getByTestId'] extends (id: string) => infer R ? R : never,
  width: number
) => {
  fireEvent(element, 'layout', { nativeEvent: { layout: { width, height: 24, x: 0, y: 0 } } });
};

describe('MarqueeText', () => {
  it('renders text in the visible node', () => {
    const { getAllByText } = render(<MarqueeText text="A dharma quote" />);
    expect(getAllByText('A dharma quote').length).toBeGreaterThanOrEqual(1);
  });

  it('container has no overflow hidden before overflow is detected', () => {
    const { getByTestId } = render(<MarqueeText text="Test" />);
    const container = getByTestId('marquee-container');
    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;
    expect(style.overflow).toBeUndefined();
  });

  it('container gets overflow hidden once text overflows', async () => {
    const { getByTestId } = render(<MarqueeText text="A very long quote that should scroll" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 600);
    });

    const container = getByTestId('marquee-container');
    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;
    expect(style.overflow).toBe('hidden');
  });

  it('measurement node has width 9999 to avoid parent width constraint', () => {
    const { getByTestId } = render(<MarqueeText text="Test" />);
    expect(getByTestId('marquee-measure-wrapper').props.style).toMatchObject({ width: 9999 });
  });

  it('visible row has no explicit width before layout is measured', () => {
    const { getByTestId } = render(<MarqueeText text="Test" />);
    const visible = getByTestId('marquee-visible-text');
    const flatStyle = Array.isArray(visible.props.style)
      ? Object.assign({}, ...visible.props.style.flat().filter(Boolean))
      : visible.props.style;
    expect(flatStyle.width).toBeUndefined();
  });

  it('visible row gets width 2*(textWidth+64) after overflow is detected', async () => {
    const { getByTestId } = render(<MarqueeText text="A very long quote that should scroll" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 600);
    });

    const visible = getByTestId('marquee-visible-text');
    const flatStyle = Array.isArray(visible.props.style)
      ? Object.assign({}, ...visible.props.style.flat().filter(Boolean))
      : visible.props.style;
    // totalScroll = 600+64 = 664; two copies = 1328
    expect(flatStyle.width).toBe(1328);
  });

  it('renders two visible copies when overflowing', async () => {
    const { getAllByText, getByTestId } = render(<MarqueeText text="A very long quote that should scroll" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 600);
    });

    // hidden measurement copy + 2 visible copies = 3
    expect(getAllByText('A very long quote that should scroll').length).toBe(3);
  });

  it('renders only one visible copy when text fits', async () => {
    const { getAllByText, getByTestId } = render(<MarqueeText text="Short" />);

    await act(async () => {
      simulateLayout(getByTestId('marquee-container'), 300);
      simulateLayout(getByTestId('marquee-measure-text'), 200);
    });

    // hidden copy + 1 visible copy = 2
    expect(getAllByText('Short').length).toBe(2);
  });
});
