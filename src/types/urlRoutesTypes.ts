export interface postUrlBody {
  destinationUrl: string;
  customUrl?: string;
  password?: string;
  analitics?: boolean;
  deleteAfterRead?: boolean;
}
export interface getProtectedUrlBody {
  password: string;
}
