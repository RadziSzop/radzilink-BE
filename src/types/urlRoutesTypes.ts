export interface postUrlBody {
  destinationUrl: string;
  customUrl?: string;
  password?: string;
  analitics?: boolean;
  deleteAfterRead?: boolean;
  deleteTime?: number | null;
}
export interface getProtectedUrlBody {
  password: string;
}
