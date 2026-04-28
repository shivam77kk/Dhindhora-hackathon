import React, { Suspense } from 'react';
export default function dynamic(importFunc, options) {
  const LazyComponent = React.lazy(importFunc);
  return (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
}
