export const applicationsSortConfig = {
  searchFields: ['id', 'fio', 'vin', 'gosNumber', 'brand', 'model'],
  sortOptions: {
    newest: (a: { createdAt?: string }, b: { createdAt?: string }) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    oldest: (a: { createdAt?: string }, b: { createdAt?: string }) =>
      new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
    numberAsc: (a: { id: number }, b: { id: number }) => a.id - b.id,
    numberDesc: (a: { id: number }, b: { id: number }) => b.id - a.id
  }
};

export const usersSortConfig = {
  searchFields: ['userId', 'fio', 'email', 'role'],
  sortOptions: {
    newest: (a: { regDate?: string }, b: { regDate?: string }) =>
      new Date(b.regDate ?? 0).getTime() - new Date(a.regDate ?? 0).getTime(),
    oldest: (a: { regDate?: string }, b: { regDate?: string }) =>
      new Date(a.regDate ?? 0).getTime() - new Date(b.regDate ?? 0).getTime(),
    numberAsc: (a: { userId: number }, b: { userId: number }) => a.userId - b.userId,
    numberDesc: (a: { userId: number }, b: { userId: number }) => b.userId - a.userId
  }
};

export const ptosSortConfig = {
  searchFields: ['id', 'name', 'rsaNumber', 'address'],
  sortOptions: {
    numberAsc: (a: { id: number }, b: { id: number }) => a.id - b.id,
    numberDesc: (a: { id: number }, b: { id: number }) => b.id - a.id
  }
};

export const promptsSortConfig = {
  searchFields: ['promptId', 'tag', 'description'],
  sortOptions: {
    numberAsc: (a: { promptId: number }, b: { promptId: number }) => a.promptId - b.promptId,
    numberDesc: (a: { promptId: number }, b: { promptId: number }) => b.promptId - a.promptId
  }
};

export const accrualsSortConfig = {
  searchFields: ['externalId', 'agentName', 'description'],
  sortOptions: {
    newest: (a: { createdAt: string }, b: { createdAt: string }) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    oldest: (a: { createdAt: string }, b: { createdAt: string }) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  }
};

export const neuronNetworksSortConfig = {
  searchFields: ['id', 'name', 'link'],
  sortOptions: {
    numberAsc: (a: { id: number }, b: { id: number }) => a.id - b.id,
    numberDesc: (a: { id: number }, b: { id: number }) => b.id - a.id
  }
};
