# Chapitre 1 — Signaux et systèmes


> [!note] L'idée du chapitre en 30 secondes
> C'est un chapitre de **vocabulaire**. Il pose les mots utilisés dans tout le reste du cours :
> - un **système** transforme des **signaux d'entrée** en un **signal de sortie** ;
> - les signaux se rangent par familles : périodiques, à énergie finie, causaux, échantillonnés ;
> - il existe 5 **signaux types** pour tester un système : Dirac, échelon, rampe, parabole, sinusoïde ;
> - la **convolution** est l'opération qui relie entrée et sortie ;
> - on n'étudiera que les **SLIT** : systèmes linéaires, invariants dans le temps et causaux.

---

## 1.1 Présentation : signal et système

L'exemple du prof est un **chauffe-eau à gaz** :
- la température de sortie $\theta_s$ dépend de la température voulue $\theta_v$ (le réglage), de la température de l'eau qui arrive $\theta_e$, et du chauffe-eau lui-même ;
- $\theta_v$, $\theta_e$ et $\theta_s$ varient dans le temps : ce sont des **signaux temporels** ;
- le chauffe-eau est le **système** : il fait évoluer la sortie $\theta_s$ en fonction des entrées $\theta_e$ et $\theta_v$.

![](contenu/automatique/cours/img/chauffe_eau_P3Pp.jpg)

Un système peut avoir plusieurs sorties : ici le débit de gaz $q_g$ en est aussi une. **Dans tout le cours, on n'étudie que des systèmes à une seule sortie.**

## 1.2 Les signaux d'entrée : commande et perturbations

On distingue deux sortes d'entrées :
- la **commande** (ou **consigne**) $e$ : ce qu'on règle volontairement pour faire évoluer la sortie. Ici, $\theta_v$ ;
- les **perturbations** $p_1, p_2\dots$ : ce qui fait bouger la sortie **sans qu'on le veuille**. Ici, $\theta_e$ : si l'eau du réseau arrive plus froide, l'eau chaude sort plus froide.

![](contenu/automatique/cours/img/signaux_entree_T2tK.jpg)

Deux types d'études en découlent :

| Étude | On regarde la sortie quand… | Exemple chauffe-eau |
|---|---|---|
| **Pilotage** (poursuite) | on modifie la **commande** | je passe la consigne de 40 °C à 50 °C : la sortie suit-elle, et en combien de temps ? |
| **Régulation** | une **perturbation** change | l'eau arrive plus froide : la sortie reste-t-elle à 40 °C ? |

## 1.3 Les familles de signaux

### 1.3.1 Signaux périodiques

$x$ est périodique s'il existe $t_0$ tel que $x(t+t_0)=x(t)$ pour tout $t$. La **période** $T$ est le plus petit $t_0>0$ qui marche (tous les autres sont des multiples $kT$).

![](contenu/automatique/cours/img/signal_periodique_0BlX.jpg)

Les trois grandeurs équivalentes, à ne pas confondre :

| Grandeur | Unité | Sens | Relations |
|---|---|---|---|
| période $T$ | s | durée d'un motif | $T=\dfrac1f=\dfrac{2\pi}\omega$ |
| fréquence $f$ | Hz | nombre de motifs par seconde | $f=\dfrac1T$ |
| pulsation $\omega$ | s⁻¹ ou rad·s⁻¹ | « vitesse angulaire » | $\omega=2\pi f=\dfrac{2\pi}T$ |

Exemple : le secteur à 50 Hz a $T=20$ ms et $\omega=2\pi\times50\approx314$ rad/s.

### 1.3.2 Signaux à énergie finie

- **Puissance instantanée normalisée** : $p(t)=x^2(t)$. C'est la puissance que dissiperait une résistance de $1\ \Omega$ si $x$ était la tension à ses bornes (ou le courant qui la traverse). « Normalisée » veut dire qu'on oublie la vraie valeur de $R$.
- **Énergie normalisée** : $E=\displaystyle\int_{-\infty}^{+\infty}x^2(t)\,dt$.
- Le signal est **à énergie finie** si cette intégrale donne un nombre fini. En gros, c'est un signal qui finit par s'éteindre.

**Exemple 1** : $x(t)=A\,e^{-|t|/\tau}$ est à énergie finie. Le prof écrit « après calculs », voici le détail. Le signal est pair, donc on calcule deux fois l'intégrale sur $[0,+\infty[$ :
$$E=2\int_0^{+\infty}A^2e^{-2t/\tau}dt=2A^2\left[-\frac\tau2e^{-2t/\tau}\right]_0^{+\infty}=2A^2\cdot\frac\tau2=\boxed{\tau A^2}$$

**Exemple 2** : $A\cos(\omega t+\varphi)$ n'est **pas** à énergie finie. Il oscille indéfiniment, donc chaque période ajoute la même énergie et l'intégrale diverge.

> [!tip] Pourquoi c'est utile
> La **transformée de Fourier** (§2.1.2) est définie pour les signaux à énergie finie, et la **série de Fourier** (§2.1.1) pour les signaux périodiques. Savoir dans quelle famille est un signal, c'est savoir quel outil utiliser.

### 1.3.3 Signaux causaux

$$x\text{ causal}\iff x(t)=0\quad\forall t<0$$
Le signal « démarre » à $t=0$ : rien ne se passe avant.

![](contenu/automatique/cours/img/signaux_causaux_sJCW.jpg)

> [!important] Remarque importante du prof
> Si un signal vaut $x_0\neq0$ avant $t=0$ (par exemple une température qui était à 20 °C), il n'est pas causal. On travaille alors sur sa **variation** autour de la valeur initiale :
> $$\tilde x=x-x_0$$
> qui, elle, est causale. C'est ce qu'on fait toujours en automatique : on étudie des **écarts** par rapport à un point de repos.

### 1.3.4 Signaux échantillonnés

On ne garde que les valeurs de $x$ aux instants $t=nT_e$ ($n\in\mathbb Z$) :
$$x_n=x(nT_e)$$
La suite $(x_n)$ est le signal **échantillonné** à la période $T_e$, avec $f_e=\dfrac1{T_e}$ la fréquence d'échantillonnage. C'est un signal **discret**, dit « numérique » : c'est ce que voit un automate ou un PC.

La condition que doit respecter $f_e$ pour que l'échantillonnage soit correct est le **théorème de Shannon** → [§2.1.5](cours.html?matiere=automatique&chapitre=ch2-modelisation-signaux#2-1-5-shannon).

## 1.4 Les signaux types

On teste un système en lui envoyant des entrées simples et connues. Ces cinq-là servent tout le temps :

### 1.4.1 L'impulsion de Dirac $\delta$

$$\delta(t)=0\ \text{pour}\ t\neq0,\qquad\delta(0)\to+\infty,\qquad\int_{-\infty}^{+\infty}\delta(t)\,dt=1$$
Un « pic » infiniment fin, infiniment haut, et d'**aire 1**. Ce n'est pas une vraie fonction mais une *distribution* (pas étudié dans ce cours). On la dessine par une flèche de hauteur 1.

![](contenu/automatique/cours/img/impulsion_dirac_kNwS.jpg)

**Comment se la représenter** : on part de l'impulsion approchée $\delta_a$, une porte de largeur $t_0$ et de hauteur $\frac1{t_0}$ :

![](contenu/automatique/cours/img/impulsion_approchee_kNwS.jpg)

Son aire vaut toujours $t_0\times\frac1{t_0}=1$. Quand $t_0\to0$, elle devient de plus en plus fine et haute : $\delta_a\xrightarrow[t_0\to0]{}\delta$.

Sens physique : un **choc**, un coup de marteau. La réponse du système à $\delta$ s'appelle la **réponse impulsionnelle**.

### 1.4.2 L'échelon unitaire $u$ (Heaviside, aussi noté $\Gamma$ ou $\Upsilon$)

$$u(t)=0\ \text{pour}\ t<0,\qquad u(t)=1\ \text{pour}\ t>0$$

![](contenu/automatique/cours/img/echelon_unitaire_YsWw.jpg)

Sens physique : **on allume** d'un coup, par exemple on passe la consigne de 0 à 1. La réponse du système s'appelle la **réponse indicielle**. C'est le test le plus utilisé en automatique.

**Lien avec le Dirac.** On approche $u$ par une montée en pente de durée $t_0$ (l'échelon approché $u_a$) :

![](contenu/automatique/cours/img/echelon_approche_YsWw.jpg)

La pente de $u_a$ vaut $\frac1{t_0}$ pendant $t_0$ et 0 ailleurs : c'est exactement $\delta_a$. Donc $\delta_a=\frac{du_a}{dt}$, et quand $t_0\to0$ :
$$\boxed{\delta=\frac{du}{dt}}$$
(au sens des distributions). C'est logique : l'échelon ne varie qu'en $t=0$, et il varie infiniment vite.

### 1.4.3 La rampe unitaire $r$

$$r(t)=0\ \text{pour}\ t\le0,\qquad r(t)=t\ \text{pour}\ t\ge0\qquad\Longrightarrow\qquad\boxed{u=\frac{dr}{dt}}$$

![](contenu/automatique/cours/img/rampe_unitaire_XtAi.jpg)

Sens physique : une consigne qui augmente régulièrement. Par exemple un four qu'on veut faire monter de 5 °C/min, ou une antenne qui suit un satellite.

### 1.4.4 La parabole $f$

$$f(t)=0\ \text{pour}\ t\le0,\qquad f(t)=\tfrac12t^2\ \text{pour}\ t\ge0\qquad\Longrightarrow\qquad\boxed{r=\frac{df}{dt}}$$

![](contenu/automatique/cours/img/parabole_oROE.jpg)

Sens physique : une consigne qui **accélère** (vitesse qui augmente régulièrement).

> [!tip] La chaîne à retenir
> $$\text{parabole}\xrightarrow{\ \frac{d}{dt}\ }\text{rampe}\xrightarrow{\ \frac{d}{dt}\ }\text{échelon}\xrightarrow{\ \frac{d}{dt}\ }\text{Dirac}$$
> Chaque signal est la dérivée du précédent. En Laplace ([§2.2](cours.html?matiere=automatique&chapitre=ch2-modelisation-signaux)), dériver revient à multiplier par $p$, et on aura $\frac1{p^3}\to\frac1{p^2}\to\frac1p\to1$.

### 1.4.5 La sinusoïde

$$f(t)=\cos(\omega t+\varphi)=\cos\big(\omega(t+t_0)\big),\qquad\varphi=\omega t_0$$
- $\omega$ : pulsation (s⁻¹ ou rad·s⁻¹), avec $\omega=2\pi f=\frac{2\pi}T$ ;
- $\varphi$ : **déphasage** (rad). Il correspond à un décalage dans le temps $t_0=\frac\varphi\omega$.

![](contenu/automatique/cours/img/sinusoide_80Zr.jpg)

Passer du cos au sin :
$$\cos(\omega t+\varphi)=\sin\!\left(\omega t+\varphi+\tfrac\pi2\right)\qquad\sin(\omega t+\varphi)=\cos\!\left(\omega t+\varphi-\tfrac\pi2\right)$$

Sens physique : tester le système **fréquence par fréquence**, ce qui mène au diagramme de Bode (ch. 3).

## 1.5 Le produit de convolution

### Définition (signaux analogiques)

$$\boxed{(x_1*x_2)(t)=\int_{-\infty}^{+\infty}x_1(\tau)\,x_2(t-\tau)\,d\tau=\int_{-\infty}^{+\infty}x_1(t-\tau)\,x_2(\tau)\,d\tau}$$

**Si les deux signaux sont causaux**, les bornes se resserrent :
- $x_1(\tau)=0$ pour $\tau<0$ ;
- $x_2(t-\tau)=0$ pour $\tau>t$.

Il ne reste donc que l'intervalle $[0,t]$ :
$$x(t)=\int_0^tx_1(\tau)\,x_2(t-\tau)\,d\tau$$

### Ce que ça veut dire (la figure du prof)

![](contenu/automatique/cours/img/signification_convolution_iIu4.jpg)

Pour calculer $(x_1*x_2)(t)$ à un instant $t$ donné, on procède en 4 gestes :
1. on **retourne** $x_2$ : $x_2(\tau)$ devient $x_2(-\tau)$ (miroir par rapport à l'axe vertical) ;
2. on la **décale** de $t$ : $x_2(t-\tau)$ ;
3. on **multiplie** point par point par $x_1(\tau)$ ;
4. on prend l'**aire** du produit, la zone violette sur la figure. Ce nombre est la valeur de la convolution en $t$.

On recommence pour chaque $t$, en faisant glisser $x_2$ retournée le long de l'axe.

> [!tip] Pourquoi c'est central
> La sortie d'un SLIT est la convolution de l'entrée par la réponse impulsionnelle : $s=h*e$. La sortie à l'instant $t$ « mélange » toutes les entrées passées, pondérées par la mémoire du système $h$. C'est lourd à calculer à la main, mais Fourier et Laplace la transforment en **simple produit** ([§2.1.3](cours.html?matiere=automatique&chapitre=ch2-modelisation-signaux#2-1-3-proprietes-de-la-transformee-de-fourier)).

**Petit exemple de calcul** : $u*u$ (échelon convolé avec échelon). Les deux sont causaux, et $u(\tau)u(t-\tau)=1$ pour $0\le\tau\le t$ :
$$(u*u)(t)=\int_0^t1\,d\tau=t=r(t)$$
Convoler par un échelon revient donc à **intégrer**.

### Le Dirac est l'élément neutre

$$x*\delta=x\qquad\qquad x*\delta(t-t_0)=x(t-t_0)$$
Convoler par $\delta$ ne change rien, et convoler par un Dirac retardé de $t_0$ **retarde** le signal de $t_0$.
Conséquence : envoyer $\delta$ dans un système donne $s=h*\delta=h$. C'est bien pour ça que $h$ s'appelle la **réponse impulsionnelle**.

### Version échantillonnée

Mêmes formules, avec des sommes à la place des intégrales :
$$\boxed{x_n=\sum_{i=-\infty}^{+\infty}x_{1i}\,x_{2(n-i)}}\qquad\text{causaux : }x_n=\sum_{i=0}^{n}x_{1i}\,x_{2(n-i)}$$
L'impulsion de Dirac discrète vaut $\delta_0=1$ et $\delta_n=0$ pour $n\neq0$ (un vrai « 1 », sans infini). Mêmes propriétés : $(x_n)*(\delta_n)=(x_n)$ et $(x_n)*(\delta_{n-n_0})=(x_{n-n_0})$ (retard de $n_0$ échantillons).

## 1.6 Les catégories de systèmes

### 1.6.1 Systèmes linéaires

Si $e_1$ donne $s_1$ et $e_2$ donne $s_2$, le système est **linéaire** si et seulement si
$$e=a\,e_1+b\,e_2\quad\text{donne}\quad s=a\,s_1+b\,s_2\qquad(a,b)\in\mathbb R^2$$

![](contenu/automatique/cours/img/systeme_lineaire_1_dvNC.jpg)
![](contenu/automatique/cours/img/systeme_lineaire_2_dvNC.jpg)
![](contenu/automatique/cours/img/systeme_linaire_dvNC.jpg)

En clair : doubler l'entrée double la sortie, et la réponse à une somme est la somme des réponses (**superposition**). Avantage énorme : on peut étudier séparément l'effet de la commande et celui de chaque perturbation, puis additionner.
Contre-exemples réels : saturation (une vanne ne s'ouvre pas à plus de 100 %), frottements secs, seuils.

### 1.6.2 Systèmes causaux

Un système est **causal** si sa réponse à **toute entrée causale** est causale.

![](contenu/automatique/cours/img/systeme_causal_VP6H.jpg)

En clair : **l'effet ne peut pas précéder la cause**. Le système ne peut pas répondre avant d'avoir été excité. Tout système physique réel qui dépend du temps est causal.

### 1.6.3 Systèmes stables

Un système est **stable** si sa réponse à toute entrée **bornée** est **bornée**.

![](contenu/automatique/cours/img/systeme_e_s_faRP.jpg)

Les trois exemples du prof (réponse à l'échelon unitaire $e=u$), avec la résolution qu'il ne détaille pas :

**Exemple 1 : $e=\dfrac{ds}{dt}+s$ → stable.**
Pour $t>0$ : $s'+s=1$, avec $s(0)=0$, donc $s(t)=1-e^{-t}$. La sortie monte et se stabilise à 1 : elle est bornée.
![](contenu/automatique/cours/img/stable_echelon_faRP.jpg)

**Exemple 2 : $e=\dfrac{ds}{dt}-s$ → instable.**
$s'-s=1$, avec $s(0)=0$, donc $s(t)=e^{t}-1$. Elle part à l'infini.
![](contenu/automatique/cours/img/instable_echelon_exp_faRP.jpg)

**Exemple 3 : $e=\dfrac1{\omega_0^2}\dfrac{d^2s}{dt^2}-\dfrac{2\xi}{\omega_0}\dfrac{ds}{dt}+s$** ($\omega_0=1$ s⁻¹, $\xi=0{,}09$) **→ instable.**
Le terme en $\frac{ds}{dt}$ a un signe **moins** : c'est un amortissement négatif. Au lieu de freiner les oscillations, il les entretient et les amplifie. La sortie oscille de plus en plus fort.
![](contenu/automatique/cours/img/instable_echelon_osc_faRP.jpg)

> [!tip] Ce qu'on voit déjà sur ces exemples
> C'est le **signe** des termes de l'équation différentielle qui décide de la stabilité. Comparer l'exemple 1 ($+s$) et l'exemple 2 ($-s$). On le formalisera avec les **pôles** de la fonction de transfert (ch. 3) : stable ⇔ pôles à partie réelle négative.

### 1.6.4 Systèmes invariants dans le temps

Si l'entrée $e(t)$ donne $s(t)$, alors l'entrée décalée $e(t-t_0)$ donne la **même** sortie décalée $s(t-t_0)$.

![](contenu/automatique/cours/img/systeme_invariant_temps_mZmj.jpg)

En clair : le système **ne vieillit pas**. Faire l'essai aujourd'hui ou demain donne le même résultat. Mathématiquement, les coefficients de l'équation sont **constants**.

### 1.6.5 Les SLIT (causaux, linéaires, invariants dans le temps)

C'est la seule catégorie étudiée dans la suite du cours.

> [!important] Remarque très importante du prof
> Un SLIT est décrit par une **équation différentielle linéaire à coefficients constants** reliant l'entrée et la sortie.
> Il est **causal** quand l'ordre de dérivation de la sortie est **supérieur ou égal** à celui de l'entrée.

**Exemple du prof** :
$$\tau\frac{de}{dt}+e=\frac1{\omega_0^2}\frac{d^2s}{dt^2}+\frac{2\xi}{\omega_0}\frac{ds}{dt}+s$$
- linéaire : uniquement des $e$, $s$ et leurs dérivées, sans carré ni produit ;
- invariant : $\tau$, $\omega_0$, $\xi$ sont des constantes ;
- causal : la sortie est dérivée 2 fois, l'entrée 1 fois, et $2\ge1$.

C'est donc un SLIT causal.

Intuition pour la condition d'ordre : si l'entrée était plus dérivée que la sortie, la sortie devrait réagir à des variations « plus rapides que l'instantané », ce qu'aucun système physique ne sait faire.

---

## À retenir

- Entrées = **commande** (voulue) + **perturbations** (subies). Étude en **pilotage** ou en **régulation**.
- $\omega=2\pi f=\frac{2\pi}T$.
- Énergie $E=\int x^2dt$ : finie pour une impulsion, infinie pour une sinusoïde.
- Causal = nul avant 0. On étudie les **écarts** $x-x_0$.
- Signaux types : parabole → rampe → échelon → Dirac, chacun dérivée du précédent.
- Convolution : retourner, décaler, multiplier, prendre l'aire. $\delta$ est l'élément neutre, d'où $s=h*e$.
- SLIT = EDL à coefficients constants ; causal si ordre(sortie) ≥ ordre(entrée).
