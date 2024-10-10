---
title: Nouveau commentaire sur {isOrganizer ? 'votre événement' : "l'événement"} "{event.title}"
content: {comment.author.name} : {comment.body.text}
link: {appBaseUrl}/events/{event.id}
subject: Commentaire de {comment.author.name} sur {isOrganizer ? 'votre événement' : "l'événement"} "{event.title}"
---

Bonjour {member.firstName},

**{comment.author.name}** a écrit un commentaire sur {isOrganizer ? 'votre événement' : "l'événement"} [{event.title}]({appBaseUrl}/events/{event.id}) :

> {verbatim(comment.body)}
