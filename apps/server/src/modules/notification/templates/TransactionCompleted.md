---
title: Échange avec {transaction.payer.name}
content: Vous avez reçu {currencyAmount} pour l'échange : {transaction.description}
link: {appBaseUrl}/profile/transactions?transactionId={transaction.id}
subject: Vous avez reçu {currencyAmount} pour l'échange : {transaction.description}
---

Bonjour {member.firstName},

**{transaction.payer.name}** {transaction.payer.id === transaction.creatorId ? 'vous a envoyé' : 'a accepté votre demande de'} **{currencyAmount}** pour l'échange : [{transaction.description}]({appBaseUrl}/profile/transactions?transactionId={transaction.id}).
