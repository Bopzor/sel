import { Member } from '../members';

export class AuthenticationService {
  async getAuthenticatedMember(): Promise<Member> {
    const response = await fetch('http://localhost:8000/api/auth/me');

    if (!response.ok) {
      throw new Error('not ok');
    }

    const member = await response.json();

    return member;
  }

  async login(memberId: string): Promise<void> {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memberId }),
    });

    if (!response.ok) {
      throw new Error('not ok');
    }
  }
}
