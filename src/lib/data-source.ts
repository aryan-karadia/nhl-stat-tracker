export type DataSourceMode = "mock" | "live" | "auto";

function isDataSourceMode(value: string | undefined): value is DataSourceMode {
  return value === "mock" || value === "live" || value === "auto";
}

export function getEnvDataSourceMode(
  envVarName: string,
  fallback: DataSourceMode = "mock"
): DataSourceMode {
  const modeValue = getEnvVar(envVarName);

  if (isDataSourceMode(modeValue)) {
    return modeValue;
  }

  return fallback;
}

export function getEnvVar(name: string): string | undefined {
  const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const value = processEnv?.[name];

  console.info("[data-source] env lookup", {
    name,
    value: value ?? "<unset>",
  });

  return value;
}

export interface DataSourceResolver<TParams, TResult> {
  mode?: DataSourceMode;
  getMock: (params: TParams) => Promise<TResult> | TResult;
  getLive?: (params: TParams) => Promise<TResult>;
  isLiveResultValid?: (result: TResult) => boolean;
  onLiveError?: (error: unknown) => void;
}

/**
 * Resolve data from live or mock sources with safe fallback behavior.
 *
 * - `mock`: always returns mock data
 * - `live`: requires live provider and throws if live fails
 * - `auto`: tries live, falls back to mock when unavailable
 */
export async function resolveDataSource<TParams, TResult>(
  params: TParams,
  resolver: DataSourceResolver<TParams, TResult>
): Promise<TResult> {
  const mode = resolver.mode ?? "mock";

  if (mode === "mock") {
    return resolver.getMock(params);
  }

  if (!resolver.getLive) {
    if (mode === "live") {
      throw new Error("Live data source is not configured.");
    }
    return resolver.getMock(params);
  }

  try {
    const liveResult = await resolver.getLive(params);
    if (!resolver.isLiveResultValid || resolver.isLiveResultValid(liveResult)) {
      return liveResult;
    }

    if (mode === "live") {
      throw new Error("Live data source returned invalid data.");
    }
  } catch (error) {
    resolver.onLiveError?.(error);
    if (mode === "live") {
      throw error;
    }
  }

  return resolver.getMock(params);
}
