import { useState, useEffect } from "react";

const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(value);
    }, limit);

    return () => {
      clearTimeout(handler); // 이전 타이머 정리
    };
  }, [value, limit]);

  return throttledValue;
};

export default useThrottle;
