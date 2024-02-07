export interface MemberAvatarPort {
  getAvatarUrl(member: { id: string }): string;
}
