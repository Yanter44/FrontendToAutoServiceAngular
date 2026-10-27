export interface CreateBranchDto {
  name: string;
  fee: number;
}
export interface BranchMemberDto {
  agentId: number;
  fio: string;
  email: string;
  regDate: string;  
  balance: number;
  debitLimit: number;
  currentDebit: number;
}

export interface BranchWithMembersDto {
  id: number;
  name: string;
  fee: number;    
  isActive: boolean;
  createdAt: string;   
  memberCount: number;
  members: BranchMemberDto[];
}
export interface BranchDto{
    Id: number
    Name: string
    Fee: number
    MemberCount: number
}