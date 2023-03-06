import { container } from '../app/container';
import { Timestamp } from '../common/timestamp.value-object';
import { create as memberFactories } from '../modules/members/factories';
import { InMemoryMemberRepository } from '../modules/members/in-memory-member.repository';
import { create as requestFactories } from '../modules/requests/factories';
import { InMemoryRequestRepository } from '../modules/requests/in-memory-request.repository';
import { TOKENS } from '../tokens';

const requestRepository = container.get(TOKENS.requestRepository) as InMemoryRequestRepository;
const memberRepository = container.get(TOKENS.memberRepository) as InMemoryMemberRepository;

memberRepository.add(
  memberFactories.member({
    id: 'nils',
    email: 'nils@nilscox.dev',
    firstName: 'nils',
    lastName: 'cox',
    phoneNumber: '06 60 06 60 06',
  })
);

requestRepository.add(
  requestFactories.request({
    id: 'id2',
    requesterId: 'nils',
    title: 'Garde de chats pendant noël',
    description:
      "Bonjour ! Je cherche quelqu'un qui pourrait passer nourrir et câliner mes chats du 23 au 26 décembre Eat plants, meow, and throw up because i ate plants. Kitty attack like a vicious monster. Cat dog hate mouse eat string barf pillow no baths hate everything stare out cat door then go back inside for damn that dog yet ask for petting stare at ceiling.",
    creationDate: Timestamp.from('2022-02-26T19:22'),
    lastEditionDate: Timestamp.from('2022-02-26T19:35'),
  })
);

requestRepository.add(
  requestFactories.request({
    id: 'id3',
    requesterId: 'nils',
    title: 'Jeu du Loup Garou',
    description:
      "Bonjour. J'organise l'anniversaire de mon fils ce samedi, j'aimerais avoir le jeu du loup garou. Est ce que quelqu'un pourrait me le prêter ? Merci",
    creationDate: Timestamp.from('2022-04-02T14:00'),
    lastEditionDate: Timestamp.from('2022-04-02T14:00'),
  })
);
