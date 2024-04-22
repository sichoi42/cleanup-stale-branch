export interface BranchInfo {
  branchName: string;
  committer: Committer;
}

export interface Committer {
  name: string;
  email: string;
  date: Date;
}
