export interface Pagination<T> {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    data: T[];
    support: Support;
}

interface Support {
    url: string;
    text: string;
}