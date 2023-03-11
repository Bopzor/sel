import { Member } from './index';

export class MembersService {
  async listMembers(search?: string): Promise<Member[]> {
    const searchParams = new URLSearchParams();

    if (search) {
      searchParams.set('search', search);
    }

    const response = await fetch(`http://localhost:8000/api/members?${searchParams}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const members = await response.json();

    return members;
  }

  async getMember(memberId: string): Promise<Member> {
    const response = await fetch(`http://localhost:8000/api/members/${memberId}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const member = await response.json();

    return member;
  }
}
