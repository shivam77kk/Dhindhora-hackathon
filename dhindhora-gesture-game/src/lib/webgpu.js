export const checkWebGPU = async () => {
  if (typeof window === 'undefined') return false;
  try {
    if (!('gpu' in navigator)) return false;
    const adapter = await navigator.gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
};
