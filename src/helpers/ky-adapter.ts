import ky, { Options } from "ky";

// Types pour les options étendues de ky pour correspondre aux habitudes d'axios
export interface ExtendedOptions extends Options {
  context_uri?: string;
  data?: unknown;
  device_id?: string;
  device_ids?: string[];
  insert_before?: number;
  name?: string;
  position_ms?: number;
  uris?: string[];
}

// Interface pour la réponse qui inclut à la fois data et json() pour la compatibilité
export interface KyResponseWrapper<T> extends Promise<{ data: T }> {
  json<J = T>(): Promise<J>;
}

// Adapter la méthode pour simuler la structure de retour d'axios
export async function kyDelete<T = unknown>(
  instance: typeof ky,
  url: string,
  options?: ExtendedOptions,
): Promise<{ data: T; json: <J = T>() => Promise<J> }> {
  const response = await instance.delete(url, options as Options);
  try {
    const data = await response.json<T>();
    return {
      data,
      json: async <J = T>(): Promise<J> => data as unknown as J,
    };
  } catch {
    const emptyData = {} as T;
    return {
      data: emptyData,
      json: async <J = T>(): Promise<J> => emptyData as unknown as J,
    };
  }
}

export async function kyGet<T = unknown>(
  instance: typeof ky,
  url: string,
  options?: ExtendedOptions,
): Promise<{ data: T; json: <J = T>() => Promise<J> }> {
  const response = await instance.get(url, options as Options);
  const data = await response.json<T>();
  return {
    data,
    json: async <J = T>(): Promise<J> => data as unknown as J,
  };
}

export async function kyPatch<T = unknown>(
  instance: typeof ky,
  url: string,
  body?: unknown,
  options?: ExtendedOptions,
): Promise<{ data: T; json: <J = T>() => Promise<J> }> {
  const opts: Options = { ...(options as Options) };

  if (body) {
    opts.json = body;
  }

  const response = await instance.patch(url, opts);
  try {
    const data = await response.json<T>();
    return {
      data,
      json: async <J = T>(): Promise<J> => data as unknown as J,
    };
  } catch {
    const emptyData = {} as T;
    return {
      data: emptyData,
      json: async <J = T>(): Promise<J> => emptyData as unknown as J,
    };
  }
}

export async function kyPost<T = unknown>(
  instance: typeof ky,
  url: string,
  body?: unknown,
  options?: ExtendedOptions,
): Promise<{ data: T; json: <J = T>() => Promise<J> }> {
  const opts: Options = { ...(options as Options) };

  if (body) {
    opts.json = body;
  }

  const response = await instance.post(url, opts);
  try {
    const data = await response.json<T>();
    return {
      data,
      json: async <J = T>(): Promise<J> => data as unknown as J,
    };
  } catch {
    const emptyData = {} as T;
    return {
      data: emptyData,
      json: async <J = T>(): Promise<J> => emptyData as unknown as J,
    };
  }
}

export async function kyPut<T = unknown>(
  instance: typeof ky,
  url: string,
  body?: unknown,
  options?: ExtendedOptions,
): Promise<{ data: T; json: <J = T>() => Promise<J> }> {
  const opts: Options = { ...(options as Options) };

  if (body) {
    opts.json = body;
  }

  const response = await instance.put(url, opts);
  try {
    const data = await response.json<T>();
    return {
      data,
      json: async <J = T>(): Promise<J> => data as unknown as J,
    };
  } catch {
    const emptyData = {} as T;
    return {
      data: emptyData,
      json: async <J = T>(): Promise<J> => emptyData as unknown as J,
    };
  }
}
