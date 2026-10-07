---
name: upgrade-deps
description: Met à jour les dépendances par groupes, vérifie que l'application marche, puis pousse
---

Lance `yarn outdated` pour lister les paquets à mettre à jour, puis classe-les
en trois groupes : patch, minor, major. Un paquet en 0.x qui change de version
mineure compte comme major.

Traite les groupes dans cet ordre, avec un commit par étape :

1. Tous les patch ensemble.
2. Tous les minor ensemble.
3. Chaque major séparément, un paquet à la fois.

Pour mettre à jour un paquet, utilise `yarn upgrade <paquet>@<version>`.
N'utilise pas `yarn upgrade-interactive`, qui demande une saisie au clavier.

Après chaque étape, avant de committer :

- builde le projet avec `yarn build` ;
- démarre l'application avec `yarn start` et vérifie que la page d'accueil
  (http://localhost:3000) s'affiche sans erreur dans la console ;
- arrête le serveur.

Si une étape casse quelque chose, essaie de corriger. Si tu n'y arrives pas,
annule les changements de cette étape, note le paquet fautif et passe à la
suivante.

À la fin, pousse sur main les commits des étapes réussies, puis résume ce qui
a été mis à jour et ce qui a été abandonné, avec la raison.
