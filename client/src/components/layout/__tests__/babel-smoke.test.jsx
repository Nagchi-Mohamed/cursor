import React from 'react';
test('babel jsx transform smoke', () => {
  const el = <div>Hello JSX</div>;
  expect(el.props.children).toBe('Hello JSX');
});
