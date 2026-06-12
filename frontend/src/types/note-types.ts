

export type PaginationType = {
    total: number
    page: number
    limit: number
    totalPages: number
}
export type NoteType = {
    _id: string
    title: string
    image: string
    description?: string
    isArchived?: boolean
    isPinned?: boolean
    archivedAt?: string | null
    userId: string
    createdAt: string
    updatedAt: string
    docs:DocType[]
    folderId?: string | null
}

export type DocType = {
    _id: string,
    title: string,
    fileName: string,
    displayName?: string,
    noteId: string,
    userId:string,
    source_type:string,
    status?: 'uploading' | 'parsing' | 'embedding' | 'indexed' | 'failed',
    errorMessage?: string
}
export type NoteServerData = { notes: NoteType[] } & { pagination?: PaginationType }