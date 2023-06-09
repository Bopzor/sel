import { MikroORM } from '@mikro-orm/core';

import { Timestamp } from '../common/timestamp.value-object';
import { create as memberFactories } from '../modules/members/factories';
import { create as requestFactories } from '../modules/requests/factories';

import { container } from './container';
import mikroOrmConfig from './persistence/mikro-orm.config';
import { TOKENS } from './tokens';

const members = [
  memberFactories.member({
    id: 'member01',
    firstName: 'Quintia',
    lastName: 'Laine',
    email: 'liane.michel55@gmail.com',
    phoneNumber: '0683771483',
    address: memberFactories.address({
      line1: 'Sentier de Sandrinette ASC',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.8425918, 5.021643],
    }),
  }),
  memberFactories.member({
    id: 'member02',
    firstName: 'Eusébie',
    lastName: 'Girard',
    email: 'baptiste26@yahoo.fr',
    phoneNumber: '0151487499',
    address: memberFactories.address({
      line1: 'Piste de Vidauque',
      city: 'Cheval-Blanc',
      postalCode: '84460',
      country: 'France',
      position: [43.815778202377096, 5.088622650704202],
    }),
  }),
  memberFactories.member({
    id: 'member03',
    firstName: 'Olympe',
    lastName: 'Colin',
    email: 'clandre_legrand83@gmail.com',
    phoneNumber: '+33 206539347',
    address: memberFactories.address({
      line1: 'Avenue des Lagnes',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.850464986333215, 5.049421042113483],
    }),
  }),
  memberFactories.member({
    id: 'member04',
    firstName: 'Guyot',
    lastName: 'Perez',
    email: 'berthe.garcia0@gmail.com',
    phoneNumber: '+33 371143590',
    address: memberFactories.address({
      line1: 'Route de Saint-Estève',
      city: "Plan-d'Orgon",
      postalCode: '13750',
      country: 'France',
      position: [43.82393087813545, 4.992040714535469],
    }),
  }),
  memberFactories.member({
    id: 'member05',
    firstName: 'Martial',
    lastName: 'Collet',
    email: 'mosette_david4@hotmail.fr',
    phoneNumber: '0540017091',
    address: memberFactories.address({
      line1: "Route d'Avignon",
      city: 'Orgon',
      postalCode: '13660',
      country: 'France',
      position: [43.79361469438036, 5.025082363649694],
    }),
  }),
  memberFactories.member({
    id: 'member06',
    firstName: 'Geneviève',
    lastName: 'Dubois',
    email: 'victoire_menard47@yahoo.fr',
    phoneNumber: '+33 516866664',
    address: memberFactories.address({
      line1: undefined,
      city: 'Orgon',
      postalCode: '13660',
      country: 'France',
      position: [43.78826483796136, 5.031034786498383],
    }),
  }),
  memberFactories.member({
    id: 'member07',
    firstName: 'Tiphaine',
    lastName: 'Nguyen',
    email: 'albrade48@yahoo.fr',
    phoneNumber: '+33 443816147',
    address: memberFactories.address({
      line1: 'Boulevard Jacques Brel',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.85373204897683, 5.031221491867252],
    }),
  }),
  memberFactories.member({
    id: 'member08',
    firstName: 'Anaïs',
    lastName: 'Leroux',
    email: 'prosper.poirier@gmail.com',
    phoneNumber: '0304369795',
    address: memberFactories.address({
      line1: 'Chemin des Terres',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.8584096, 5.0200176],
    }),
  }),
  memberFactories.member({
    id: 'member09',
    firstName: 'Auriane',
    lastName: 'Roussel',
    email: 'ptronille_bertrand@gmail.com',
    phoneNumber: '0497978272',
    address: memberFactories.address({
      line1: 'Rue Paul Cézanne',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.8433981, 5.0389917],
    }),
  }),
  memberFactories.member({
    id: 'member10',
    firstName: 'Abigaïl',
    lastName: 'Benoit',
    email: 'marceline_rolland@hotmail.fr',
    phoneNumber: '+33 522653250',
    address: memberFactories.address({
      line1: undefined,
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.83795569553668, 5.043301210749505],
    }),
  }),
  memberFactories.member({
    id: 'member11',
    firstName: 'Amalric',
    lastName: 'Schmitt',
    email: 'ascelin.roche@hotmail.fr',
    phoneNumber: '0154601889',
    address: memberFactories.address({
      line1: 'Véloroute du Calavon',
      city: 'Robion',
      postalCode: '84440',
      country: 'France',
      position: [43.84953320740065, 5.094906155765249],
    }),
  }),
  memberFactories.member({
    id: 'member12',
    firstName: 'Maximilien',
    lastName: 'Marchal',
    email: 'dorothe.blanc@yahoo.fr',
    phoneNumber: '+33 704250895',
    address: memberFactories.address({
      line1: undefined,
      city: 'Orgon',
      postalCode: '13660',
      country: 'France',
      position: [43.77436674751165, 5.053544826011283],
    }),
  }),
  memberFactories.member({
    id: 'member13',
    firstName: 'Adalric',
    lastName: 'Leclercq',
    email: 'waleran11@hotmail.fr',
    phoneNumber: '+33 235524302',
    address: memberFactories.address({
      line1: 'Impasse Maurice Ravel',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.83830326803632, 5.041034093406786],
    }),
  }),
  memberFactories.member({
    id: 'member14',
    firstName: 'Camille',
    lastName: 'Leclerc',
    email: 'flavie.royer@gmail.com',
    phoneNumber: '0501301073',
    address: memberFactories.address({
      line1: 'Route des Taillades',
      city: 'Robion',
      postalCode: '84440',
      country: 'France',
      position: [43.84190627958414, 5.096788523248579],
    }),
  }),
  memberFactories.member({
    id: 'member15',
    firstName: 'Gustavine',
    lastName: 'Bourgeois',
    email: 'agla81@hotmail.fr',
    phoneNumber: '0406245335',
    address: memberFactories.address({
      line1: 'Chemin des Deux Serres',
      city: "L'Isle-sur-la-Sorgue",
      postalCode: '84800',
      country: 'France',
      position: [43.909743202546665, 5.074975368655929],
    }),
  }),
  memberFactories.member({
    id: 'member16',
    firstName: 'Aldegonde',
    lastName: 'Mathieu',
    email: 'anastase.dumas87@yahoo.fr',
    phoneNumber: '+33 386539588',
    address: memberFactories.address({
      line1: 'Chemin de Valdition',
      city: 'Orgon',
      postalCode: '13660',
      country: 'France',
      position: [43.78758732424491, 4.998062960629805],
    }),
  }),
  memberFactories.member({
    id: 'member17',
    firstName: 'Maguelone',
    lastName: 'Muller',
    email: 'fortune_aubry49@gmail.com',
    phoneNumber: '0480803418',
    address: memberFactories.address({
      line1: undefined,
      city: 'Cabannes',
      postalCode: '13440',
      country: 'France',
      position: [43.847941646662576, 4.990553429007319],
    }),
  }),
  memberFactories.member({
    id: 'member18',
    firstName: 'Athénaïs',
    lastName: 'Marchal',
    email: 'brunehilde99@hotmail.fr',
    phoneNumber: '0757625823',
    address: memberFactories.address({
      line1: 'Chemin de Velorgues à Sorguette',
      city: "L'Isle-sur-la-Sorgue",
      postalCode: '84800',
      country: 'France',
      position: [43.899487449999995, 5.064685348830858],
    }),
  }),
  memberFactories.member({
    id: 'member19',
    firstName: 'Justine',
    lastName: 'Adam',
    email: 'ambroisie90@gmail.com',
    phoneNumber: '0595701277',
    address: memberFactories.address({
      line1: 'Route des Vignères',
      city: 'Le Thor',
      postalCode: '84250',
      country: 'France',
      position: [43.88660242000077, 5.007226746804505],
    }),
  }),
  memberFactories.member({
    id: 'member20',
    firstName: 'Sandrine',
    lastName: 'Schmitt',
    email: 'tatiana_blanchard53@yahoo.fr',
    phoneNumber: '+33 188699365',
    address: memberFactories.address({
      line1: 'Place Jean Bastide',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.8389501, 5.0381476],
    }),
  }),
  memberFactories.member({
    id: 'member21',
    firstName: 'Georges',
    lastName: 'Morin',
    email: 'azale.pons37@gmail.com',
    phoneNumber: '0671121421',
    address: memberFactories.address({
      line1: "Vieille Route d'Orgon",
      city: 'Sénas',
      postalCode: '13560',
      country: 'France',
      position: [43.75841640285004, 5.077166571864914],
    }),
  }),
  memberFactories.member({
    id: 'member22',
    firstName: 'Savin',
    lastName: 'Hubert',
    email: 'agneflte.renault21@yahoo.fr',
    phoneNumber: '0193326766',
    address: memberFactories.address({
      line1: 'D 99c',
      city: 'Cavaillon',
      postalCode: '13660',
      country: 'France',
      position: [43.818846372588624, 5.037598856855298],
    }),
  }),
  memberFactories.member({
    id: 'member23',
    firstName: 'Arabelle',
    lastName: 'Rey',
    email: 'ange_guyot@hotmail.fr',
    phoneNumber: '0207475808',
    address: memberFactories.address({
      line1: "Vallon d'Auphant",
      city: 'Orgon',
      postalCode: '13660',
      country: 'France',
      position: [43.7576383, 5.037284],
    }),
  }),
  memberFactories.member({
    id: 'member24',
    firstName: 'Aubry',
    lastName: 'Paul',
    email: 'stphane_giraud63@yahoo.fr',
    phoneNumber: '+33 605101036',
    address: memberFactories.address({
      line1: 'D 900',
      city: 'Caumont-sur-Durance',
      postalCode: '84510',
      country: 'France',
      position: [43.88160642699883, 4.960726310548049],
    }),
  }),
  memberFactories.member({
    id: 'member25',
    firstName: 'Urbain',
    lastName: 'Perez',
    email: 'justin.fernandez@gmail.com',
    phoneNumber: '+33 356153629',
    address: memberFactories.address({
      line1: "Route de l'Isle-sur-la-Sorgue",
      city: 'Robion',
      postalCode: '84440',
      country: 'France',
      position: [43.8685809, 5.0832319],
    }),
  }),
  memberFactories.member({
    id: 'member26',
    firstName: 'Fantin',
    lastName: 'Collet',
    email: 'agneflte.fournier@gmail.com',
    phoneNumber: '+33 542393620',
    address: memberFactories.address({
      line1: 'Route du Pont',
      city: "Plan-d'Orgon",
      postalCode: '13750',
      country: 'France',
      position: [43.83527655807116, 5.002335796247572],
    }),
  }),
  memberFactories.member({
    id: 'member27',
    firstName: 'Geoffroy',
    lastName: 'Masson',
    email: 'vinciane_michel@yahoo.fr',
    phoneNumber: '+33 416931020',
    address: memberFactories.address({
      line1: 'Place Jean Bastide',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.8389501, 5.0381476],
    }),
  }),
  memberFactories.member({
    id: 'member28',
    firstName: 'Irina',
    lastName: 'Michel',
    email: 'amarande39@gmail.com',
    phoneNumber: '+33 701378570',
    address: memberFactories.address({
      line1: 'Chemin du Moulin du Plan',
      city: "Plan-d'Orgon",
      postalCode: '13750',
      country: 'France',
      position: [43.80626339802526, 5.006386920172841],
    }),
  }),
  memberFactories.member({
    id: 'member29',
    firstName: 'Carine',
    lastName: 'Michel',
    email: 'romo_lecomte@gmail.com',
    phoneNumber: '0309177020',
    address: memberFactories.address({
      line1: 'Autoroute du Soleil',
      city: 'Orgon',
      postalCode: '13660',
      country: 'France',
      position: [43.77054683683078, 5.068126972725469],
    }),
  }),
  memberFactories.member({
    id: 'member30',
    firstName: 'Ombline',
    lastName: 'Petit',
    email: 'clotilde.collet@hotmail.fr',
    phoneNumber: '+33 243808933',
    address: memberFactories.address({
      line1: 'Rue Jean Monnet',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.82107845, 5.042000977989762],
    }),
  }),
];

const requests = [
  requestFactories.request({
    id: 'id2',
    requesterId: 'member01',
    title: 'Garde de chats pendant noël',
    description:
      "Bonjour ! Je cherche quelqu'un qui pourrait passer nourrir et câliner mes chats du 23 au 26 décembre Eat plants, meow, and throw up because i ate plants. Kitty attack like a vicious monster. Cat dog hate mouse eat string barf pillow no baths hate everything stare out cat door then go back inside for damn that dog yet ask for petting stare at ceiling.",
    creationDate: Timestamp.from('2022-02-26T19:22'),
    lastEditionDate: Timestamp.from('2022-02-26T19:35'),
  }),
  requestFactories.request({
    id: 'id3',
    requesterId: 'member02',
    title: 'Jeu du Loup Garou',
    description:
      "Bonjour. J'organise l'anniversaire de mon fils ce samedi, j'aimerais avoir le jeu du loup garou. Est ce que quelqu'un pourrait me le prêter ? Merci",
    creationDate: Timestamp.from('2022-04-02T14:00'),
    lastEditionDate: Timestamp.from('2022-04-02T14:00'),
  }),
];

main().catch(console.error);

async function main() {
  const orm = await MikroORM.init({
    ...mikroOrmConfig,
    allowGlobalContext: true,
  });

  container.bind(TOKENS.orm).toConstant(orm);

  const requestRepository = container.get(TOKENS.requestRepository);
  const memberRepository = container.get(TOKENS.memberRepository);

  for (const member of members) {
    await memberRepository.save(member);
  }

  for (const request of requests) {
    await requestRepository.save(request);
  }

  await orm.close(true);
}
