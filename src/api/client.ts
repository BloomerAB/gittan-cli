export type TGittanApiConfig = {
  readonly baseUrl: string
  readonly token?: string
}

export const createApiClient = (config: TGittanApiConfig) => {
  const request = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (config.token) {
      headers.Authorization = `Bearer ${config.token}`
    }

    const res = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`${method} ${path} failed (${res.status}): ${text}`)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  }

  return {
    health: () => request<{ status: string; dependencies: unknown[] }>("GET", "/healthz"),

    teams: {
      list: (orgId: string) => request<unknown[]>("GET", `/orgs/${orgId}/teams`),
      get: (orgId: string, teamId: string) => request<unknown>("GET", `/orgs/${orgId}/teams/${teamId}`),
      getByName: (orgId: string, name: string) => request<unknown>("GET", `/orgs/${orgId}/teams/by-name/${name}`),
      create: (orgId: string, body: { name: string; displayName: string; slackChannel?: string }) =>
        request<unknown>("POST", `/orgs/${orgId}/teams`, body),
      members: (teamId: string) => request<unknown[]>("GET", `/teams/${teamId}/members`),
      addMember: (teamId: string, body: { userId: string; role: string }) =>
        request<unknown>("POST", `/teams/${teamId}/members`, body),
      removeMember: (teamId: string, userId: string) =>
        request<void>("DELETE", `/teams/${teamId}/members/${userId}`),
      metrics: (teamId: string) => request<unknown>("GET", `/teams/${teamId}/metrics`),
    },

    repos: {
      get: (orgId: string, repoId: string) => request<unknown>("GET", `/orgs/${orgId}/repos/${repoId}`),
      listByTeam: (teamId: string) => request<unknown[]>("GET", `/teams/${teamId}/repos`),
      create: (orgId: string, body: { name: string; teamId: string; description?: string; tags?: string[] }) =>
        request<unknown>("POST", `/orgs/${orgId}/repos`, body),
    },

    pipelines: {
      listByTeam: (teamId: string) => request<unknown[]>("GET", `/teams/${teamId}/pipelines`),
    },
  }
}

export type TApiClient = ReturnType<typeof createApiClient>
