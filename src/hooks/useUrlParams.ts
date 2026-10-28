import { useSearchParams } from "react-router-dom";

export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = (
    updates: Record<string, string | null>,
    replace = false,
  ) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }

        return next;
      },
      { replace },
    );
  };

  return { searchParams, updateParams };
};
