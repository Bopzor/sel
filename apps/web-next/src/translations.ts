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
  authentication: {
    email: {
      instructions: "Entrez l'adresse email de votre compte du SEL pour accéder à l'app.",
      label: 'Adresse email',
      placeholder: 'mon@email.com',
      submit: 'Connexion',
      invalid: 'Saisissez une adresse email valide, par exemple mon@email.com.',
      failed: "Le code de connexion n'a pas pu être envoyé. Réessayez dans quelques instants.",
    },
    code: {
      sent: "Si votre adresse email est autorisée, un email contenant un code de connexion vous a été envoyé à l'adresse",
      instructions: 'Entrez le code de connexion reçu par email.',
      notReceived:
        "Si vous n'avez rien reçu dans les prochaines minutes, vérifiez dans vos spams ou contactez-nous.",
      label: 'Code de connexion',
      invalid: 'Saisissez les 6 chiffres du code reçu par email.',
      back: 'Retour',
      notFound: "Ce code n'est pas valide. Vérifiez qu'il correspond à celui de l'email.",
      revoked: 'Ce code a été remplacé par un plus récent : utilisez celui du dernier email reçu.',
      expired: 'Ce code a expiré. Revenez en arrière pour en recevoir un nouveau.',
      failed: 'La connexion a échoué. Réessayez dans quelques instants.',
    },
  },
};

export type Translations = typeof fr;

export const t: Translations = fr;
