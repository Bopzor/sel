---
title: Nouveau commentaire sur {isPublisher ? 'votre information' : 'l\'information'} "{information.title}"
content: {comment.author.name} : {comment.body.text}
link: {appBaseUrl}/information/{information.id}
subject: Commentaire de {comment.author.name} sur {isPublisher ? 'votre information' : 'l\'information'} "{information.title}"
---

Bonjour {member.firstName},

**{comment.author.name}** a écrit un commentaire sur {isPublisher ? 'votre information' : 'l\'information'} [{information.title}]({appBaseUrl}/information/{information.id}) :

> {verbatim(comment.body)}
