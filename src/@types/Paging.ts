export interface Paging<T> {
  href: string;
  items: T[];
  limit: number;
  next: string;
  offset: number;
  previous: null;
  total: number;
}

export const defaultPaging = {
  href: "",
  items: [],
  limit: 0,
  next: "",
  offset: 0,
  previous: null,
  total: 0
};
