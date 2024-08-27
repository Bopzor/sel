---
title: Nouveau commentaire sur {isRequester ? 'votre demande' : 'la demande'} "{request.title}"
content: {comment.author.name} : {comment.body.text}
link: {appBaseUrl}/requests/{request.id}
subject: Commentaire de {comment.author.name} sur {isRequester ? 'votre demande' : 'la demande'} "{request.title}"
---

Bonjour {member.firstName},

**{comment.author.name}** a écrit un commentaire sur {isRequester ? 'votre demande' : 'la demande'} [{request.title}]({appBaseUrl}/requests/{request.id}) :

> {verbatim(comment.body)}
