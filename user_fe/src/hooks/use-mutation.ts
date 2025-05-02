import { useMutation, UseMutationResult } from "@tanstack/react-query";

export const useMutationHook = <TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  fnCallBack: (variables: TVariables) => Promise<TData>
): UseMutationResult<TData, TError, TVariables, TContext> => {
  return useMutation({
    mutationFn: fnCallBack,
  });
};
