# Chapitre 2 — Modélisation des signaux


> [!note] L'idée du chapitre en 30 secondes
> Un signal peut se regarder de deux façons :
> - **en temps** : la courbe $s(t)$ qu'on voit à l'oscilloscope ;
> - **en fréquence** : de quelles sinusoïdes il est fait, et avec quelle amplitude. C'est le **spectre**, comme les barres d'un égaliseur audio.
>
> Tout le §2.1 sert à **une seule conclusion**, le théorème de Shannon : *à quelle vitesse faut-il échantillonner un signal pour ne rien perdre ?* Chaque sous-partie apporte une brique :
>
> | § | Brique | Sert à… |
> |---|---|---|
> | 2.1.1 | Série de Fourier | calculer le spectre du peigne de Dirac |
> | 2.1.2 | Transformée de Fourier | parler du spectre d'un signal quelconque |
> | 2.1.3 | Propriétés | calculer sans refaire les intégrales |
> | 2.1.4 | Modulation | « multiplier par un cos décale le spectre » |
> | 2.1.5 | Shannon | on assemble tout |

---

## 2.1 Étude fréquentielle

### 2.1.1 Signaux périodiques : la série de Fourier

**L'idée.** Un signal qui se répète (période $T$) est une somme de sinusoïdes dont les fréquences sont des multiples de $f_0 = 1/T$ : $f_0$ (le fondamental), $2f_0$, $3f_0$… (les harmoniques). Plus une constante, la valeur moyenne.

#### Forme trigonométrique (celle qu'on calcule à la main)

> [!important] À savoir par cœur
> $$s(t)=a_0+\sum_{n=1}^{+\infty}\big[a_n\cos(n\omega t)+b_n\sin(n\omega t)\big]\qquad \omega=\frac{2\pi}{T}$$
> $$a_0=\frac1T\int_{t_0}^{t_0+T}s(t)\,dt\qquad a_n=\frac2T\int_{t_0}^{t_0+T}s(t)\cos(n\omega t)\,dt\qquad b_n=\frac2T\int_{t_0}^{t_0+T}s(t)\sin(n\omega t)\,dt$$

Comment le lire :
- $a_0$ = **valeur moyenne** du signal (facteur $\frac1T$) ; $a_n$ et $b_n$ ont un facteur $\frac2T$. Ne pas mélanger.
- $t_0$ est **libre** : on intègre sur n'importe quelle période. On choisit celle qui simplifie les calculs, souvent $[-T/2, T/2]$ pour profiter des symétries.
- $a_0, a_n, b_n$ sont des **constantes** réelles, ils ne dépendent pas de $t$.

> [!tip] Raccourcis de parité (gagnent beaucoup de temps)
> - $s$ **paire** (symétrique par rapport à l'axe vertical) → tous les $b_n=0$, on ne garde que des cos.
> - $s$ **impaire** (symétrique par rapport à l'origine) → $a_0=0$ et tous les $a_n=0$, on ne garde que des sin.

**Variante en $\theta=\omega t$** (le prof la donne aussi) : mêmes coefficients, on intègre sur $2\pi$ :
$$a_0=\frac1{2\pi}\int_{\theta_0}^{\theta_0+2\pi}s(\theta)\,d\theta\qquad a_n=\frac1\pi\int_{\theta_0}^{\theta_0+2\pi}s(\theta)\cos(n\theta)\,d\theta\qquad b_n=\frac1\pi\int_{\theta_0}^{\theta_0+2\pi}s(\theta)\sin(n\theta)\,d\theta$$
C'est exactement la convention du cours de maths. On utilise celle avec laquelle on est le plus à l'aise.

#### Forme exponentielle (celle qui sert à tracer les spectres)

$$s(t)=\sum_{n=-\infty}^{+\infty}c_n\,e^{in\omega t}\qquad c_n=\frac1T\int_0^Ts(t)\,e^{-in\omega t}\,dt,\quad c_n\in\mathbb C$$

**Lien entre les deux formes** (en développant $e^{-in\omega t}=\cos-i\sin$) :
$$\boxed{c_n=\frac{a_n}{2}-i\,\frac{b_n}{2}}$$
Pourquoi des $n$ négatifs ? Un cosinus réel s'écrit $\cos x=\frac{e^{ix}+e^{-ix}}2$. Chaque sinusoïde réelle compte donc pour **deux** raies, une en $+nf_0$ et une en $-nf_0$, chacune de moitié. Les fréquences négatives sont une astuce de calcul et n'ont pas de sens physique.

#### Le spectre

On associe à chaque $c_n$ la fréquence $f=nf_0$, et on écrit $c_n=|c_n|\,e^{i\varphi}$ :
- **spectre d'amplitude** : $|c(f)|$ en fonction de $f$ ;
- **spectre de phase** : $\varphi(f)=\arg c(f)$ en fonction de $f$.

Entre les multiples de $f_0$, il n'y a rien. Le spectre d'un signal périodique est donc un **spectre de raies** (discret).

Pour un signal réel : $c_{-n}=\overline{c_n}$, donc **amplitude paire** et **phase impaire**. On se contente souvent du spectre d'amplitude : il ne contient pas toute l'information, mais il suffit pour le traitement du signal.

#### L'exemple du cours : le train d'impulsions $Ш_a$ (à bien comprendre, il ressert pour Shannon)

Des impulsions rectangulaires de largeur $t_0$ et de hauteur $\frac1{t_0}$, donc d'**aire 1**, répétées toutes les $T$ :

![](contenu/automatique/cours/img/peigne_approche_s6PW.jpg)

**Calcul de $c_n$** (le prof écrit « … », voici le détail). On intègre sur $[-T/2,T/2]$, où le signal vaut $\frac1{t_0}$ sur $[-t_0/2, t_0/2]$ et 0 ailleurs :
$$c_n=\frac1T\int_{-t_0/2}^{t_0/2}\frac1{t_0}e^{-in\frac{2\pi}Tt}dt=\frac1{Tt_0}\left[\frac{e^{-in\frac{2\pi}Tt}}{-in\frac{2\pi}T}\right]_{-t_0/2}^{t_0/2}=\frac1{Tt_0}\cdot\frac{e^{in\pi t_0/T}-e^{-in\pi t_0/T}}{in\frac{2\pi}T}$$
Avec $e^{ix}-e^{-ix}=2i\sin x$ :
$$c_n=\frac1{Tt_0}\cdot\frac{2i\sin(n\pi t_0/T)}{in\,2\pi/T}=\frac{\sin(n\pi t_0/T)}{n\pi t_0}=\boxed{\frac1T\,\mathrm{sinc}\!\left(\frac{n\pi t_0}T\right)}\qquad\mathrm{sinc}(x)=\frac{\sin x}x$$

**Spectre pour $t_0=T/4$** : $c_n=\frac1T\mathrm{sinc}(n\pi/4)$.

![](contenu/automatique/cours/img/spectre_amplitude_s6PW.jpg)

Ce qu'il faut voir sur la figure :
- les raies sont espacées de $f_0$ ;
- leurs hauteurs suivent une **enveloppe en sinc** qui vaut $\frac1T$ en $f=0$ ;
- certaines raies sont nulles, en $\pm4f_0, \pm8f_0\dots$ : c'est là que $\sin(n\pi/4)=0$.

![](contenu/automatique/cours/img/spectre_phase_s6PW.jpg)

La phase vaut 0 quand le sinc est positif et $\pm\pi$ quand il est négatif (un nombre réel négatif a pour argument $\pi$). Elle est impaire.

> [!success] Le résultat qui servira pour Shannon
> Si les impulsions deviennent infiniment fines ($t_0\to0$), $\mathrm{sinc}\to1$ et **toutes les raies valent $\frac1T$**. La limite de $Ш_a$ est le **peigne de Dirac** $Ш$. Son spectre est un peigne de raies toutes égales.

---

### 2.1.2 Signaux à énergie finie : la transformée de Fourier

**L'idée.** Un signal qui ne se répète pas (une impulsion, un bip) n'a pas de « fréquence de base ». Il contient toutes les fréquences en continu. Les raies se resserrent jusqu'à former une courbe.

> [!important] À savoir par cœur
> $$S(f)=\int_{-\infty}^{+\infty}s(t)\,e^{-i2\pi ft}\,dt\qquad\text{(transformée)}$$
> $$s(t)=\int_{-\infty}^{+\infty}S(f)\,e^{i2\pi ft}\,df\qquad\text{(inverse)}$$

Comparaison avec la série de Fourier : $c_n$ (un nombre par harmonique) devient $S(f)$ (une valeur pour chaque fréquence). La somme $\sum$ devient une intégrale $\int$. On trace toujours un spectre d'amplitude $|S(f)|$ et un spectre de phase $\arg S(f)$.

« Énergie finie » signifie $\int s(t)^2dt<\infty$ : en gros, un signal qui finit par s'éteindre.

#### L'exemple du cours : l'impulsion approchée $\delta_a$

Une seule porte de largeur $t_0$ et de hauteur $\frac1{t_0}$ (aire 1), centrée en 0. Quand $t_0\to0$, elle tend vers le Dirac $\delta$.

![](contenu/automatique/cours/img/impulsion_approchee_KGeE.jpg)

**Calcul** (même méthode qu'au-dessus) :
$$D_a(f)=\int_{-t_0/2}^{t_0/2}\frac1{t_0}e^{-i2\pi ft}dt=\frac1{t_0}\cdot\frac{e^{i\pi ft_0}-e^{-i\pi ft_0}}{i2\pi f}=\frac{\sin(\pi ft_0)}{\pi ft_0}=\boxed{\mathrm{sinc}(\pi ft_0)}$$

![](contenu/automatique/cours/img/spectre_amplitude_delta_a_KGeE.jpg)

![](contenu/automatique/cours/img/spectre_phase_delta_a_KGeE.jpg)

Lecture des figures ($t_0=1$ s) :
- amplitude max = 1 en $f=0$ (c'est l'aire du signal) ;
- zéros en $f=\pm\frac1{t_0},\pm\frac2{t_0}\dots$ ;
- phase 0 ou $\pm\pi$ selon le signe du sinc.

> [!tip] La règle à retenir : court en temps ⇔ large en fréquence
> Le premier zéro est en $\frac1{t_0}$. Plus l'impulsion est **courte**, plus son spectre est **large**. À la limite $t_0\to0$, on obtient $\mathcal F(\delta)=1$ : un Dirac contient toutes les fréquences avec le même poids.

Remarque : le spectre de $Ш_a$ (§2.1.1) est exactement ce sinc, **échantillonné** tous les $f_0$. Répéter un motif en temps revient à ne garder que des raies en fréquence.

---

### 2.1.3 Propriétés de la transformée de Fourier

Ces propriétés évitent de recalculer des intégrales. Pour chacune, le sens physique :

| Propriété | Formule | En clair |
|---|---|---|
| **Linéarité** | $\mathcal F(a f_1+bf_2)=aF_1+bF_2$ | spectre d'une somme = somme des spectres |
| **Convolution** | $\boxed{\mathcal F(f_1*f_2)=F_1\cdot F_2}$ | la convolution (compliquée) devient un produit (simple). C'est la base de tout le cours de systèmes : sortie = $H\times$ entrée |
| **Produit** | $\mathcal F(f_1\cdot f_2)=F_1*F_2$ | et réciproquement |
| **Retard** | $s(t-t_0)\ \to\ \boxed{S(f)\,e^{-i2\pi ft_0}}$ | retarder un signal ne change pas son spectre d'amplitude ($|e^{\dots}|=1$), seulement sa phase |
| **Dirac** | $\boxed{\mathcal F(\delta)=1}$ | spectre plat (voir §2.1.2) |
| **Cosinoïde** | $\mathcal F\big(\hat X\cos(2\pi f_0t+\varphi)\big)=\frac{\hat X}2\delta(f+f_0)e^{-i\varphi}+\frac{\hat X}2\delta(f-f_0)e^{i\varphi}$ | une sinusoïde = **deux raies** en $\pm f_0$, chacune de hauteur $\frac{\hat X}2$ |

avec la convolution définie par $(F_1*F_2)(f)=\int_{-\infty}^{+\infty}F_1(\nu)F_2(f-\nu)\,d\nu$.

**Signal réel → symétries du spectre.** En séparant $e^{-i2\pi ft}=\cos-i\sin$ :
$$S(f)=\int s(t)\cos(2\pi ft)\,dt-i\int s(t)\sin(2\pi ft)\,dt$$
Comme cos est pair et sin impair : $\mathrm{Re}\,S$ est paire et $\mathrm{Im}\,S$ impaire. Donc :
- $|S(f)|$ est **paire** ;
- $\arg S(f)$ est **impaire** ;
- $S(-f)=\overline{S(f)}$.

C'est pour ça que tous les spectres d'amplitude du cours sont symétriques.

**Énergie — Parseval-Plancherel** :
$$\boxed{E=\int_{-\infty}^{+\infty}s(t)^2\,dt=\int_{-\infty}^{+\infty}|S(f)|^2\,df}$$
On peut calculer l'énergie en temps ou en fréquence, on trouve la même chose. $|S(f)|^2$ s'appelle la **densité spectrale d'énergie** : elle indique comment l'énergie se répartit entre les fréquences.

---

### 2.1.4 Modulation d'amplitude

Le prof ne présente pas ça comme de la radio, mais comme un **outil pour Shannon**.

**Montage** : on multiplie un signal **modulant** $m(t)$ par une **porteuse** $p(t)=\hat P\cos(2\pi f_pt)$ :
$$x(t)=m(t)\cdot p(t)$$

![](contenu/automatique/cours/img/principe_modulation_amplitude_qoPL.jpg)

**Calcul de $X(f)$**, connaissant $M(f)$. On remplace le cos par $\frac{e^{i\cdot}+e^{-i\cdot}}2$ :
$$X(f)=\int m(t)\,\hat P\,\frac{e^{i2\pi f_pt}+e^{-i2\pi f_pt}}2\,e^{-i2\pi ft}\,dt=\frac{\hat P}2\left[\int m(t)e^{-i2\pi(f-f_p)t}dt+\int m(t)e^{-i2\pi(f+f_p)t}dt\right]$$
La première intégrale est la définition de $M$, évaluée en $f-f_p$. La seconde, en $f+f_p$ :
$$\boxed{X(f)=\frac{\hat P}2M(f-f_p)+\frac{\hat P}2M(f+f_p)}$$

![](contenu/automatique/cours/img/spectre_modulation_amplitude_qoPL.jpg)

> [!success] Ce qu'il faut retenir
> **Multiplier par un cosinus de fréquence $f_p$ = recopier le spectre autour de $+f_p$ et de $-f_p$, avec un facteur $\frac{\hat P}2$.**
> La forme du spectre est conservée : l'information de $m$ est toujours là, simplement déplacée vers les hautes fréquences.

---

### 2.1.5 Shannon

*Du signal analogique au signal échantillonné : le théorème de Shannon.*

> [!question] Le problème
> Un automate ou un PC ne voit pas $x(t)$ en continu. Il lit $x_n=x(nT_e)$ toutes les $T_e$ secondes ($f_e=\frac1{T_e}$ = fréquence d'échantillonnage).
> - $f_e$ trop faible : on rate des variations, et le signal est mal représenté.
> - $f_e$ trop forte : ça marche, mais on stocke beaucoup trop de valeurs.
>
> **Quelle $f_e$ minimale permet de reconstituer exactement $x(t)$ ?**
> Méthode du prof : comparer le spectre de $x$ et celui du signal échantillonné.

**Étape 1 — Écrire l'échantillonnage comme une multiplication.**
On représente les échantillons par un « signal » fait de Diracs de poids $x_n$ :
$$x^*(t)=\sum_{n=-\infty}^{+\infty}x_n\,\delta(t-nT_e)$$
Or $\delta(t-nT_e)$ est nul partout sauf en $t=nT_e$, donc $x(nT_e)\,\delta(t-nT_e)=x(t)\,\delta(t-nT_e)$. On peut sortir $x(t)$ de la somme :
$$\boxed{x^*(t)=x(t)\cdot\underbrace{\sum_n\delta(t-nT_e)}_{Ш(t)}}$$
**Échantillonner = multiplier par le peigne de Dirac $Ш$** (un Dirac toutes les $T_e$).

![](contenu/automatique/cours/img/peigne_temporel_dirac_ThBh.jpg)

⚠️ $x^*$ n'existe qu'en maths : on ne fabrique pas de vrais Diracs. Il sert seulement à faire le calcul.

**Étape 2 — Spectre du peigne.**
$Ш$ est la limite de $Ш_a$ (§2.1.1) quand $t_0\to0$, avec $T=T_e$. On a déjà fait le calcul : toutes les raies valent $\frac1{T_e}=f_e$, à chaque multiple de $f_e$. Le spectre d'un peigne en temps est **un peigne en fréquence**, avec une phase nulle partout.

![](contenu/automatique/cours/img/spectre_peigne_frequentiel_ThBh.jpg)

En série de Fourier ($c_n=\frac1{T_e}$ pour tout $n$, et on regroupe $n$ et $-n$) :
$$Ш(t)=\frac1{T_e}+\frac2{T_e}\sum_{n=1}^{+\infty}\cos(2\pi nf_et)$$

**Étape 3 — Multiplier par $x$ et appliquer la modulation.**
$$x^*(t)=x(t)\cdot Ш(t)=\frac1{T_e}\Big[x(t)+2\sum_{n\ge1}x(t)\cos(2\pi nf_et)\Big]$$
Chaque terme $x(t)\cos(2\pi nf_et)$ est une modulation de porteuse $nf_e$ (avec $\hat P=2$ ici, donc facteur $\frac{\hat P}2=1$). D'après §2.1.4 :
$$\boxed{X^*(f)=\frac1{T_e}\Big[X(f)+\sum_{n=1}^{+\infty}\big(X(f+nf_e)+X(f-nf_e)\big)\Big]}$$

> [!important] La phrase à retenir
> **Le spectre du signal échantillonné est le spectre de $x$ recopié tous les $f_e$ (et multiplié par $\frac1{T_e}$).**

**Étape 4 — Deux cas.** On part d'un signal $x$ dont la plus grande fréquence est $f_M$ :

![](contenu/automatique/cours/img/spectre_shannon_1_ThBh.jpg)

Chaque copie occupe $[nf_e-f_M,\ nf_e+f_M]$. La copie centrale se termine en $f_M$ et la suivante commence en $f_e-f_M$. Elles ne se touchent pas si $f_e-f_M\ge f_M$, soit $f_e\ge2f_M$.

**Cas $f_e\ge2f_M$** : les copies sont séparées.

![](contenu/automatique/cours/img/spectre_shannon_2_ThBh.jpg)

On retrouve intact $|X(f)|$ (en rouge) dans $|X^*(f)|$ (en bleu, au facteur $\frac1{T_e}$ près). Même chose pour la phase.

**Cas $f_e<2f_M$** : les copies se chevauchent.

![](contenu/automatique/cours/img/spectre_shannon_3_ThBh.jpg)

Dans les zones marquées « ? », le spectre est la **somme de deux nombres complexes** issus de deux copies différentes. On ne peut plus les séparer, et l'information est **perdue** dans les intervalles $]f_e-f_M+kf_e,\ f_M+kf_e[$. C'est le **repliement de spectre**.

**Étape 5 — Reconstruire.**
Dans le premier cas, un **filtre passe-bas idéal** de coupure $\frac{f_e}2$ et de gain $T_e$ :
- garde la copie centrale et compense le facteur $\frac1{T_e}$ ;
- supprime toutes les autres copies.

En sortie, on récupère exactement $x$. Dans le second cas c'est impossible : les « ? » sont mélangés dans la bande gardée.

> [!success] Théorème de Shannon
> Pour qu'un signal analogique $x$ de fréquence maximale $f_M$ puisse être **reconstitué** à partir de ses échantillons prélevés à $f_e$, il faut :
> $$\boxed{f_e\ \ge\ 2f_M}$$

**En pratique — filtre anti-repliement.** Un vrai signal contient toujours un peu de bruit à haute fréquence, donc $f_M$ n'est jamais vraiment borné. Avant d'échantillonner, on place un **filtre passe-bas de coupure $\frac{f_e}2$** qui coupe tout ce qui dépasserait. C'est le *filtre anti-repliement*, placé **avant** le CAN.

> [!example] Ce que donne le repliement concrètement
> Une sinusoïde à 7 kHz échantillonnée à $f_e=10$ kHz ($\frac{f_e}2=5$ kHz < 7 kHz). La copie centrée sur $f_e$ apporte une raie en $10-7=$ **3 kHz**. Les échantillons sont *identiques* à ceux d'une sinusoïde à 3 kHz : on « voit » un signal qui n'existe pas.
> Règle : une fréquence $f>\frac{f_e}2$ réapparaît en $|f-kf_e|$, ramenée dans $[0,\frac{f_e}2]$.
> Même effet que les roues de voiture qui semblent tourner à l'envers dans une vidéo.

*Le prof annonce pour plus tard* la formule qui reconstruit $x(t)$ à partir des échantillons (une fois les filtres étudiés) : c'est l'interpolation de Shannon, $x(t)=\sum_nx_n\,\mathrm{sinc}\big(\pi f_e(t-nT_e)\big)$.

---

## 2.2 Signaux analogiques causaux : transformée de Laplace

> [!warning] Page du prof pas encore téléchargée : contenu standard, à vérifier.

Fourier ne converge pas pour un échelon ou une rampe, et ne tient pas compte des conditions initiales. Pour un signal **causal** ($x(t)=0$ pour $t<0$) :

$$X(p)=\mathcal{L}[x](p)=\int_0^{+\infty}x(t)\,e^{-pt}\,dt,\qquad p\in\mathbb{C}$$

En prenant $p=i2\pi f$, on retrouve Fourier.

| $x(t)$ (causal) | $X(p)$ |
|---|---|
| $\delta(t)$ | $1$ |
| $u(t)$ (échelon) | $\dfrac1p$ |
| $t\,u(t)$ (rampe) | $\dfrac1{p^2}$ |
| $e^{-at}u(t)$ | $\dfrac1{p+a}$ |
| $t\,e^{-at}u(t)$ | $\dfrac1{(p+a)^2}$ |
| $\sin(\omega t)\,u(t)$ | $\dfrac{\omega}{p^2+\omega^2}$ |
| $\cos(\omega t)\,u(t)$ | $\dfrac{p}{p^2+\omega^2}$ |

| En temps | En Laplace |
|---|---|
| $x'(t)$ | $pX(p)-x(0^+)$ |
| $\int_0^t x$ | $X(p)/p$ |
| retard $x(t-\tau)$ | $e^{-\tau p}X(p)$ |
| $x*y$ | $X\cdot Y$ |

- **Valeur initiale** : $x(0^+)=\lim_{p\to+\infty}pX(p)$.
- **Valeur finale** : $\lim_{t\to+\infty}x(t)=\lim_{p\to0}pX(p)$, si elle existe.
- Réflexe : dériver = ×$p$, intégrer = ÷$p$. Une équation différentielle devient algébrique. Voir aussi Chapitre 3 - Transformation de Laplace (cours de maths).

## 2.3 Signaux échantillonnés causaux : transformée en z

> [!warning] Page du prof pas encore téléchargée : contenu standard, à vérifier.

$$X(z)=\sum_{n=0}^{+\infty}x_n\,z^{-n}$$

Lien avec Laplace : appliquer Laplace à $x^*(t)=\sum x_n\delta(t-nT_e)$ donne $\sum x_ne^{-nT_ep}$, donc **$z=e^{pT_e}$**. Multiplier par $z^{-1}$ = **retarder d'une période d'échantillonnage**.

| $x_n$ | $X(z)$ |
|---|---|
| impulsion (1 en $n=0$) | $1$ |
| échelon | $\dfrac{z}{z-1}$ |
| $n$ | $\dfrac{z}{(z-1)^2}$ |
| $a^n$ | $\dfrac{z}{z-a}$ |

- Retard : $x_{n-k}\to z^{-k}X(z)$ ; avance : $x_{n+1}\to zX(z)-zx_0$.
- Valeur finale : $\lim_{n\to\infty}x_n=\lim_{z\to1}(z-1)X(z)$.
- Réflexe : une équation de récurrence (ce que calcule un automate à chaque cycle) devient algébrique en $z$.

---

## À retenir

- Périodique → raies tous les $f_0$ ($c_n=\frac{a_n}2-i\frac{b_n}2$). Non périodique → spectre continu $S(f)$.
- Porte de largeur $t_0$ → sinc avec zéros tous les $\frac1{t_0}$. Court en temps ⇔ large en fréquence.
- Signal réel : amplitude paire, phase impaire.
- Multiplier par $\cos(2\pi f_pt)$ → spectre recopié en $\pm f_p$.
- Échantillonner = multiplier par le peigne → spectre recopié tous les $f_e$ → **$f_e\ge2f_M$**, sinon repliement. Filtre anti-repliement à $\frac{f_e}2$ **avant** le CAN.
