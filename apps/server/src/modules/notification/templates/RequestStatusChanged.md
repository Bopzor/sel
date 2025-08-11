---
title: {request.requester.name} a {request.status === 'canceled' ? 'annulé' : 'clôturé'} sa demande
content: {request.title}
link: {appBaseUrl}/requests/{request.id}
subject: {request.requester.name} a {request.status === 'canceled' ? 'annulé' : 'clôturé'} sa demande "{request.title}"
---

Bonjour {member.firstName},

**{request.requester.name}** a {request.status === 'canceled' ? 'annulé' : 'clôturé'} sa demande [{request.title}]({appBaseUrl}/requests/{request.id})
