---
title: Réponse à votre demande {request.title}
content: {request.title}
link: {appBaseUrl}/requests/{request.id}
subject: Réponse à votre demande {request.title}
---

Bonjour {member.firstName},

**{respondent.name}** {answer === 'positive' ? 'a répondu positivement' : 'ne peut finalement pas répondre'} à votre demande [{request.title}]({appBaseUrl}/requests/{request.id}).
