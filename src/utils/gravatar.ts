import md5 from 'crypto-js/md5';

const params = new URLSearchParams({
  default: 'mp',
  size: '64',
});

export const gravatarUrl = (email: string) => {
  return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?${params}`;
};
