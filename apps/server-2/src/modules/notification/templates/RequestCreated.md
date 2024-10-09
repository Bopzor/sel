---
title: Demande de {request.requester.name}
content: {request.title}
link: {appBaseUrl}/requests/{request.id}
subject: Demande de {request.requester.name} : {request.title}
---

Bonjour {member.firstName},

**{request.requester.name}** a publié une nouvelle demande : [{request.title}]({appBaseUrl}/requests/{request.id})

> {verbatim(request.body)}
