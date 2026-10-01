// The interface's text. French only for now: another language would be another object of the same type.
const fr = {
  navigation: {
    label: 'Navigation principale',
    more: 'Plus',
    groups: {
      exchanges: 'Échanges',
      community: 'Communauté',
      account: 'Mon compte',
    },
    items: {
      home: 'Accueil',
      requests: 'Demandes',
      events: 'Événements',
      members: 'Membres',
      interests: "Centres d'intérêts",
      information: 'Informations',
      profile: 'Profil',
      settings: 'Paramètres',
    },
  },
  signOut: 'Se déconnecter',
};

export type Translations = typeof fr;

export const t: Translations = fr;
