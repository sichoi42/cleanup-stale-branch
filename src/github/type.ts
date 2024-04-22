export interface BranchInfo {
  branchName: string;
  branchUrl: string;
  committer: Committer;
}

export interface Committer {
  name: string;
  email: string;
  date: Date;
}
