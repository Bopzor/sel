---
title: {notification.title}
content: {notification.content.text}
link: {appBaseUrl}/events/{event.id}
subject: {notification.title}
---

Bonjour {member.firstName},

> {verbatim(notification.content)}

Ce message vous a été envoyé par {sender.name} et concerne l'événement [{event.title}]({appBaseUrl}/events/{event.id}).
